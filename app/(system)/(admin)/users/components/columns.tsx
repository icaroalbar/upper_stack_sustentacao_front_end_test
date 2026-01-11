"use client";
import Icon, { WhatsAppIcon } from "@/components/ui/icons";
import { formatPhone, getWhatsAppLink } from "@/components/ui/input-mask";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import ActionsMenu from "./action-menu";

export type Users = {
  id: string;
  company: string;
  name: string;
  email: string;
  phone_number: string;
  enabled: boolean;
  whatsapp: boolean;
};

interface StatusBadgeProps {
  enabled: boolean;
}

export function StatusBadge({ enabled }: StatusBadgeProps) {
  const config = enabled
    ? {
        icon: "CircleCheck" as const,
        label: "Habilitado",
        color: "text-green-400",
      }
    : {
        icon: "CircleX" as const,
        label: "Desabilitado",
        color: "text-red-400",
      };

  return (
    <div className={`flex items-center gap-x-1 ${config.color}`}>
      <Icon name={config.icon} size={18} />
      {config.label}
    </div>
  );
}

export const columns: ColumnDef<Users>[] = [
  {
    accessorKey: "company",
    header: "Empresa",
    cell: ({ row }) => {
      const company = row.getValue("company") as string;
      return company && <div className="uppercase">{company}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Usuário",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return name && <div className="capitalize">{name}</div>;
    },
  },

  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return (
        email && (
          <div className="flex items-center gap-x-2">
            <Link href={`mailto:${email}`} target="_blank">
              <Icon name="Mail" className="text-primary" size={18} />
            </Link>
            {email}
          </div>
        )
      );
    },
  },
  {
    accessorKey: "phone_number",
    header: "Contato",
    cell: ({ row }) => {
      const phone = row.getValue("phone_number") as string;
      const whatsapp = row.original.whatsapp as boolean;

      return (
        phone && (
          <div className="flex max-w-[145px] items-center justify-between gap-x-2">
            {formatPhone(phone)}
            {whatsapp && (
              <Link href={getWhatsAppLink(phone)} target="_blank">
                <WhatsAppIcon className="size-6" />
              </Link>
            )}
          </div>
        )
      );
    },
  },
  {
    accessorKey: "enabled",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge enabled={row.getValue("enabled") as boolean} />
    ),
  },
  {
    header: "Ações",
    cell: ({ row }) => {
      return <ActionsMenu row={row} id={row.original.id} />;
    },
  },
];
