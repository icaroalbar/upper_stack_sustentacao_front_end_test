import z from "zod";
import { formSchema } from "./users-form.schema";

export const formRows = [
  [
    {
      name: "first_name",
      placeholder: "Nome",
      required: true,
    },
    {
      name: "last_name",
      placeholder: "Sobrenome",
      required: true,
    },
  ],
  [
    {
      name: "phone_number",
      placeholder: "Nª de Contato",
      required: true,
    },
    {
      name: "whatsapp",
      placeholder: "Esse contato possui WhatsApp",
      type: "checkbox",
      required: false,
    },
  ],
  [
    {
      name: "email",
      placeholder: "E-mail",
      required: true,
    },
  ],
  [
    {
      name: "company",
      placeholder: "Empresa",
      required: true,
    },
  ],
] satisfies {
  name: keyof z.infer<typeof formSchema>;
  placeholder: string;
  type?: "text" | "checkbox";
  required: boolean;
}[][];
