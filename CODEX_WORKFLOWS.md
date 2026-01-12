# Codex Workflows – Assistentes de Programação

Este arquivo define os fluxos padrão que o Codex deve seguir
ao atuar como assistente de programação neste projeto.

Ferramentas disponíveis:

- GitHub MCP (issues, PRs, histórico)
- Playwright MCP (QA e automação de UI)
- Context7 (contexto e padrões do projeto)

Objetivos:

- Revisões técnicas consistentes
- QA automatizado confiável
- Menos regressões
- Decisões claras antes de merge e deploy

---

## 🔁 Workflow Geral (Regra Base)

Sempre que uma solicitação envolver:

- Pull Request
- Issue
- Mudança de comportamento do usuário
- Autenticação
- UI / UX

O Codex deve:

1. Ler o contexto no GitHub (PR ou issue)
2. Usar Context7 para respeitar padrões do projeto
3. Avaliar riscos técnicos e impactos
4. Executar QA com Playwright quando houver impacto em UI ou fluxo
5. Gerar um resumo claro com decisões e recomendações

---

## 🧩 Template 1 – Revisão de Pull Request

Quando um PR for analisado, o Codex deve:

1. Ler o PR e os arquivos alterados
2. Identificar impactos em:
   - Autenticação
   - Segurança
   - UI / UX
   - Fluxos críticos
3. Verificar cobertura de testes
4. Executar QA com Playwright se houver impacto no comportamento do usuário
5. Gerar um resumo contendo:
   - O que mudou
   - Pontos positivos
   - Riscos
   - Ajustes necessários antes do merge

---

## 🧪 Template 2 – QA Automatizado (Exploratório)

Usar quando houver mudanças funcionais ou visuais.

Passos:

1. Identificar fluxos principais afetados
2. Usar Playwright para navegar como usuário real
3. Validar:
   - Login
   - Fluxo principal
   - Mensagens de erro
   - Elementos críticos da UI
4. Registrar falhas encontradas
5. Gerar relatório simples com:
   - Fluxos testados
   - Status (Passou/Falhou)
   - Observações

Se o Playwright falhar ao iniciar o Chromium (ex: `setsockopt: Operation not permitted`),
usar um Chromium do sistema (não-snap) via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`
e registrar isso no relatório de QA. Snap pode falhar com `snap-confine` em
ambientes restritos.

---

## 🔐 Template 3 – QA de Autenticação

Usar sempre que houver mudanças em autenticação ou sessão.

Passos:

1. Fazer login com usuário de teste válido
2. Confirmar criação de sessão/cookies
3. Validar redirecionamento pós-login
4. Verificar permissões por role
5. Confirmar proteção de rotas
6. Reportar falhas ou comportamentos inesperados

---

## 🐞 Template 4 – Análise de Issue

Quando analisar uma issue, o Codex deve:

1. Ler a issue no GitHub
2. Usar Context7 para entender o contexto do projeto
3. Identificar possíveis causas técnicas
4. Reproduzir o problema com Playwright, se aplicável
5. Sugerir abordagem de correção
6. Listar testes que deveriam existir para evitar regressão

---

## 🧱 Template 5 – Geração de Testes

Quando um bug ou falha for identificado:

1. Definir o cenário de teste necessário
2. Gerar um teste automatizado correspondente
3. Garantir que o teste seja claro e estável
4. Explicar brevemente o que o teste protege

---

## ✅ Template 6 – Decisão Final (Merge / Go–No Go)

Antes de aprovar um PR ou deploy:

1. Resumir o estado atual da mudança
2. Listar riscos restantes
3. Informar se está apto para merge/deploy
4. Se não estiver, indicar exatamente o que falta

---

## 🧠 Regra de Ouro

- Preferir QA automatizado a suposições
- Ser conservador com autenticação e segurança
- Priorizar clareza na decisão final
