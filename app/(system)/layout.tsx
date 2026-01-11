import Nav from "@/components/partials/nav/nav";
import { ThemeProvider } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { authOptions } from "@/lib/auth-options";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upper Stack",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col">
        <Nav />
        <Separator />
        <div className="flex flex-1 min-h-0 flex-col">{children}</div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
