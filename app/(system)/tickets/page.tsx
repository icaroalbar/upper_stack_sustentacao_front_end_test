"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import Icon, { IconNames } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/partials/data-table";
import { DialogConfirmation } from "@/components/partials/dialog-confirmation";
import { columns, type Ticket } from "./components/columns";
import DialogTicket from "./components/dialog-ticket";

type TicketsApiTicket = {
  id: string;
  name: string;
  priority: string;
  status: string;
  date_created: string;
  date_finished: string | null;
  company: string;
  email: string | null;
};

type TicketsApiResponse = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  tasks: TicketsApiTicket[];
  _links: {
    self: {
      href: string;
      method: string;
    };
  };
};

type SessionUserAuthResult = {
  AuthenticationResult?: {
    AccessToken?: string;
  };
};

type SessionWithAuth = {
  user?: SessionUserAuthResult;
};

type GroupsJwtPayload = {
  ["cognito:groups"]?: string | string[];
};

// Rota de listagem de tickets em ambiente de desenvolvimento
// Ex: http://localhost:8030/dev/tickets
const TICKETS_API_URL = "http://localhost:8030/dev/tickets";

const fetcher = ([url, token]: [string, string]) =>
  axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data);

function getGroupIdFromSession(
  session: SessionWithAuth | null | undefined
): number {
  const accessToken = session?.user?.AuthenticationResult?.AccessToken;

  if (!accessToken) {
    return 4;
  }

  try {
    const decoded = jwtDecode<GroupsJwtPayload>(accessToken);
    const groups = decoded["cognito:groups"];
    const group = Array.isArray(groups) ? groups[0] : groups;
    const parsed = Number(group);

    if (Number.isNaN(parsed)) return 4;

    return parsed;
  } catch {
    return 4;
  }
}

export default function Tickets() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dialogConfimationMessage, setDialogConfimationMessage] =
    useState<string>("");
  const [dialogConfimationIcon, setDialogConfimationIcon] =
    useState<IconNames>("CircleCheck");
  const [dialogConfimationClassName, setDialogConfimationClassName] =
    useState<string>("text-primary");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const groupId = getGroupIdFromSession(session);
  const isAdmin = groupId < 4;
  const trimmedSearch = searchTerm.trim();
  const searchQuery = trimmedSearch
    ? `&search=${encodeURIComponent(trimmedSearch)}`
    : "";
  const ticketsUrl = `${TICKETS_API_URL}?page=${page}&limit=${limit}${searchQuery}`;

  const shouldFetchTickets =
    status === "authenticated" &&
    !!session?.accessToken &&
    session?.challengeName !== "NEW_PASSWORD_REQUIRED";

  const {
    data: ticketsData,
    error: ticketsError,
    isLoading: ticketsLoading,
    mutate: mutateTickets,
  } = useSWR<TicketsApiResponse>(
    shouldFetchTickets ? [ticketsUrl, session?.accessToken as string] : null,
    fetcher
  );

  function handleConfirmationOpenChange(isOpen: boolean) {
    setShowConfirmation(isOpen);
  }

  useEffect(() => {
    // Sempre volta para a primeira página ao alterar a busca
    setPage(1);
  }, [trimmedSearch]);

  const shouldRedirectToFirstAccess =
    status !== "loading" && session?.challengeName === "NEW_PASSWORD_REQUIRED";

  useEffect(() => {
    if (shouldRedirectToFirstAccess) {
      router.replace("/first-access");
    }
  }, [shouldRedirectToFirstAccess, router]);

  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  if (shouldRedirectToFirstAccess) {
    return <div>Redirecionando...</div>;
  }

  const embeddedTickets: TicketsApiTicket[] = ticketsData?.tasks ?? [];

  const tickets: Ticket[] = embeddedTickets.map((ticket) => ({
    id: ticket.id,
    nome: ticket.name,
    cliente: ticket.company,
    prioridade: ticket.priority,
    dataCriacao: ticket.date_created,
    dataEncerramento: ticket.date_finished ?? "",
    status: ticket.status,
  }));

  const totalTickets = ticketsData?.total ?? embeddedTickets.length ?? 0;

  return (
    <div className="flex h-screen flex-col p-10">
      <header className="mb-6 flex w-full items-center justify-between">
        <div className="flex items-center justify-center gap-x-3">
          <Button size="icon" className="hover:bg-primary cursor-auto">
            <Icon name="Ticket" />
          </Button>
          <div>
            <h4 className="text-lg font-semibold capitalize">Tickets</h4>
            <p className="text-sm font-light">
              {totalTickets} resultados
            </p>
          </div>
        </div>

        <div className="flex w-3/4 items-center gap-x-4">
          <Input
            placeholder="Buscar ticket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <DialogConfirmation
            open={showConfirmation}
            onOpenChange={handleConfirmationOpenChange}
            message={dialogConfimationMessage}
            icon={dialogConfimationIcon}
            className={dialogConfimationClassName}
          />
          <DialogTicket
            session={session}
            isAdmin={isAdmin}
            onTicketCreated={(result) => {
              setDialogConfimationMessage(result.message);

              if (result.success) {
                setDialogConfimationIcon("CircleCheck");
                setDialogConfimationClassName("text-primary");
                mutateTickets();
              } else {
                setDialogConfimationIcon("CircleX");
                setDialogConfimationClassName("text-destructive");
              }

              setShowConfirmation(true);
            }}
          />
        </div>
      </header>

      <main className="mx-auto w-full">
        {ticketsError && <div>Falha ao carregar os dados.</div>}
        {ticketsLoading && <div>Carregando...</div>}
        {!ticketsError && !ticketsLoading && ticketsData && (
          <DataTable
            columns={columns}
            data={tickets}
            searchValue={searchTerm}
            searchColumn={""}
            page={page}
            pageSize={limit}
            totalItems={totalTickets}
            onPageChange={setPage}
            onPageSizeChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </main>
    </div>
  );
}
