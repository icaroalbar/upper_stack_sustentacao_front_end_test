import React from "react";
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
import { Form } from "@/components/ui/form";
import Icon from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import z from "zod";
import { formRows } from "./form.rows";
import { FormGridRow } from "./form-grid-row";
import { formSchema, useUserForm } from "./users-form.schema";

interface DialogUserProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  form: ReturnType<typeof useUserForm>;
  handleCloseDialog: () => void;
  disabled: boolean;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  data: { id: string; trade_name: string }[];
}

export default function DialogUser({
  open,
  setOpen,
  form,
  handleCloseDialog,
  disabled,
  onSubmit,
  data,
}: DialogUserProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) handleCloseDialog();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Icon name="Plus" />
          Novo
        </Button>
      </DialogTrigger>
      <DialogContent disabled={disabled} className="w-full max-w-3xl">
        <div
          className={`${disabled ? "pointer-events-none opacity-50 select-none" : ""} space-y-4`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-x-2">
              <Icon name="UserRound" className="text-primary" size={18} />
              <p>Novo usuário</p>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Preencha o formulário abaixo para realizar o cadastro.
          </DialogDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {formRows.map((row, i) => (
                <FormGridRow key={i} fields={row} form={form} data={data} />
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
                      Enviando
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
