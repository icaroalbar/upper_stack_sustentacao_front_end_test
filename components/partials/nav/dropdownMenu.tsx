"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icon from "@/components/ui/icons";
import { getInitials } from "@/shared/get-initials";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function DropdownMenuNav() {
  const router = useRouter();

  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  async function logout() {
    await signOut({
      redirect: false,
    });

    router.replace("/login");
  }

  const name = getInitials(session?.user.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Menu do usuario${session?.user?.name ? `: ${session.user.name}` : ""}`}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Avatar>
            {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
            <AvatarFallback className="bg-primary font-semibold uppercase">
              {name}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-4 w-56">
        <DropdownMenuLabel>{session?.user.name}</DropdownMenuLabel>
        <DropdownMenuGroup>
          {/* <DropdownMenuItem asChild>
            <Link href={"/settings/profile"}>
              Perfil
              <DropdownMenuShortcut>
                <Icon name="User" />
              </DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          Sair
          <DropdownMenuShortcut>
            <Icon name="LogOut" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
