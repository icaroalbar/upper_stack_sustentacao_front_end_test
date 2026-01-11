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
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { API_BASE_URL } from "@/shared/api";

const formSchema = z.object({
  email: z.string().min(2, {
    message: "E-mail é obrigatório.",
  }),
});

export default function ForgotPassword() {
  const [disableForm, setdisableForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setdisableForm(true);
    try {
      await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          username: values.email,
        }
      );
      router.push("/login");
    } catch (error) {
      console.error(error);
      setErrorMessage("Ocorreu um erro. Tente novamente.");
    } finally {
      setTimeout(() => {
        setdisableForm(false);
        form.reset();
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
          <h5 className="text-xl font-medium">Recupere sua senha</h5>
          <p className="font-light">Preencha os dados abaixo</p>
        </div>
      </div>
      <div
        className={`flex flex-1 flex-col items-center justify-start gap-y-10 py-10 ${disableForm && "pointer-events-none opacity-50"}`}
      >
        <div className="w-full space-y-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Digite seu e-mail"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {disableForm ? (
                  <Icon name="LoaderCircle" className="animate-spin" />
                ) : (
                  "Enviar"
                )}
              </Button>
            </form>
          </Form>
          <div className="flex flex-col items-end gap-y-6">
            {errorMessage && (
              <Alert variant="destructive">
                <Icon className="h-4 w-4" name="TriangleAlert" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <p className={`text-justify text-sm font-extralight`}>
          Você receberá um email no endereço informado acima com o passo a passo
          para a criação de uma nova senha.
        </p>
        <Link href="/login" className="text-primary text-xs hover:underline">
          Voltar
        </Link>
      </div>
      <div className="font-upper-stack space-x-1 text-center text-white/30 capitalize md:text-2xl">
        <p>Upper Stack</p>
      </div>
    </div>
  );
}
