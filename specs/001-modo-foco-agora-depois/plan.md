# Implementation Plan: Modo Foco "Agora e Depois" (First–Then)

**Branch**: `main` | **Date**: 2026-11-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-modo-foco-agora-depois/spec.md`

## Summary

Implementar o **Modo Foco "Agora e Depois" (First–Then)** no `rotina-thales`: um modo visual de baixo estímulo acessível pelo cabeçalho que foca a rotina de hoje (`todayIndex`), exibe em destaque apenas a atividade atual (**Agora**) com ilustração/emoji, horário, botão **Concluir**, ação rápida **Desfazer**, botão direto para o **Timer Visual** e navegação discreta entre pendências, seguido pelo cartão compacto **Depois**. A seleção de atividades é encapsulada na função pura `resolveFocusWindow` (`src/utils/focus.ts`), testável nativamente com `node --test` sem novas dependências.

## Technical Context

**Language/Version**: TypeScript (`strict: true`), React 19, Vite 8, Tailwind CSS v4, Node.js `v24.16.0`

**Primary Dependencies**: `react`, `react-dom`, `lucide-react` (`Focus`, `ArrowDown`, `Undo2`, `List`, `ChevronLeft`, `ChevronRight`, `Check`, `Clock`, `Sparkles`), `vite-plugin-pwa` (nenhuma nova dependência)

**Storage**: `localStorage` (`rotina-thales-v1` via `src/utils/storage.ts`, sem alteração de esquema — `isFocusMode` e `manualOffset` são efêmeros de UI)

**Testing**: `node --test tests/focus.test.ts` (suíte unitária nativa Node 24) + `npx tsx normalize.test.mts` + `npm run lint` (`tsc --noEmit`) + `npm run build`

**Target Platform**: Web PWA desktop/mobile offline-first (Windows/Android/iOS/Desktop browsers)

**Project Type**: Single-page React PWA client-side

**Performance Goals**: Renderização instantânea (<16 ms por transição), precache PWA completo (`35` entradas) sem novos assets pesados

**Constraints**: Sem novas dependências em `package.json`, compatível com `strict: true` e execução direta em `node --test`, sem quebra de `PrintContent.tsx` ou `normalizeRoutineState`

**Scale/Scope**: 1 módulo utilitário puro (`src/utils/focus.ts`), 1 componente de visão (`src/components/FocusModeView.tsx`), integração enxuta no `src/App.tsx` e 1 suíte de testes (`tests/focus.test.ts`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. UX de Baixo Estímulo e Acessibilidade (TEA-First)**: **PASS** — Reutiliza `#f6f3ec`, `#3f7396`, `#2f8544`, `#e1f3e5`, `CARD_COLORS`, `Nunito`/`JetBrains Mono`, `getCardImageSrc`, `aria-live="polite"`, foco visível e texto claro em pt-BR.
- **II. Offline-First, Privacidade Local e Impressão (PWA)**: **PASS** — 100% client-side, reutiliza `public/illustrations/*.jpg` já pré-cacheadas, não altera `PrintContent.tsx` nem `@media print`.
- **III. Integridade de Dados e Retrocompatibilidade**: **PASS** — Zero alterações em `RoutineState`, `RoutineCard`, `localStorage` ou `src/utils/storage.ts`.
- **IV. TypeScript Estrito e Dependências Mínimas**: **PASS** — `strict: true`, usa ícones já presentes em `lucide-react`, zero pacotes extras em `package.json`.
- **V. Portão de Verificação Obrigatório**: **PASS** — Plano exige `node --test tests/focus.test.ts`, `normalize.test.mts`, `npm run lint` e `npm run build`.

*(Reavaliação pós-Phase 1: todos os 5 princípios seguem em conformidade sem exceções.)*

## Project Structure

### Documentation (this feature)

```text
specs/001-modo-foco-agora-depois/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas e alternativas
├── data-model.md        # Modelo derivado FocusWindow
├── quickstart.md        # Roteiro de verificação manual e automatizada
├── checklists/
│   └── requirements.md  # Checklist de qualidade da especificação
└── tasks.md             # Lista ordenada de tarefas (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── App.tsx                      # Estado isFocusMode, botão no header e alternância mútua com Visão Semanal/Edição
├── components/
│   └── FocusModeView.tsx        # UI "Agora e Depois" com progresso, Concluir/Desfazer, Timer e navegação calma
└── utils/
    └── focus.ts                 # Função pura resolveFocusWindow e interface FocusWindow

tests/
└── focus.test.ts                # Testes unitários nativos (Node 24 node:test) para resolveFocusWindow
```

**Structure Decision**: Projeto único em `src/` + `tests/` na raiz, mantendo a lógica pura isolada em `src/utils/focus.ts` para testabilidade direta sem DOM e o componente de apresentação em `src/components/FocusModeView.tsx`.

## Complexity Tracking

Nenhuma violação constitucional ou complexidade adicional foi necessária.
