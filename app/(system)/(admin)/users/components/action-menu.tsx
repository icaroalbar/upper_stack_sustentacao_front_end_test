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
import { API_BASE_URL } from "@/shared/api";
import axios from "axios";
import { Row } from "@tanstack/react-table";
import { Users } from "./columns";

export default function ActionsMenu({
  row,
  id,
}: {
  row: Row<Users>;
  id: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loaderButton, setLoaderButton] = useState(false);
  const [currentAction, setCurrentAction] = useState<"toggle" | null>(null);

  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [dialogConfimationMessage, setDialogConfimationMessage] =
    useState<string>("");
  const [dialogConfimationIcon] = useState<IconNames>("CircleCheck");
  const [dialogConfimationClassName] = useState<string>("text-primary");
  const [shouldRefetch, setShouldRefetch] = useState(false);

  useEffect(() => {
    if (shouldRefetch) {
      setShouldRefetch(false);
    }
  }, [shouldRefetch]);

  const handleOpenDialog = (action: "toggle") => {
    setCurrentAction(action);
    setMenuOpen(false);
    setTimeout(() => setDialogOpen(true), 100);
  };

  const handleConfirm = async () => {
    setLoaderButton(true);
    setDialogOpen(true);

    try {
      await axios.patch(
        `${API_BASE_URL}/admin/users/status/${id}`
      );

      setDialogConfimationMessage("Dados atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      setDialogConfimationMessage(error);
    } finally {
      setShowConfirmation(true);
      setLoaderButton(false);
      setDialogOpen(false);
    }
  };

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

          <DropdownMenuItem disabled>
            <Icon name="KeyRound" size={18} /> Recuperar senha
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem disabled>
            <Icon name="UserRoundPen" size={18} /> Editar
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
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
    </>
  );
}
