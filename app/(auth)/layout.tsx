import { ThemeProvider } from "@/components/theme-provider";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/tickets");
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <main className="grid grid-cols-3">
        <section className="col-span-3 flex h-screen items-center justify-center md:col-span-1">
          {children}
        </section>
        <section className="bg-background col-span-2 hidden grid-cols-2 bg-[url('https://comunidadecloud.com/wp-content/uploads/2023/06/bg-hexagonos.webp')] bg-cover md:flex">
          <div className="col-span-1 p-10">
            <h2 className="text-justify text-2xl">
              <span className="text-primary">Simples</span> e interativo para
              garantir a melhor experiência com nossos serviços.
            </h2>
          </div>
          <div className="col-span-1 flex items-end justify-end p-10">
            <Image
              src={
                "https://upper-stack-sustentacao.s3.us-east-1.amazonaws.com/imagens-front/logotipo-branca.png"
              }
              alt="Logo Upper Stack"
              width={100}
              height={100}
            />
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
