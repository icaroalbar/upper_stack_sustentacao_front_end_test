export const priority = [
  {
    gravity: "Novos recursos",
    value: "5",
    icon: "Server",
    description:
      "Sua organização quer adicionar ou realizar um upgrade nos recursos ou em sua aplicação do seu sistema.",
  },
  {
    gravity: "Orientações gerais",
    value: "4",
    icon: "CircleHelp",
    description:
      "Você tem uma pergunta de desenvolvimento geral ou demais perguntas relacionado ao suporte e ao projeto.",
  },
  {
    gravity: "Sistema de produção prejudicado",
    value: "3",
    icon: "ShieldX",
    description:
      "Funções não críticas de seu aplicativo estão se comportando de forma anormal ou estão reduzidas.",
  },
  {
    gravity: "Sistema de produção desativado",
    value: "2",
    icon: "TriangleAlert",
    description:
      "Sua empresa está sendo afetada de forma significativa. Funções importantes de seu aplicativo não estão disponíveis.",
  },
  {
    gravity: "Sistema crítico para os negócios inativo",
    value: "1",
    icon: "Siren",
    description:
      "Sua empresa está em risco. Funções essenciais de sua aplicação não estão disponíveis e precisar ser resolvidas de caráter urgente.",
  },
];

export const demand = [
  { id: "5c032906-c3e1-4a9f-b8c3-7f50bd1c9f2e", value: "Incidente" },
  { id: "7d27a866-6f39-4dc8-a52a-85722083fd2d", value: "Requisição" },
];

export const demandValues = demand.map((d) => d.id) as [string, ...string[]];
