import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import "./globals.css";
import NextAuthSessionProvider from "./providers/sessionProvider";

const fontLogo = localFont({
  src: "../public/fonts/nasalization.otf",
  variable: "--font-upper-stack",
});

const geistSans = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${fontLogo.variable} font-montserrat bg-card antialiased`}
      >
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  );
}
