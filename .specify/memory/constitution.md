# Rotina do Thales Constitution

## Core Principles

### I. UX de Baixo Estímulo e Acessibilidade (TEA-First)

Toda interface do **Rotina do Thales** DEVE priorizar previsibilidade visual, baixo estímulo sensorial e clareza imediata para crianças autistas e seus cuidadores. O sistema DEVE preservar a paleta pastel suave definida em `src/index.css` e `CARD_COLORS` (`#f6f3ec` de fundo e os 6 tons pastéis `#dcebf5`, `#e3f1dc`, `#fbeed3`, `#f6dfe6`, `#e8e1f3`, `#f3e6d9`), as famílias tipográficas `Nunito` e `JetBrains Mono`, suporte a `prefers-reduced-motion: reduce`, foco visível acessível (`:focus-visible`) e textos em português brasileiro (`pt-BR`). As ilustrações padrão em `public/illustrations/*.jpg` (18 arquivos JPEG `320×320` do personagem Thales) DEVEM manter estilo vetor flat suave e coerência visual.

### II. Offline-First, Privacidade Local e Impressão (PWA)

O aplicativo DEVE operar 100% no cliente (`client-side`), sem backend proprietário, sem contas obrigatórias e sem envio de dados pessoais ou fotos do usuário para serviços externos em runtime. Todo o estado da rotina DEVE permanecer em `localStorage` (`rotina-thales-v1` em `src/utils/storage.ts`), com suporte completo offline garantido pelo `vite-plugin-pwa` e precache Workbox cobrindo `**/*.{js,css,html,ico,png,svg,jpg}`. Alterações de interface DEVEM preservar a visão semanal e o layout de impressão limpo (`src/components/PrintContent.tsx` e regras `@media print` em `src/index.css`).

### III. Integridade de Dados e Retrocompatibilidade

Qualquer alteração no esquema de dados (`RoutineState`, `RoutineCard`, `DoneState`, `TimerConfig` em `src/types/routine.ts`) DEVE manter compatibilidade retroativa com rotinas já salvas em `localStorage` ou arquivos de backup importados. A função de normalização defensiva em `src/utils/storage.ts` DEVE descartar entradas malformadas sem quebrar o carregamento da aplicação, validar horários (`HH:MM`), blocos e índices de cor, e preservar a precedência de mídia dos cartões definida em `getCardImageSrc` e `resolveCardIllustrationId`: foto customizada (`p`) > emoji explícito (`i: 'none'`) > ilustração explícita (`i`) > correspondência automática por título/emoji > fallback por emoji.

### IV. TypeScript Estrito e Dependências Mínimas

O código-fonte DEVE compilar sob `strict: true` no `tsconfig.json` sem supressões injustificadas de tipo e sem código duplicado. A arquitetura DEVE permanecer enxuta sobre React 19, Vite 8, Tailwind CSS v4 e Lucide React, utilizando exclusivamente `npm` como gerenciador de pacotes (sem reintroduzir `bun.lock` ou dependências não utilizadas). Novas bibliotecas só PODEM ser adicionadas quando funcionalidade equivalente não puder ser implementada de forma simples e sustentável com a stack existente.

### V. Portão de Verificação Obrigatório

Nenhuma entrega funcional PODE ser considerada concluída ou pronta para commit sem verificação executada após a última edição. O portão mínimo DEVE incluir `npm run lint` (`tsc --noEmit`) com saída zero, testes de normalização/regressão sempre que houver alteração em `src/utils/storage.ts` ou `src/types/routine.ts`, e `npm run build` (`vite build`) gerando o bundle e o manifesto/precache PWA (`PWA v2.0.0`) sem erros ou ativos faltantes.

## Stack e Restrições Técnicas

- **Stack principal**: React 19 (`react`, `react-dom`), TypeScript (`strict: true`), Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), `lucide-react` e `vite-plugin-pwa`.
- **Plataforma alvo**: Navegadores desktop e mobile com instalação PWA offline e impressão em papel (`@media print` com margem `12mm` e preservação de cores).
- **Ativos visuais**: Ilustrações em `public/illustrations/*.jpg` registradas em `ROUTINE_ILLUSTRATIONS` (`src/types/routine.ts`) e pré-cacheadas pelo Workbox para uso imediato sem rede.
- **Armazenamento e segurança**: Somente `localStorage` no dispositivo do usuário; imagens enviadas pelo usuário devem ser validadas quanto ao prefixo `data:image/` durante a normalização.

## Fluxo de Desenvolvimento e Portões de Qualidade

- Especificações, planos e tarefas de novas funcionalidades DEVEM ser conduzidos pelo fluxo Spec Kit (`/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement` → `/speckit-converge`) antes de grandes mudanças de escopo.
- Antes de publicar alterações em `main`, revisar o `git status` e `git diff` para impedir arquivos temporários (`*.zip`, `dev-dist/`) e validar que `.agents/` e `.specify/` permaneçam íntegros sem edições manuais nos skills gerados pelo `specify-cli`.
- Cada plano técnico (`/speckit-plan`) DEVE passar pela verificação constitucional confirmando adesão aos Princípios I a V antes da fase de implementação.

## Governance

Esta Constituição prevalece sobre práticas ad hoc e orienta todas as especificações, planos técnicos e revisões do **Rotina do Thales**. Emendas DEVEM ser feitas via `/speckit-constitution`, acompanhadas de revisão explícita dos impactos nos templates em `.specify/templates/` e incremento de versão semântica: **MAJOR** para remoção ou redefinição incompatível de princípios, **MINOR** para adição ou expansão material de princípio/seção, e **PATCH** para esclarecimentos e ajustes redacionais. Toda revisão ou entrega DEVE verificar conformidade com os Princípios I a V e registrar justificativa explícita na seção *Complexity Tracking* caso alguma exceção temporária seja necessária.

**Version**: 1.0.0 | **Ratified**: 2026-11-26 | **Last Amended**: 2026-11-26
