"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import ActionsMenu from "./action-menu";
import Icons from "@/components/ui/icons";

export type Ticket = {
  id: string;
  nome: string;
  cliente: string;
  prioridade: string;
  dataCriacao: string;
  dataEncerramento: string;
  status: string;
};

export const PRIORITY_CONFIG: Record<
  string,
  {
    label: string;
    variant:
      | "priorityLow"
      | "priorityNormal"
      | "priorityHigh"
      | "priorityUrgent";
  }
> = {
  // Valores numéricos (1 = mais urgente, 4 = mais baixa)
  "1": { label: "Urgente", variant: "priorityUrgent" },
  "2": { label: "Alta", variant: "priorityHigh" },
  "3": { label: "Normal", variant: "priorityNormal" },
  "4": { label: "Baixa", variant: "priorityLow" },
  "5": { label: "Baixa", variant: "priorityLow" },
  // Possíveis valores textuais em inglês/português
  urgent: { label: "Urgente", variant: "priorityUrgent" },
  urgente: { label: "Urgente", variant: "priorityUrgent" },
  high: { label: "Alta", variant: "priorityHigh" },
  alta: { label: "Alta", variant: "priorityHigh" },
  medium: { label: "Normal", variant: "priorityNormal" },
  normal: { label: "Normal", variant: "priorityNormal" },
  low: { label: "Baixa", variant: "priorityLow" },
  baixa: { label: "Baixa", variant: "priorityLow" },
};

const PRIORITY_ICON_COLORS: Record<string, string> = {
  priorityLow: "text-slate-500",
  priorityNormal: "text-blue-500",
  priorityHigh: "text-yellow-400",
  priorityUrgent: "text-red-600",
  secondary: "text-muted-foreground",
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    colorClass: string;
  }
> = {
  "novo ticket": { label: "Novo ticket", colorClass: "bg-slate-400" },
  novo: { label: "Novo ticket", colorClass: "bg-slate-400" },
  atrasado: { label: "Atrasado", colorClass: "bg-red-500" },
  cancelado: { label: "Cancelado", colorClass: "bg-red-500" },
  "retorno cliente": { label: "Retorno cliente", colorClass: "bg-blue-500" },
  "retorno do cliente": {
    label: "Retorno cliente",
    colorClass: "bg-blue-500",
  },
  "em andamento": { label: "Em andamento", colorClass: "bg-blue-500" },
  pendencia: {
    label: "Pendência",
    colorClass: "bg-yellow-400",
  },
  pendência: {
    label: "Pendência",
    colorClass: "bg-yellow-400",
  },
  "pendencia cliente": {
    label: "Pendência",
    colorClass: "bg-yellow-400",
  },
  "pendência cliente": {
    label: "Pendência",
    colorClass: "bg-yellow-400",
  },
  resolvido: { label: "Fechado", colorClass: "bg-emerald-500" },
  fechado: { label: "Fechado", colorClass: "bg-emerald-500" },
  finalizado: { label: "Finalizado", colorClass: "bg-emerald-500" },
};

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "nome",
    header: "Título",
    cell: ({ row }) => {
      const value = row.getValue("nome") as string;
      const rawStatus = row.original.status as string | null | undefined;

      const normalizedStatus =
        rawStatus
          ?.trim()
          .toLowerCase()
          .replace(/[_-]+/g, " ")
          .replace(/\s+/g, " ") ?? "";
      const config = normalizedStatus
        ? (STATUS_CONFIG[normalizedStatus] ?? null)
        : null;

      const statusLabel = config?.label ?? rawStatus ?? "Status não informado";
      const colorClass = config?.colorClass ?? "bg-slate-400/60";

      if (!value) return null;

      return (
        <div className="flex items-center gap-2">
          {rawStatus && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="flex h-3 w-3 items-center justify-center rounded-full"
                >
                  <span
                    className={`block h-2 w-2 rounded-full ${colorClass}`}
                  />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="px-3 py-2 text-xs">
                <span className="font-medium">Status: </span>
                {statusLabel}
              </HoverCardContent>
            </HoverCard>
          )}
          <span className="truncate font-medium">{value}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "cliente",
    header: "Cliente",
    cell: ({ row }) => {
      const value = row.getValue("cliente") as string;
      return value && <div className="capitalize">{value}</div>;
    },
  },
  {
    accessorKey: "prioridade",
    header: () => <div className="w-full text-center">Prioridade</div>,
    cell: ({ row }) => {
      const value = row.getValue("prioridade") as string | number | null;

      if (value === null || value === undefined || value === "") {
        return null;
      }

      const normalized = String(value).trim().toLowerCase();

      const config =
        PRIORITY_CONFIG[normalized] ??
        PRIORITY_CONFIG[String(Number(normalized))] ??
        null;

      const label = config?.label ?? String(value);
      const variant = config?.variant ?? "secondary";

      return (
        <div className="flex items-center justify-center">
          <HoverCard>
            <HoverCardTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center"
              >
                <Icons
                  name="Flag"
                  className={
                    PRIORITY_ICON_COLORS[variant] ??
                    PRIORITY_ICON_COLORS.secondary
                  }
                />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="px-3 py-2 text-xs">
              <span className="font-medium">Prioridade: </span>
              {label}
            </HoverCardContent>
          </HoverCard>
        </div>
      );
    },
  },
  {
    accessorKey: "dataCriacao",
    header: () => <div className="w-full text-center">Criado em</div>,
    cell: ({ row }) => {
      const value = row.getValue("dataCriacao") as string;

      if (!value) return null;

      // Tenta extrair apenas a parte da data (antes do espaço ou do "T")
      const dateOnly = value.split(", ")[0].split("T")[0];

      return <div className="w-full text-center">{dateOnly}</div>;
    },
  },
  {
    accessorKey: "dataEncerramento",
    header: () => <div className="w-full text-center">Finalizado em</div>,
    cell: ({ row }) => {
      const value = row.getValue("dataEncerramento") as string | null;

      if (!value) {
        return <div className="w-full text-center">—</div>;
      }

      const dateOnly = value.split(", ")[0].split("T")[0];

      return <div className="w-full text-center">{dateOnly}</div>;
    },
  },
  {
    header: "Ações",
    cell: ({ row }) => {
      return <ActionsMenu row={row} id={row.original.id} />;
    },
  },
];
