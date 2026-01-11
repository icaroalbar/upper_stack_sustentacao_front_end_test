"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Icon, { IconNames } from "@/components/ui/icons";
import { z } from "zod";
import { formSchema, useClientForm } from "./components/clients-form.schema";
import DialogClient from "./components/dialog-client";
import { DataTable } from "@/components/partials/data-table";
import { columns } from "./components/columns";
import { Input } from "@/components/ui/input";
import { DialogConfirmation } from "@/components/partials/dialog-confirmation";
import { API_BASE_URL } from "@/shared/api";

const API_URL = `${API_BASE_URL}/admin/clients`;

const fetcher = (url: string) =>
  axios.get(url).then((response) => response.data);

export default function Client() {
  const form = useClientForm();
  const [open, setOpen] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [dialogConfimationMessage, setDialogConfimationMessage] =
    useState<string>("");
  const [dialogConfimationIcon, setDialogConfimationIcon] =
    useState<IconNames>("CircleCheck");
  const [dialogConfimationClassName, setDialogConfimationClassName] =
    useState<string>("text-primary");
  const [searchCompany, setSearchCompany] = useState<string>("");
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(API_URL, fetcher);

  useEffect(() => {
    if (shouldRefetch) {
      mutate();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, mutate]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setDisabled(true);
    try {
      await axios.post(API_URL, values);
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
    setShowConfirmation(isOpen);

    if (!isOpen) {
      setShouldRefetch(true);
    }
  }

  return (
    <div className="flex h-screen flex-col p-10">
      <header className="mb-6 flex w-full items-center justify-between">
        <div className="flex items-center justify-center gap-x-3">
          <Button size="icon" className="hover:bg-primary cursor-auto">
            <Icon name="Building2" />
          </Button>
          <div>
            <h4 className="text-lg font-semibold capitalize">Clientes</h4>
            <p className="text-sm font-light">
              {data?.data?.length ?? 0} resultados
            </p>
          </div>
        </div>

        <div className="flex w-3/4 items-center gap-x-4">
          <Input
            placeholder="Buscar empresa..."
            value={searchCompany}
            onChange={(e) => setSearchCompany(e.target.value)}
          />

          <DialogConfirmation
            open={showConfirmation}
            onOpenChange={handleConfirmationOpenChange}
            message={dialogConfimationMessage}
            icon={dialogConfimationIcon}
            className={dialogConfimationClassName}
          />
          <DialogClient
            open={open}
            disabled={disabled}
            form={form}
            handleCloseDialog={handleCloseDialog}
            onSubmit={onSubmit}
            setOpen={setOpen}
          />
        </div>
      </header>

      <main className="mx-auto w-full">
        {error && <div>Falha ao carregar os dados.</div>}
        {isLoading && <div>Carregando...</div>}
        {!error && !isLoading && data && (
          <DataTable
            columns={columns}
            data={data.data}
            searchValue={searchCompany}
            searchColumn={"trade_name"}
          />
        )}
      </main>
    </div>
  );
}
