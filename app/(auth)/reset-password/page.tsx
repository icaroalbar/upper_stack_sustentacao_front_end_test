"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
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
import { useRouter, useSearchParams } from "next/navigation";
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

export default function ResetPassword() {
  const [disableForm, setdisableForm] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const username = searchParams.get("username");
  const code = searchParams.get("code");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setdisableForm(true);
    try {
      await axios.post(
        `${API_BASE_URL}/auth/confirm-forgot-password`,
        {
          username: username,
          confirmationCode: code,
          password: values.password,
        }
      );
      router.replace("/login");
    } catch (error) {
      console.error(error);
      setErrorMessage("Ocorreu um erro. Tente novamente.");
    } finally {
      setTimeout(() => {
        setdisableForm(false);
        form.reset();
        setErrorMessage(null);
      }, 2000);
    }
  }

  return (
    <div className="flex h-6/7 w-3/5 flex-col justify-between lg:max-w-lg">
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
          <h5 className="text-xl font-medium">Nova senha</h5>
          <p className="font-light">Preencha os dados abaixo</p>
          <div className="my-4 space-y-2 text-start text-xs font-light">
            <p className="font-semibold">
              A senha deve seguir obrigatoriamente o seguinte padrão:
            </p>
            <p>
              Mínimo de 8 caracteres, contendo pelo menos 1 letra maiúscula, 3
              números e 1 caractere especial (como @, #, $, %, etc).
            </p>
          </div>
        </div>
      </div>
      <div
        className={`flex flex-1 flex-col items-center justify-center gap-y-10 py-10 ${disableForm && "pointer-events-none opacity-50"}`}
      >
        <div className="w-full space-y-3">
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
                    "Enviar"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <Link href="/login" className="text-primary text-xs hover:underline">
          Página inicial
        </Link>
      </div>
      <div className="font-upper-stack space-x-1 text-center text-white/30 capitalize md:text-2xl">
        <p>Upper Stack</p>
      </div>
    </div>
  );
}
