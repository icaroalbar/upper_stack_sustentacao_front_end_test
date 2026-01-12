"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon, { IconNames } from "@/components/ui/icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import useSWR from "swr";
import { demand, demandValues, priority } from "../priority";
import { getInitials } from "@/shared/get-initials";
import { API_BASE_URL } from "@/shared/api";
import type { Session } from "next-auth";

type TicketUser = {
  id: string;
  name: string;
  email?: string;
  phone_number: string;
  company: string;
};

type UsersApiUser = {
  id: string;
  email: string | null;
  company: string | null;
  whatsapp: string | null;
  name: string | null;
  phoneNumber: string | null;
};

type UsersApiResponse = {
  total: number;
  users: UsersApiUser[];
  _links: {
    self: {
      href: string;
      method: string;
    };
  };
};

type DialogTicketProps = {
  session: Session | null;
  isAdmin: boolean;
  onTicketCreated?: (result: { success: boolean; message: string }) => void;
};

const priorityValues = priority.map((item) => item.value) as [
  string,
  ...string[],
];

const formSchema = z.object({
  name: z.string().optional(),
  subject: z.string().min(2, {
    message: "O assunto é obrigatório.",
  }),
  message: z.string().min(2, {
    message: "A mensagem é obrigatória.",
  }),
  objects: z.any().optional(),
  type: z.enum(demandValues),
  priority: z.enum(priorityValues),
});

type TicketFormValues = z.infer<typeof formSchema>;

type TicketCreateResponse = {
  ticket?: {
    id?: string;
  };
  id?: string;
};

const API_URL = API_BASE_URL;
const USERS_API_URL =
  process.env.NEXT_PUBLIC_USERS_URL ?? "http://localhost:8030/dev/users";

const usersFetcher = ([url, token]: [string, string]) =>
  axios
    .get<UsersApiResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data);

export default function DialogTicket({
  session,
  isAdmin,
  onTicketCreated,
}: DialogTicketProps) {
  const [open, setOpen] = useState(false);
  const [disableForm, setDisableForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedUser, setSelectedUser] = useState<TicketUser | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      message: "",
      priority: priorityValues[0],
      type: demandValues[0],
      objects: [],
    },
  });

  const accessToken = session?.accessToken as string | undefined;

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useSWR<UsersApiResponse>(
    isAdmin && accessToken ? [USERS_API_URL, accessToken] : null,
    usersFetcher
  );

  const users: TicketUser[] =
    usersData?.users?.map((user) => ({
      id: user.id,
      name: (user.name ?? user.email ?? "").trim(),
      email: user.email ?? "",
      phone_number: user.phoneNumber ?? "",
      company: user.company ?? "",
    })) ?? [];
  const nameValue = form.watch("name") ?? "";

  const filteredUsers: TicketUser[] =
    isAdmin && nameValue && !selectedUser
      ? users.filter((user) =>
          user.name?.toString().toLowerCase().includes(nameValue.toLowerCase())
        )
      : [];

  const handleSelectUser = (user: TicketUser) => {
    setSelectedUser(user);
    form.setValue("name", user.name);
    form.clearErrors("name");
  };

  const removeFile = (indexToRemove: number) => {
    const newFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove
    );
    setSelectedFiles(newFiles);
    form.setValue("objects", newFiles);
  };

  const resetFormState = () => {
    form.reset({
      name: "",
      subject: "",
      message: "",
      priority: priorityValues[0],
      type: demandValues[0],
      objects: [],
    });
    setSelectedFiles([]);
    setSelectedUser(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  async function onSubmit(values: TicketFormValues) {
    if (!accessToken) {
      toast("Sessão expirada", {
        description: "Faça login novamente para abrir um ticket.",
      });
      return;
    }

    let targetUser: TicketUser | null = null;

    if (isAdmin) {
      const rawName = values.name ?? "";

      if (!rawName.trim()) {
        form.setError("name", {
          type: "manual",
          message: "O nome é obrigatório.",
        });
        return;
      }

      const searchValue = rawName.trim().toLowerCase();
      targetUser = selectedUser;

      if (!targetUser && searchValue && users.length > 0) {
        const matches = users.filter((user) =>
          user.name?.toString().toLowerCase().includes(searchValue)
        );

        if (matches.length === 1) {
          targetUser = matches[0];
        }
      }

      if (!targetUser) {
        form.setError("name", {
          type: "manual",
          message: "Selecione um usuário da lista.",
        });
        return;
      }
    }

    setDisableForm(true);

    try {
      const ticketUrl = `${API_URL}/tickets`;

      const payload = isAdmin
        ? {
            name: values.subject,
            description: values.message,
            priority: values.priority >= "5" ? "4" : values.priority,
            company: (targetUser as TicketUser).company,
            customer: (targetUser as TicketUser).name,
            whatsapp: (targetUser as TicketUser).phone_number,
            email: (targetUser as TicketUser).email ?? "",
            requestType: values.type,
          }
        : {
            name: values.subject,
            description: values.message,
            priority: values.priority >= "5" ? "4" : values.priority,
            requestType: values.type,
          };

      const newTicket = await axios.post<TicketCreateResponse>(ticketUrl, payload, {
        headers: {
          Authorization: accessToken,
        },
      });

      // A API de criação de tickets passou a responder no formato:
      // { ticket: { id, ... }, _links: { ... } }
      // Mantemos compatibilidade com o formato antigo (data.id) como fallback.
      const createdTicketId = newTicket.data.ticket?.id ?? newTicket.data.id;

      if (
        createdTicketId &&
        values.objects &&
        (values.objects as File[]).length > 0
      ) {
        const formData = new FormData();
        (values.objects as File[]).forEach((file) => {
          formData.append("file", file);
        });

        await axios.post(
          `${API_URL}/tickets/${createdTicketId}/attachments`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      onTicketCreated?.({
        success: true,
        message:
          "Ticket enviado com sucesso! Em breve, nossa equipe entrará em contato.",
      });
    } catch (error) {
      console.error(error);

      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message ??
          error.response?.data?.error ??
          error.response?.data?.message ??
          "Ocorreu um erro ao enviar o ticket. Tente novamente mais tarde."
        : "Ocorreu um erro ao enviar o ticket. Tente novamente mais tarde.";

      onTicketCreated?.({
        success: false,
        message,
      });
    } finally {
      setTimeout(() => {
        setDisableForm(false);
        resetFormState();
        setOpen(false);
      }, 500);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setOpen(false);
          resetFormState();
        } else {
          setOpen(true);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Icon name="Plus" />
          Novo ticket
        </Button>
      </DialogTrigger>
      <DialogContent
        disabled={disableForm}
        className="max-h-[90vh] w-full max-w-[80vw]"
      >
        <div className="max-h-[80vh] overflow-y-auto pr-1">
          <div
            className={`${
              disableForm ? "pointer-events-none opacity-50 select-none" : ""
            } grid gap-8 lg:grid-cols-2`}
          >
            <div className="space-y-6">
              <div className="flex items-start gap-x-3">
                <Button size="icon" className="hover:bg-primary mt-1" disabled>
                  <Icon name="Ticket" />
                </Button>
                <div>
                  <h5 className="text-lg font-semibold capitalize">tickets</h5>
                  <p className="text-sm font-light">
                    Formulário de abertura de tickets para a operação de
                    sustentação da{" "}
                    <span className="text-primary font-upper-stack">Upper</span>
                    <span className="font-upper-stack">Stack</span>.
                  </p>
                </div>
              </div>
              <p>
                Agora você pode abrir um ticket direto pela plataforma. Basta
                preencher o formulário ao lado e, em breve, nossa equipe entrará
                em contato por e-mail ou WhatsApp para atender sua solicitação o
                mais rápido possível.
              </p>
              <div className="mb-4">
                <h3 className="font-semibold">Categorias de abertura:</h3>
                <p className="text-sm font-light">
                  Veja abaixo a descrição de cada categoria.
                </p>
              </div>
              <ul className="ml-2 space-y-4">
                {priority.map((item, index) => (
                  <li key={index} className="w-fit cursor-pointer">
                    <div className="flex items-center gap-x-2">
                      <Icon
                        name={item.icon as IconNames}
                        className="text-primary"
                      />
                      <span className="font-medium">{item.gravity}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mb-2">
                <h3 className="font-semibold">Anexos:</h3>
                <p className="text-sm font-light">
                  Os envios de anexos têm limite de até 10MB no total de
                  arquivos, independentemente da quantidade enviada. Só serão
                  aceitos arquivos nos formatos JPG, JPEG e PNG.
                </p>
              </div>
            </div>
            <div>
              <DialogHeader className="mb-2 lg:hidden">
                <DialogTitle>Novo ticket</DialogTitle>
                <DialogDescription>
                  Preencha o formulário para abrir um novo ticket.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  autoComplete="off"
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {isAdmin && (
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            {!selectedUser ? (
                              <>
                                <FormLabel className="flex gap-1">
                                  Nome do usuário
                                  <span className="text-primary">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Digite o nome do usuário"
                                    autoComplete="off"
                                    {...field}
                                  />
                                </FormControl>
                                {usersLoading && (
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    Carregando usuários...
                                  </p>
                                )}
                                {usersError && (
                                  <p className="text-destructive mt-1 text-xs">
                                    Erro ao carregar usuários.
                                  </p>
                                )}
                                {filteredUsers.length > 0 &&
                                  nameValue.length >= 2 && (
                                    <div className="border-primary mt-2 max-h-48 overflow-y-auto rounded-md border text-sm">
                                      {filteredUsers.map((user) => (
                                        <button
                                          type="button"
                                          key={user.id}
                                          className="hover:bg-accent flex w-full items-center px-3 py-2 text-left"
                                          onClick={() => handleSelectUser(user)}
                                        >
                                          <Avatar className="mr-3 size-8">
                                            <AvatarFallback className="bg-primary font-semibold uppercase">
                                              {getInitials(user.name)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex flex-col">
                                            <span className="font-medium">
                                              {user.name}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                              {[
                                                user.email &&
                                                  user.email.trim(),
                                                user.company,
                                              ]
                                                .filter(Boolean)
                                                .join(" • ")}
                                            </span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                              </>
                            ) : (
                              <>
                                <FormLabel>Usuário selecionado</FormLabel>
                                <div className="border-primary mt-1 flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                  <div className="flex items-center gap-x-3">
                                    <Avatar className="size-8">
                                      <AvatarFallback className="bg-primary font-semibold uppercase">
                                        {getInitials(selectedUser.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {selectedUser.name}
                                      </span>
                                      <span className="text-muted-foreground text-xs">
                                        {[
                                          selectedUser.email &&
                                            selectedUser.email.trim(),
                                          selectedUser.company,
                                        ]
                                          .filter(Boolean)
                                          .join(" • ")}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedUser(null);
                                      form.setValue("name", "");
                                      form.clearErrors("name");
                                    }}
                                  >
                                    <Icon name="X" />
                                  </Button>
                                </div>
                              </>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex gap-1">
                            Assunto<span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite seu assunto"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex gap-1">
                            Mensagem<span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Digite sua mensagem"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 items-start gap-y-6 lg:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex gap-1">
                            Tipo de Solicitação
                            <span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="flex flex-col space-y-1"
                            >
                              {demand.map((item) => (
                                <FormItem
                                  key={item.id}
                                  className="flex items-center space-y-0 space-x-3"
                                >
                                  <FormControl className="cursor-pointer">
                                    <RadioGroupItem value={item.id} />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">
                                    {item.value}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex gap-1">
                            Categoria
                            <span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="flex flex-col space-y-1"
                            >
                              {priority.map((item, index) => (
                                <FormItem
                                  key={index}
                                  className="flex items-center space-y-0 space-x-3"
                                >
                                  <FormControl className="cursor-pointer">
                                    <RadioGroupItem value={item.value} />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">
                                    {item.gravity}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="objects"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Insira aqui os anexos sobre a sua solicitação
                        </FormLabel>
                        <FormLabel className="border-primary/30 cursor-pointer border-2 border-dashed text-center">
                          <FormControl>
                            <Input
                              type="file"
                              className="hidden"
                              multiple
                              ref={(e) => {
                                field.ref(e);
                                inputRef.current = e;
                              }}
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                  const fileArray = Array.from(files);

                                  const allowedTypes = [
                                    "image/jpeg",
                                    "image/jpg",
                                    "image/png",
                                  ];
                                  const invalidType = fileArray.find(
                                    (file) => !allowedTypes.includes(file.type)
                                  );

                                  if (invalidType) {
                                    toast("Arquivo inválido", {
                                      description:
                                        "Somente arquivos JPG, JPEG ou PNG são permitidos.",
                                    });
                                    return;
                                  }

                                  const totalSize = [
                                    ...selectedFiles,
                                    ...fileArray,
                                  ].reduce((acc, file) => acc + file.size, 0);

                                  const maxSize = 10 * 1024 * 1024; // 10MB

                                  if (totalSize > maxSize) {
                                    toast("Limite de tamanho excedido", {
                                      description:
                                        "O total de arquivos não pode ultrapassar 10MB.",
                                    });
                                    return;
                                  }

                                  const newFiles = [
                                    ...selectedFiles,
                                    ...fileArray,
                                  ];
                                  setSelectedFiles(newFiles);
                                  form.setValue("objects", newFiles, {
                                    shouldValidate: false,
                                  });

                                  if (inputRef.current) {
                                    inputRef.current.value = "";
                                  }
                                }
                              }}
                            />
                          </FormControl>
                          <span className="text-muted-foreground w-full py-6 text-center text-sm hover:underline hover:underline-offset-4">
                            {selectedFiles.length > 0
                              ? `📂 ${selectedFiles.length} arquivo(s) selecionado(s)`
                              : "Anexar Documentos"}
                          </span>
                        </FormLabel>
                        {selectedFiles.length > 0 && (
                          <ul className="text-muted-foreground mt-2 text-sm">
                            {selectedFiles.map((file, index) => (
                              <li
                                key={index}
                                className="flex w-fit items-center justify-between"
                              >
                                📄 {file.name}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFile(index)}
                                >
                                  <Icon name="Trash" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={disableForm}
                        onClick={() => {
                          resetFormState();
                        }}
                      >
                        Cancelar
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={disableForm}
                      className="w-32 justify-center"
                    >
                      {disableForm ? (
                        <Icon name="LoaderCircle" className="animate-spin" />
                      ) : (
                        "Abrir ticket"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
