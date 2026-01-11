"use client";

import { Button } from "../../ui/button";
import Icon from "../../ui/icons";
import Link from "next/link";
import { DropdownMenuNav } from "./dropdownMenu";
import { nav as navItems } from "./nav.info";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Nav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Enquanto a sessão não estiver carregada, renderiza null ou skeleton
  if (status === "loading") return null;

  const userName = session?.user?.name || "Usuário";
  const userCompany = session?.user?.company || "Sem empresa";

  // Pega o groupId do token (a partir do AccessToken)
  const groupId = session?.user?.AuthenticationResult?.AccessToken
    ? JSON.parse(
        atob(session.user.AuthenticationResult.AccessToken.split(".")[1])
      )["cognito:groups"]?.[0] || 4
    : 4;

  // Filtra os itens do menu que o usuário pode ver
  const nav = navItems.filter((item) => {
    if (["Usuários", "Clientes"].includes(item.title)) {
      return groupId <= 3; // só exibe para groupId 1,2,3
    }
    return true; // outros itens sempre
  });

  return (
    <nav className="bg-background space-y-4 px-6 pt-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-x-2">
          <Image
            src="https://upper-stack-sustentacao.s3.us-east-1.amazonaws.com/imagens-front/logo.png"
            alt="Logo Upper Stack"
            width={35}
            height={35}
          />
          <div className="font-upper-stack space-x-1 capitalize md:text-2xl">
            <span className="text-primary">Upper</span>
            <span>Stack</span>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <p className="hidden capitalize md:!block">{userName}</p>
          <DropdownMenuNav />
        </div>
      </div>
      <div
        className={`${
          pathname === "/first-access" ? "justify-end" : "justify-between"
        } flex items-center`}
      >
        <ul
          className={`${
            pathname === "/first-access" ? "hidden" : "flex"
          } items-center`}
        >
          {nav.map((item, index) => (
            <li
              key={index}
              className={`flex items-center pb-1 ${
                pathname === item.link ? "border-primary border-b" : ""
              }`}
            >
              <Button variant="ghost" asChild>
                <Link href={item.link}>
                  <Icon name={item.icon} />
                  <span className="hidden md:!block">{item.title}</span>
                </Link>
              </Button>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-x-2 pb-2 md:flex">
          <Icon name="Building2" size={18} />
          <span className="uppercase">{userCompany}</span>
        </div>
      </div>
    </nav>
  );
}
