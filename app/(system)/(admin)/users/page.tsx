"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Icon, { IconNames } from "@/components/ui/icons";
import { z } from "zod";
import { formSchema, useUserForm } from "./components/users-form.schema";
import { DataTable } from "../../../../components/partials/data-table";
import { columns } from "./components/columns";
import { Input } from "@/components/ui/input";
import DialogUser from "./components/dialog-users";
import { DialogConfirmation } from "@/components/partials/dialog-confirmation";

import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/shared/api";
import type { Users } from "./components/columns";

const fetcher = ([url, token]: [string, string]) =>
  axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((response) => response.data);

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

export default function User() {
  const { data: session } = useSession();
  const form = useUserForm();
  const [open, setOpen] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [searchName, setSearchName] = useState<string>("");
  const [dialogConfimationMessage, setDialogConfimationMessage] =
    useState<string>("");
  const [dialogConfimationIcon, setDialogConfimationIcon] =
    useState<IconNames>("CircleCheck");
  const [dialogConfimationClassName, setDialogConfimationClassName] =
    useState<string>("text-primary");
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const API_URL = API_BASE_URL;
  const USERS_API_URL =
    process.env.NEXT_PUBLIC_USERS_URL ?? "http://localhost:8030/dev/users";

  const {
    data: usersData,
    error: usersError,
    isLoading: usersLoading,
    mutate: mutateUsers,
  } = useSWR<UsersApiResponse>(
    session?.accessToken ? [USERS_API_URL, session.accessToken] : null,
    ([url, token]) =>
      axios
        .get<UsersApiResponse>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => response.data)
  );

  const { data: clientsData } = useSWR(
    session?.accessToken
      ? [`${API_URL}/admin/clients`, session.accessToken]
      : null,
    fetcher
  );

  useEffect(() => {
    if (shouldRefetch) {
      mutateUsers();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, mutateUsers]);

  const apiUsers = usersData?.users ?? [];
  const users: Users[] = apiUsers.map((user) => ({
    id: user.id,
    company: user.company ?? "",
    name: (user.name ?? user.email ?? "").trim(),
    email: user.email ?? "",
    phone_number: user.phoneNumber ?? "",
    whatsapp:
      typeof user.whatsapp === "string"
        ? user.whatsapp === "1"
        : Boolean(user.whatsapp),
    enabled: true,
  }));

  const totalUsers = usersData?.total ?? users.length ?? 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setDisabled(true);
    try {
      await axios.post(
        `${API_URL}/admin/users`,
        {
          name: `${values.first_name} ${values.last_name}`,
          email: values.email,
          phone_number: values.phone_number,
          whatsapp: values.whatsapp,
          company: values.company,
        },
        {
          headers: {
            Authorization: session?.accessToken,
          },
        }
      );
      setDialogConfimationMessage("Cadastro realizado com sucesso!");
      setDialogConfimationIcon("CircleCheck");
      setDialogConfimationClassName("text-primary");
    } catch (error) {
      console.error("Erro ao enviar o formulário:", error);

      const message =
        error?.response?.data?.error?.message ||
        "Erro inesperado ao enviar o formulário";

      setDialogConfimationMessage(message);
      setDialogConfimationIcon("CircleX");
      setDialogConfimationClassName("text-destructive");
    } finally {
      setTimeout(() => {
        form.reset();
        setOpen(false);
        setDisabled(false);
        setShowConfirmation(true);
      }, 3000);
    }
  }

  function handleCloseDialog() {
    form.reset();
    setOpen(false);
    setDisabled(false);
  }

  function handleConfirmationOpenChange(isOpen: boolean) {
    if (!isOpen) {
      // Dar um pequeno delay para o dialog fechar completamente
      setTimeout(() => {
        setShowConfirmation(false);
        setShouldRefetch(true);
      }, 100);
    } else {
      setShowConfirmation(true);
    }
  }

  return (
    <div className="flex h-screen flex-col p-10">
      <header className="mb-6 flex w-full items-center justify-between">
        <div className="flex items-center justify-center gap-x-3">
          <Button size="icon" className="hover:bg-primary cursor-auto">
            <Icon name="UsersRound" />
          </Button>
          <div>
            <h4 className="text-lg font-semibold capitalize">Usuários</h4>
            <p className="text-sm font-light">
              {totalUsers} resultados
            </p>
          </div>
        </div>

        <div className="flex w-3/4 items-center gap-x-4">
          <Input
            placeholder="Buscar usuário..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />

          <DialogConfirmation
            open={showConfirmation}
            onOpenChange={handleConfirmationOpenChange}
            message={dialogConfimationMessage}
            icon={dialogConfimationIcon}
            className={dialogConfimationClassName}
          />
          <DialogUser
            open={open}
            disabled={disabled}
            form={form}
            data={clientsData?.data ?? []}
            handleCloseDialog={handleCloseDialog}
            onSubmit={onSubmit}
            setOpen={setOpen}
          />
        </div>
      </header>

      <main className="mx-auto w-full">
        {usersError && <div>Falha ao carregar os dados.</div>}
        {usersLoading && <div>Carregando...</div>}
        {!usersError && !usersLoading && usersData && (
          <DataTable
            columns={columns}
            data={users}
            searchValue={searchName}
            searchColumn={"name"}
          />
        )}
      </main>
    </div>
  );
}
