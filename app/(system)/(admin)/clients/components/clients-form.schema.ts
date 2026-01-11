import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

export const formSchema = z.object({
  company_name: z.string().optional(),
  trade_name: z.string().min(2, {
    message: "Nome fantasia é obrigatória.",
  }),
  cnpj: z
    .string()
    .min(14, { message: "CNPJ é obrigatório." })
    .regex(/^\d{14}$/, { message: "CNPJ inválido." })
    .optional()
    .or(z.literal("")),
  email: z.email({ message: "E-mail inválido." }).optional().or(z.literal("")),
  phone_number: z
    .string()
    .min(10, { message: "Número de contato é obrigatório." })
    .max(11, { message: "Número inválido." })
    .regex(/^\d{10,11}$/, { message: "Número inválido." })
    .optional()
    .or(z.literal("")),
  whatsapp: z.boolean().optional(),
  website: z.string().optional(),
  aws_account: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^\d{12}$/.test(val), {
      message: "Conta AWS deve ter exatamente 12 dígitos numéricos.",
    }),
});

// export const formSchema = z.object({
//   company_name: z.string().min(2, {
//     message: "Razão social é obrigatória.",
//   }),
//   trade_name: z.string().min(2, {
//     message: "Nome fantasia é obrigatória.",
//   }),
//   cnpj: z
//     .string()
//     .min(14, { message: "CNPJ é obrigatório." })
//     .regex(/^\d{14}$/, { message: "CNPJ inválido." }),
//   email: z.email({ message: "E-mail inválido." }).min(2),
//   phone_number: z
//     .string()
//     .min(10, { message: "Número de contato é obrigatório." })
//     .max(11, { message: "Número inválido." })
//     .regex(/^\d{10,11}$/, { message: "Número inválido." }),
//   whatsapp: z.boolean().optional(),
//   website: z.string().optional(),
//   aws_account: z
//     .string()
//     .optional()
//     .refine((val) => !val || /^\d{12}$/.test(val), {
//       message: "Conta AWS deve ter exatamente 12 dígitos numéricos.",
//     }),
// });

export function useClientForm() {
  return useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      trade_name: "",
      cnpj: "",
      email: "",
      phone_number: "",
      whatsapp: false,
      website: "",
      aws_account: "",
    },
  });
}
