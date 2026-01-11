"use client";
import Icon, { WhatsAppIcon } from "@/components/ui/icons";
import {
  formatCNPJ,
  formatPhone,
  getWhatsAppLink,
} from "@/components/ui/input-mask";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import ActionsMenu from "./action-menu";

export type Clients = {
  trade_name: string;
  cnpj: string;
  phone_number: string;
  email?: string;
  company_name?: string;
  website?: string;
  aws_account?: string;
  enabled: boolean;
  whatsapp: boolean;
  id: string;
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

export const columns: ColumnDef<Clients>[] = [
  {
    accessorKey: "trade_name",
    header: "Empresa",
    cell: ({ row }) => {
      const company = row.getValue("trade_name") as string;
      return company && <div className="uppercase">{company}</div>;
    },
  },
  {
    accessorKey: "cnpj",
    header: "CNPJ",
    cell: ({ row }) => {
      const cnpj = row.getValue("cnpj") as string;
      return cnpj && <div className="uppercase">{formatCNPJ(cnpj)}</div>;
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
          <div className="flex items-center justify-start gap-x-2">
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
