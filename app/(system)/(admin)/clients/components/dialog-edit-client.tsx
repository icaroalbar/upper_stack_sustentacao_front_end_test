import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import Icon from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import z from "zod";
import { formSchema, useClientForm } from "./clients-form.schema";
import { formRows } from "./form.rows";
import { FormGridRow } from "./form-grid-row";
import { useEffect } from "react";
import { Clients } from "./columns";

interface DialogEditClientProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  form: ReturnType<typeof useClientForm>;
  handleCloseDialog: () => void;
  disabled: boolean;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  client: Clients;
}

export function DialogEditClient({
  open,
  setOpen,
  form,
  handleCloseDialog,
  disabled,
  onSubmit,
  client,
}: DialogEditClientProps) {
  useEffect(() => {
    if (!open) return;

    form.reset({
      company_name: client.company_name ?? "",
      trade_name: client.trade_name ?? "",
      cnpj: client.cnpj ?? "",
      email: client.email ?? "",
      phone_number: client.phone_number ?? "",
      whatsapp: client.whatsapp ?? false,
      website: client.website ?? "",
      aws_account: client.aws_account ?? "",
    });
  }, [client, form, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) handleCloseDialog();
        else setOpen(true);
      }}
    >
      <DialogContent disabled={disabled} className="w-full max-w-3xl">
        <div
          className={`${disabled ? "pointer-events-none opacity-50 select-none" : ""} space-y-4`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-x-2">
              <Icon name="Building2" className="text-primary" size={18} />
              <p>Editar cliente</p>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Atualize as informações do cliente e salve para aplicar as mudanças.
          </DialogDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {formRows.map((row, i) => (
                <FormGridRow key={i} fields={row} form={form} />
              ))}

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={disabled}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={disabled}>
                  {disabled ? (
                    <>
                      <Icon name="LoaderCircle" className="animate-spin" />
                      Salvando
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
