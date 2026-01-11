"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Icon, { IconNames } from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DialogConfirmation } from "@/components/partials/dialog-confirmation";
import axios from "axios";
import { Row } from "@tanstack/react-table";
import { Clients } from "./columns";
import { DialogEditClient } from "./dialog-edit-client";
import { formSchema, useClientForm } from "./clients-form.schema";
import { useSWRConfig } from "swr";
import z from "zod";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/shared/api";

export default function ActionsMenu({
  row,
  id,
}: {
  row: Row<Clients>;
  id?: string;
}) {
  const { mutate } = useSWRConfig();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loaderButton, setLoaderButton] = useState(false);
  const [currentAction, setCurrentAction] = useState<"toggle" | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editDisabled, setEditDisabled] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const editForm = useClientForm();

  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [dialogConfimationMessage, setDialogConfimationMessage] =
    useState<string>("");
  const [dialogConfimationIcon] = useState<IconNames>("CircleCheck");
  const [dialogConfimationClassName] = useState<string>("text-primary");
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const CLIENTS_API_URL = `${API_BASE_URL}/admin/clients`;

  useEffect(() => {
    if (shouldRefetch) {
      mutate(CLIENTS_API_URL);
      setShouldRefetch(false);
    }
  }, [CLIENTS_API_URL, mutate, shouldRefetch]);

  const handleOpenDialog = (action: "toggle") => {
    setCurrentAction(action);
    setMenuOpen(false);
    setTimeout(() => setDialogOpen(true), 100);
  };

  const handleEdit = () => {
    if (!row.original.enabled) return;
    setMenuOpen(false);
    setTimeout(() => setEditOpen(true), 100);
  };

  const handleDelete = () => {
    if (row.original.enabled) return;

    setMenuOpen(false);
    setDeleteConfirmText("");
    setTimeout(() => setDeleteOpen(true), 100);
  };

  const handleConfirm = async () => {
    setLoaderButton(true);
    setDialogOpen(true);

    try {
      await axios.patch(`${CLIENTS_API_URL}/status/${id}`);

      setDialogConfimationMessage("Dados atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      setDialogConfimationMessage(error);
    } finally {
      mutate(CLIENTS_API_URL);
      setShowConfirmation(true);
      setLoaderButton(false);
      setDialogOpen(false);
    }
  };

  const handleEditSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id) {
      setDialogConfimationMessage(
        "ID do cliente não encontrado para atualização."
      );
      setShowConfirmation(true);
      return;
    }

    setEditDisabled(true);

    try {
      await axios.put(`${CLIENTS_API_URL}/${id}`, values);
      setDialogConfimationMessage("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      const message =
        error?.response?.data?.error?.message ||
        "Erro inesperado ao atualizar o cliente";

      setDialogConfimationMessage(message);
    } finally {
      setShowConfirmation(true);
      setEditDisabled(false);
      setEditOpen(false);
      mutate(CLIENTS_API_URL);
    }
  };

  async function handleDeleteConfirm() {
    if (!id) {
      setDialogConfimationMessage(
        "ID do cliente não encontrado para exclusão."
      );
      setShowConfirmation(true);
      return;
    }

    if (row.original.enabled) {
      setDialogConfimationMessage(
        "Desabilite o cliente antes de tentar excluir."
      );
      setShowConfirmation(true);
      setDeleteOpen(false);
      return;
    }

    setDeleteLoading(true);
    try {
      await axios.delete(`${CLIENTS_API_URL}/${id}`);
      setDialogConfimationMessage("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      const message =
        error?.response?.data?.error?.message ||
        "Erro inesperado ao excluir o cliente";

      setDialogConfimationMessage(message);
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setShowConfirmation(true);
      mutate(CLIENTS_API_URL);
    }
  }

  function handleCloseEditDialog() {
    editForm.reset();
    setEditDisabled(false);
    setEditOpen(false);
  }

  function handleConfirmationOpenChange(isOpen: boolean) {
    setShowConfirmation(isOpen);

    if (!isOpen) {
      setShouldRefetch(true);
    }
  }

  return (
    <>
      <DialogConfirmation
        open={showConfirmation}
        onOpenChange={handleConfirmationOpenChange}
        message={dialogConfimationMessage}
        icon={dialogConfimationIcon}
        className={dialogConfimationClassName}
      />
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Icon name="Ellipsis" size={18} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => handleOpenDialog("toggle")}>
            {!row.original.enabled ? (
              <>
                <Icon name="CircleCheck" size={18} /> Habilitar
              </>
            ) : (
              <>
                <Icon name="CircleX" size={18} /> Desabilitar
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={handleEdit}
            disabled={!row.original.enabled}
          >
            <Icon name="UserRoundPen" size={18} /> Editar
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={handleDelete}
            disabled={row.original.enabled}
          >
            <Icon name="Trash" size={18} /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentAction === "toggle"
                ? row.original.enabled
                  ? "Desabilitar usuário?"
                  : "Habilitar usuário?"
                : "Confirmação"}
            </DialogTitle>
            <div className="text-muted-foreground pt-2 text-sm">
              {currentAction === "toggle"
                ? row.original.enabled
                  ? "O usuário ficará sem acesso até ser reativado."
                  : "O usuário terá acesso restabelecido."
                : "Deseja confirmar a ação?"}
            </div>
          </DialogHeader>

          <DialogFooter>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                disabled={loaderButton}
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={loaderButton}>
                {loaderButton ? (
                  <>
                    <Icon
                      name="LoaderCircle"
                      className="animate-spin"
                      size={18}
                    />
                    Enviando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Trash" className="text-destructive" size={18} />
              Confirmar exclusão
            </DialogTitle>
            <div className="text-muted-foreground pt-2 text-sm">
              Essa ação é irreversível. Para confirmar, digite o nome fantasia
              do cliente abaixo.
            </div>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <p className="text-muted-foreground text-sm">
              Cliente:{" "}
              <span className="font-semibold">{row.original.trade_name}</span>
            </p>
            <Input
              placeholder="Digite o nome fantasia para confirmar"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={
                deleteLoading ||
                row.original.enabled ||
                deleteConfirmText.trim() !== row.original.trade_name
              }
            >
              {deleteLoading ? (
                <>
                  <Icon
                    name="LoaderCircle"
                    className="animate-spin"
                    size={18}
                  />
                  Excluindo...
                </>
              ) : (
                "Confirmar exclusão"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DialogEditClient
        open={editOpen}
        setOpen={setEditOpen}
        disabled={editDisabled}
        form={editForm}
        onSubmit={handleEditSubmit}
        handleCloseDialog={handleCloseEditDialog}
        client={row.original}
      />
    </>
  );
}
