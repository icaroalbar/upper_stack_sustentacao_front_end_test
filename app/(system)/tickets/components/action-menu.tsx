"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icons";
import { Row } from "@tanstack/react-table";
import type { Ticket } from "./columns";

interface ActionsMenuProps {
  row: Row<Ticket>;
  id: string;
}

export default function ActionsMenu({ row }: ActionsMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const ticket = row.original;

  const handleOpenDetails = () => {
    setMenuOpen(false);
    router.push(`/tickets/${ticket.id}`);
  };

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon name="Ellipsis" size={18} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handleOpenDetails}>
          <Icon name="Eye" size={18} /> Ver detalhes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
