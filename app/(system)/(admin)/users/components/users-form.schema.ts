import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

export const formSchema = z.object({
  first_name: z.string().min(2, {
    message: "Nome é obrigatório.",
  }),
  last_name: z.string().min(2, {
    message: "Sobrenome é obrigatório.",
  }),
  email: z.email({ message: "E-mail inválido." }).min(2),
  phone_number: z
    .string()
    .min(10, { message: "Número de contato é obrigatório." })
    .max(11, { message: "Número inválido." })
    .regex(/^\d{10,11}$/, { message: "Número inválido." }),
  whatsapp: z.boolean().optional(),
  company: z.string().optional(),
});

export function useUserForm() {
  return useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      whatsapp: false,
      company: "",
    },
  });
}
