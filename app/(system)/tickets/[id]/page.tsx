"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import Icon from "@/components/ui/icons";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { getInitials } from "@/shared/get-initials";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PRIORITY_CONFIG, type Ticket } from "../components/columns";

type TicketCommentImage = {
  id: string;
  name: string;
  title: string;
  type: string;
  extension: string;
  thumbnail_large: string;
  thumbnail_medium: string;
  thumbnail_small: string;
  url: string;
};

type TicketCommentBlock = {
  text?: string;
  type?: string;
  image?: TicketCommentImage;
  attributes?: Record<string, unknown>;
};

type TicketCommentUser = {
  id: number;
  username: string;
  email: string;
  color: string;
  initials: string;
  profilePicture: string;
};

type TicketComment = {
  id: string;
  comment: TicketCommentBlock[];
  comment_text: string;
  user: TicketCommentUser;
  assignee: unknown;
  group_assignee: unknown;
  reactions: unknown[];
  date: string;
  reply_count: number;
};

type TicketDetailsResponse = {
  id: string;
  name: string;
  description: string;
  status: string;
  date_created: string;
  date_closed: string | null;
  priority: string;
  company: string;
  comments: TicketComment[];
  _links: {
    self: {
      href: string;
      method: string;
    };
  };
};

type ChatAttachment = {
  id: string;
  name: string;
  size: number;
};

type ChatMessage = {
  id: number;
  fromCurrentUser: boolean;
  text: string;
  createdAt: Date;
  isPrivate: boolean;
  attachments?: ChatAttachment[];
  fileUrl?: string | null;
  fullImageUrl?: string | null;
  authorFirstName?: string;
  authorLastName?: string;
};

type ChecklistItem = {
  id: number;
  text: string;
  completed: boolean;
};

type TicketActionType = "finalizar" | "pendencia" | "cancelar";

const TICKETS_DETAILS_API_URL = "http://localhost:8030/dev/tickets";

const fetcher = ([url, token]: [string, string]) =>
  axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data);

function formatDateTime(date: Date) {
  try {
    return date.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "";

  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

export default function TicketDetailsPage() {
  const { data: session } = useSession();
  const { id } = useParams<{ id: string }>();
  const accessToken = session?.accessToken as string | undefined;

  const {
    data: detailsResponse,
    error: ticketError,
    isLoading: ticketLoading,
  } = useSWR<TicketDetailsResponse>(
    id && accessToken
      ? [`${TICKETS_DETAILS_API_URL}/${id}/details`, accessToken]
      : null,
    fetcher
  );

  const ticket: Ticket | null = detailsResponse
    ? {
        id: detailsResponse.id,
        nome: detailsResponse.name,
        cliente: detailsResponse.company,
        prioridade: detailsResponse.priority,
        dataCriacao: detailsResponse.date_created,
        dataEncerramento: detailsResponse.date_closed ?? "",
        status: detailsResponse.status,
      }
    : null;

  const currentUserId: string | null =
    (session?.user as { id?: string } | undefined)?.id ?? null;

  const normalizedPriority = ticket?.prioridade
    ? String(ticket.prioridade).trim().toLowerCase()
    : "";

  const priorityConfig =
    normalizedPriority && ticket
      ? PRIORITY_CONFIG[normalizedPriority] ??
        PRIORITY_CONFIG[String(Number(normalizedPriority))] ??
        null
      : null;

  const priorityLabel =
    priorityConfig?.label ?? (ticket?.prioridade ?? "—");

  const priorityVariant = priorityConfig?.variant ?? "secondary";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [supportText, setSupportText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const supportTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    "details" | "user" | "company" | "checklist"
  >("details");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const emojiList = [
    "😀",
    "😁",
    "😂",
    "🤣",
    "😊",
    "😍",
    "🤔",
    "👍",
    "🙌",
    "🔥",
    "✅",
    "❌",
    "🚀",
    "💬",
    "🎉",
  ];

  function handleSendSupportMessage(event: FormEvent) {
    event.preventDefault();

    if (!supportText.trim()) return;

    setMessages((prev) => {
      const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;

      return [
        ...prev,
        {
          id: nextId,
          fromCurrentUser: true,
          authorFirstName: undefined,
          authorLastName: undefined,
          text: supportText.trim(),
          createdAt: new Date(),
          isPrivate: false,
          attachments: [],
        },
      ];
    });

    setSupportText("");
  }

  function handleTogglePrivate(messageId: number) {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? { ...message, isPrivate: !message.isPrivate }
          : message
      )
    );
  }

  function handleOpenFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;

    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);

    setMessages((previousMessages) => {
      let lastId = previousMessages.length
        ? previousMessages[previousMessages.length - 1].id
        : 0;

      const newMessages: ChatMessage[] = files.map((file) => {
        const attachment: ChatAttachment = {
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random() * 1000}`,
          name: file.name,
          size: file.size,
        };

        lastId += 1;

        return {
          id: lastId,
          fromCurrentUser: true,
          text: "",
          createdAt: new Date(),
          isPrivate: false,
          attachments: [attachment],
        };
      });

      return [...previousMessages, ...newMessages];
    });

    // Permite selecionar o mesmo arquivo novamente no futuro, se necessário
    event.target.value = "";
  }

  function handleAddChecklistItem(event: FormEvent) {
    event.preventDefault();

    if (!newChecklistText.trim()) return;

    setChecklistItems((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        text: newChecklistText.trim(),
        completed: false,
      },
    ]);

    setNewChecklistText("");
  }

  function handleRemoveChecklistItem(id: number) {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleToggleChecklistItem(id: number) {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }

  function applyFormatting(type: "bold" | "italic") {
    const textarea = supportTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const wrapper = type === "bold" ? "**" : "_";

    setSupportText((prev) => {
      const selected = prev.slice(start, end) || "texto";
      const before = prev.slice(0, start);
      const after = prev.slice(end);
      const next = before + wrapper + selected + wrapper + after;

      const cursorPos = before.length + wrapper.length + selected.length;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);
      });

      return next;
    });
  }

  function handleAddEmoji(emoji: string) {
    const textarea = supportTextareaRef.current;
    if (!textarea) {
      setSupportText((prev) => prev + emoji);
      setShowEmojiPicker(false);
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    setSupportText((prev) => {
      const before = prev.slice(0, start);
      const after = prev.slice(end);
      const next = before + emoji + after;
      const cursorPos = before.length + emoji.length;

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);
      });

      return next;
    });
    setShowEmojiPicker(false);
  }

  function handleTicketAction(action: TicketActionType) {
    console.log("Ação de ticket:", action);
    // TODO: integrar com API para atualizar o status do ticket
  }

  useEffect(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!detailsResponse) return;

    const comments = detailsResponse.comments ?? [];
    const sortedComments = [...comments].sort((a, b) => {
      const aTime = Number(a.date);
      const bTime = Number(b.date);

      if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
        return 0;
      }

      // Mais antigo primeiro (considerando data e hora)
      return aTime - bTime;
    });

    const descriptionMessage: ChatMessage | null = detailsResponse.description
      ? {
          id: 1,
          fromCurrentUser: false,
          text: detailsResponse.description,
          createdAt: new Date(detailsResponse.date_created),
          isPrivate: false,
          attachments: [],
          fileUrl: null,
          fullImageUrl: null,
          authorFirstName: undefined,
          authorLastName: undefined,
        }
      : null;

    const mappedMessages: ChatMessage[] = sortedComments.map(
      (comment, index) => {
      const normalizedCurrentEmail = (session?.user?.email ?? "")
        .trim()
        .toLowerCase();
      const normalizedCommentEmail = (comment.user?.email ?? "")
        .trim()
        .toLowerCase();

      const imageBlock =
        comment.comment?.find((block) => block.type === "image") ?? null;
      const image = imageBlock?.image;

        return {
          id: descriptionMessage ? index + 2 : index + 1,
          fromCurrentUser:
            !!normalizedCurrentEmail &&
            normalizedCommentEmail === normalizedCurrentEmail,
          text: comment.comment_text,
          createdAt: new Date(Number(comment.date)),
          isPrivate: false,
          attachments: [],
          // usa imagem média no chat e o thumbnail_large (maior) no dialog
          fileUrl:
            image?.thumbnail_medium ??
            image?.thumbnail_small ??
            image?.thumbnail_large ??
            image?.url ??
            null,
          fullImageUrl:
            image?.thumbnail_large ??
            image?.url ??
            image?.thumbnail_medium ??
            image?.thumbnail_small ??
            null,
          authorFirstName: comment.user?.username ?? undefined,
          authorLastName: undefined,
        };
      }
    );

    const allMessages: ChatMessage[] = descriptionMessage
      ? [descriptionMessage, ...mappedMessages]
      : mappedMessages;

    setMessages(allMessages);

    setChecklistItems((prev) => (prev.length ? prev : []));
  }, [detailsResponse, currentUserId, session]);

  function isImageUrl(url: string | null | undefined): boolean {
    if (!url) return false;

    try {
      const cleanUrl = url.split("?")[0] ?? "";
      return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(cleanUrl);
    } catch {
      return false;
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between px-10 pt-10 pb-4">
        <div className="flex items-center gap-x-3">
          <Icon name="Ticket" className="text-primary" size={24} />
          <div>
            <h4 className="text-lg font-semibold capitalize">
              {ticket?.nome ?? "Detalhes do ticket"}
            </h4>
            <p className="text-muted-foreground text-sm capitalize">
              #{ticket?.id ?? id}
            </p>
          </div>
        </div>

        <Button asChild size="sm">
          <Link href="/tickets" className="flex items-center gap-2">
            <Icon name="ArrowLeft" size={16} />
            <span>Voltar</span>
          </Link>
        </Button>
      </header>

      <main className="flex min-h-0 flex-1 gap-4 px-10 pr-0 pb-4">
        <section className="bg-background/50 flex h-[70vh] min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-lg p-4">
          <div className="flex min-h-0 flex-1 flex-col rounded-md p-4">
            <div
              ref={messagesContainerRef}
              className="flex flex-1 flex-col gap-3 overflow-y-auto pr-2"
            >
              {messages.map((message) => {
                const isCurrentUser = message.fromCurrentUser;
                const fullName =
                  (message.authorFirstName || message.authorLastName
                    ? `${message.authorFirstName ?? ""} ${
                        message.authorLastName ?? ""
                      }`.trim()
                    : "") || (isCurrentUser ? "Você" : "Usuário");
                const initials = getInitials(fullName);
                const isPrivate = message.isPrivate;

                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isCurrentUser && (
                      <Avatar>
                        <AvatarFallback className="bg-muted text-xs font-semibold uppercase">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`flex w-[70%] flex-col gap-1 ${
                        isCurrentUser ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`w-full ${
                          isCurrentUser
                            ? `rounded-lg border-2 border-dashed p-0.5 ${
                                isPrivate
                                  ? "border-primary"
                                  : "border-transparent"
                              }`
                            : ""
                        }`}
                      >
                        <div
                          className={`w-full rounded-lg px-3 py-2 text-sm ${
                            isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="mb-1 text-[10px] font-semibold tracking-wide uppercase opacity-70">
                            {isCurrentUser ? "Você" : fullName}
                          </p>
                          {message.text && <p>{message.text}</p>}

                          {message.fileUrl && (
                            <div className="mt-2">
                              {isImageUrl(message.fileUrl) ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewImageUrl(
                                      message.fullImageUrl ?? message.fileUrl
                                    )
                                  }
                                  className="focus-visible:ring-ring/60 rounded-md focus-visible:outline-none focus-visible:ring-2"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={message.fileUrl}
                                    alt="Anexo do ticket"
                                    className="max-h-48 w-auto rounded-md border border-border object-contain"
                                  />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    window.open(
                                      message.fileUrl as string,
                                      "_blank"
                                    )
                                  }
                                  className="hover:bg-black/5 focus-visible:ring-ring/60 mt-1 inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs underline focus-visible:outline-none focus-visible:ring-2"
                                >
                                  <Icon name="FileText" size={14} />
                                  <span>Baixar anexo</span>
                                </button>
                              )}
                            </div>
                          )}

                          {message.attachments &&
                            message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1 pt-1 text-xs">
                                {message.attachments.map((file) => (
                                  <button
                                    key={file.id}
                                    type="button"
                                    onClick={() =>
                                      console.log(
                                        "Download fictício do arquivo:",
                                        file.name
                                      )
                                    }
                                    className="focus-visible:ring-ring/60 flex w-full items-start gap-2 rounded-md px-0.5 py-0.5 text-left hover:bg-black/5 focus-visible:ring-2 focus-visible:outline-none"
                                  >
                                    <Icon name="Paperclip" size={14} />
                                    <div className="flex-1">
                                      <p className="truncate text-xs font-medium">
                                        {file.name}
                                      </p>
                                      <p className="text-[10px] opacity-70">
                                        {formatFileSize(file.size)}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="text-muted-foreground flex w-full items-center justify-between px-1 text-[10px]">
                        {isCurrentUser ? (
                          <button
                            type="button"
                            onClick={() => handleTogglePrivate(message.id)}
                            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[10px]"
                          >
                            <Icon
                              name={isPrivate ? "LockOpen" : "Lock"}
                              size={12}
                            />
                            <span>
                              {isPrivate ? "Tornar pública" : "Tornar privada"}
                            </span>
                          </button>
                        ) : (
                          <span />
                        )}

                        <span>{formatDateTime(message.createdAt)}</span>
                      </div>
                    </div>

                    {isCurrentUser && (
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold uppercase">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}

              {messages.length === 0 && (
                <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                  Nenhuma mensagem ainda. Envie a primeira resposta do suporte.
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSendSupportMessage}
            className="mt-2 flex flex-col gap-2"
          >
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Textarea
                  ref={supportTextareaRef}
                  placeholder="Digite aqui a resposta do suporte..."
                  value={supportText}
                  onChange={(event) => setSupportText(event.target.value)}
                  className="min-h-16 pr-32"
                />

                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyFormatting("bold")}
                    className="hover:bg-muted flex h-7 w-7 items-center justify-center rounded text-xs font-semibold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting("italic")}
                    className="hover:bg-muted flex h-7 w-7 items-center justify-center rounded text-xs italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((previous) => !previous)}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-7 w-7 items-center justify-center rounded"
                  >
                    <Icon name="Smile" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenFilePicker}
                    className="text-muted-foreground hover:text-foreground flex h-7 w-7 items-center justify-center rounded-md"
                  >
                    <Icon name="Paperclip" size={16} />
                  </button>
                </div>

                {showEmojiPicker && (
                  <div className="bg-card border-border absolute right-2 bottom-12 z-20 max-h-56 w-64 overflow-y-auto rounded-md border p-2 shadow-md">
                    <div className="grid grid-cols-8 gap-1 text-xl">
                      {emojiList.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleAddEmoji(emoji)}
                          className="hover:bg-muted flex items-center justify-center rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFilesSelected}
                />
              </div>

              <div className="flex items-center gap-1 self-end">
                <Button type="submit">Enviar</Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                    >
                      <Icon name="ChevronUp" size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onSelect={() => handleTicketAction("finalizar")}
                      className="text-xs"
                    >
                      Finalizar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleTicketAction("pendencia")}
                      className="text-xs"
                    >
                      Pendência
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleTicketAction("cancelar")}
                      className="text-xs"
                      variant="destructive"
                    >
                      Cancelar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </form>
        </section>

        <aside
          className={`bg-card flex h-full flex-col transition-all ${
            sidebarCollapsed ? "w-12 rounded-md" : "w-[28rem] rounded-md"
          }`}
        >
          <div className="flex h-full">
            <div className="flex w-12 flex-col items-center gap-2 px-1 py-2">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground bg-background/40 flex h-8 w-8 items-center justify-center rounded-md"
              >
                <Icon
                  name={sidebarCollapsed ? "ChevronLeft" : "ChevronRight"}
                  size={16}
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setActiveSidebarTab("details");
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs ${
                  activeSidebarTab === "details"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon name="Info" size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setActiveSidebarTab("user");
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs ${
                  activeSidebarTab === "user"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon name="UserRound" size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setActiveSidebarTab("company");
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs ${
                  activeSidebarTab === "company"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon name="Building2" size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setActiveSidebarTab("checklist");
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs ${
                  activeSidebarTab === "checklist"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon name="ListChecks" size={16} />
              </button>
            </div>

            {!sidebarCollapsed && (
              <div className="flex-1 overflow-y-auto p-4 text-xs">
                {activeSidebarTab === "details" && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold">
                      Detalhes do ticket
                    </h5>
                    <p className="text-muted-foreground text-[11px]">
                      Resumo e informações gerais deste ticket.
                    </p>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID</span>
                        <span className="font-medium">
                          #{ticket?.id ?? id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Título</span>
                        <span className="font-medium">
                          {ticket?.nome ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium">
                          {ticket?.status ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Criado em</span>
                        <span className="font-medium">
                          {ticket?.dataCriacao ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Data de encerramento
                        </span>
                        <span className="font-medium">
                          {ticket?.dataEncerramento
                            ? ticket.dataEncerramento
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cliente</span>
                        <span className="font-medium">
                          {ticket?.cliente ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prioridade</span>
                        <span className="font-medium">
                          {ticket ? (
                            <Badge variant={priorityVariant}>
                              {priorityLabel}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSidebarTab === "user" && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold">Dados do usuário</h5>
                    <p className="text-muted-foreground text-[11px]">
                      Informações do usuário que abriu o ticket.
                    </p>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nome</span>
                        <span className="font-medium capitalize">
                          {apiTicket
                            ? `${apiTicket.usuario_primeiro_nome} ${
                                apiTicket.usuario_ultimo_nome ?? ""
                              }`.trim()
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">E-mail</span>
                        <span className="font-medium">
                          {apiTicket?.usuario_email ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefone</span>
                        <span className="font-medium">
                          {apiTicket?.usuario_celular_contato ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSidebarTab === "company" && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold">Dados da empresa</h5>
                    <p className="text-muted-foreground text-[11px]">
                      Informações da empresa vinculada ao usuário.
                    </p>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Empresa</span>
                        <span className="font-medium">
                          {ticket?.cliente ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CNPJ</span>
                        <span className="font-medium">
                          {apiTicket?.cliente_cnpj ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contato</span>
                        <span className="font-medium">
                          {apiTicket?.cliente_celular_contato ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSidebarTab === "checklist" && (
                  <div className="flex h-full flex-col gap-3">
                    <div>
                      <h5 className="text-sm font-semibold">
                        Checklists de atendimento
                      </h5>
                      <p className="text-muted-foreground text-[11px]">
                        Use esta lista para controlar os passos do atendimento.
                      </p>
                    </div>

                    <form
                      onSubmit={handleAddChecklistItem}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={newChecklistText}
                        onChange={(event) =>
                          setNewChecklistText(event.target.value)
                        }
                        placeholder="Adicionar item..."
                        className="border-input focus-visible:ring-ring/50 placeholder:text-muted-foreground flex-1 rounded-md border bg-transparent px-2 py-1 text-[11px] outline-none focus-visible:ring-[2px]"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="px-2 text-[11px]"
                      >
                        +
                      </Button>
                    </form>

                    <div className="space-y-1">
                      {checklistItems.length === 0 && (
                        <p className="text-muted-foreground text-[11px]">
                          Nenhum item adicionado ainda.
                        </p>
                      )}

                      {checklistItems.map((item) => (
                        <div
                          key={item.id}
                          className="border-muted bg-muted/40 flex items-center justify-between gap-2 rounded-md border px-2 py-1"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() =>
                                handleToggleChecklistItem(item.id)
                              }
                              className="border-primary/60 bg-background mt-[1px] h-5 w-5 shadow-sm"
                            />
                            <span
                              className={`text-[11px] ${
                                item.completed
                                  ? "text-muted-foreground line-through"
                                  : ""
                              }`}
                            >
                              {item.text}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(item.id)}
                            className="text-muted-foreground hover:text-foreground rounded-full p-0.5"
                            aria-label="Remover item"
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </main>
      <Dialog
        open={!!previewImageUrl}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPreviewImageUrl(null);
        }}
      >
        <DialogContent className="bg-transparent p-0 sm:max-w-[90vw] shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualizar imagem do ticket</DialogTitle>
            <DialogDescription>
              Pré-visualização ampliada do anexo da conversa.
            </DialogDescription>
          </DialogHeader>

          {previewImageUrl && (
            <div className="flex max-h-[90vh] items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt="Pré-visualização do anexo"
                className="max-h-[90vh] max-w-[90vw] rounded-lg border border-border object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
