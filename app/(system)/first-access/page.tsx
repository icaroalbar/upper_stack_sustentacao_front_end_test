"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/shared/api";

const passwordPolicyRegex =
  /^(?=.*[A-Z])(?=(?:.*\d){3,})(?=.*[^A-Za-z0-9]).{8,}$/;

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        message: "A senha deve ter no mínimo 8 caracteres.",
      })
      .regex(passwordPolicyRegex, {
        message:
          "A senha deve conter pelo menos 1 letra maiúscula, 3 números e 1 caractere especial.",
      }),
    confirmPassword: z.string().min(1, {
      message: "A confirmação de senha é obrigatória.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem.",
  });

export default function FirstAccess() {
  const [disableForm, setdisableForm] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  if (session?.challengeName !== "NEW_PASSWORD_REQUIRED") {
    redirect("/tickets");
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setdisableForm(true);
    setErrorMessage(null);

    try {
      await axios.post(
        `${API_BASE_URL}/auth/first-access`,
        {
          username: session?.challengeParametersUser,
          password: values.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: session?.cognitoSession,
          },
        }
      );

      await signIn("credentials", {
        username: session?.challengeParametersUser,
        password: values.password,
        redirect: false,
      });

      redirect("/ticket");
    } catch (error) {
      console.error("Erro na requisição:", error);

      if (axios.isAxiosError(error)) {
        console.error("Detalhes do erro:", error.response?.data);
      }

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Erro ao atualizar a senha.";

      setErrorMessage(errorMessage);

      setTimeout(() => {
        form.reset();
        setdisableForm(false);
        setErrorMessage(null);
      }, 2000);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center gap-y-12 p-12">
      <div className="flex flex-col items-center justify-center gap-y-10">
        <Image
          src={
            "https://upper-stack-sustentacao.s3.us-east-1.amazonaws.com/imagens-front/logo.png"
          }
          alt="Logo Upper Stack"
          width={100}
          height={100}
        />
        <div className="space-y-2 text-center">
          <h5 className="text-xl font-medium">Primeiro acesso</h5>
          {/* <p className="font-light">
            Preencha os dados abaixo para criar sua senha definitiva.
          </p> */}
          <div className="mt-4 max-w-xl space-y-2 px-2 text-start text-xs font-light">
            <p className="font-semibold">
              Crie sua nova senha que deve seguir obrigatoriamente o seguinte
              padrão:
            </p>
            <p>
              Mínimo de 8 caracteres, contendo pelo menos 1 letra maiúscula, 3
              números e 1 caractere especial (como @, #, $, %, etc).
            </p>
          </div>
        </div>
      </div>

      <div
        className={`flex w-full max-w-xl flex-col gap-y-16 ${disableForm && "pointer-events-none opacity-50"}`}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite sua nova senha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite novamente sua nova senha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-2 flex flex-col items-end gap-y-6">
              {errorMessage && (
                <Alert variant="destructive">
                  <Icon className="h-4 w-4" name="TriangleAlert" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                {disableForm ? (
                  <Icon name="LoaderCircle" className="animate-spin" />
                ) : (
                  "Atualizar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <div className="font-upper-stack space-x-1 text-center text-white/30 capitalize md:text-2xl">
        <p>Upper Stack</p>
      </div>
    </main>
  );
}
