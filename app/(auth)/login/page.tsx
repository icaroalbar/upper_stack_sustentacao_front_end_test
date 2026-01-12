"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Icon from "@/components/ui/icons";
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
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "E-mail é obrigatório.",
    })
    .email({
      message: "E-mail inválido.",
    }),

  password: z.string().min(2, {
    message: "A senha é obrigatória.",
  }),
});

export default function Login() {
  const [disableForm, setdisableForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setdisableForm(true);
    setErrorMessage(null);
    const result = await signIn("credentials", {
      username: values.username,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      form.reset();
      setErrorMessage(result.error);
      setdisableForm(false);
      setTimeout(() => {
        setErrorMessage(null);
      }, 2000);
      return;
    }

    router.replace("/tickets");
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
          <h5 className="text-xl font-medium">Seja bem vindo!</h5>
          <p className="font-light">Faça o login para acessar o sistema.</p>
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
                  name="username"
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Digite sua senha"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-2 flex flex-col items-end gap-y-6">
                <Link
                  href="/forgot-password"
                  className="text-primary text-xs hover:underline"
                >
                  Esqueci minha senha
                </Link>
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
      </div>
      <div className="font-upper-stack space-x-1 text-center text-white/30 capitalize md:text-2xl">
        <p>Upper Stack</p>
      </div>
    </div>
  );
}
