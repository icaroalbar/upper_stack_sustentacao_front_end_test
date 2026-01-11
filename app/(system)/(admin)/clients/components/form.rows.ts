import z from "zod";
import { formSchema } from "./clients-form.schema";

export const formRows = [
  [
    {
      name: "company_name",
      placeholder: "Razão Social",
      required: false,
    },
  ],
  [
    {
      name: "trade_name",
      placeholder: "Nome Fantasia",
      required: true,
    },
    {
      name: "cnpj",
      placeholder: "CNPJ",
      required: false,
    },
  ],
  [
    {
      name: "phone_number",
      placeholder: "Nª de Contato",
      required: false,
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
      required: false,
    },
  ],
  [
    {
      name: "website",
      placeholder: "Site",
      required: false,
    },
  ],
  [
    {
      name: "aws_account",
      placeholder: "Conta AWS (12 dígitos)",
      required: false,
    },
  ],
] satisfies {
  name: keyof z.infer<typeof formSchema>;
  placeholder: string;
  type?: "text" | "checkbox";
  required: boolean;
}[][];
