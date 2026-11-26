# Research & Decisions: Modo Foco "Agora e Depois"

## 1. Algoritmo de seleção da atividade "Agora" e "Depois"

- **Decisão**: `resolveFocusWindow(dayCards, doneIds, currentMinutes, manualOffset)` calcula primeiro a faixa horária ativa (`activeSlot`) em `dayCards` da mesma forma que `App.tsx` (`findIndex(c => parseTimeToMinutes(c.t) > currentMinutes) - 1`, limitado a `>= 0`). Em seguida localiza em `pending` (cartões ainda não incluídos em `doneIds`) a primeira atividade cujo índice original é `>= startSlot`. Se não existir pendente à frente (ex.: fim do dia com tarefa matinal não marcada), faz fallback para `pending[0]`. O `manualOffset` desloca o cursor dentro de `pending` com clamp `[0, pending.length - 1]`.
- **Justificativa**: Evita que às 15h a criança fique presa em uma tarefa das 06:40 que o cuidador esqueceu de marcar, mantendo ainda acesso às pendências anteriores no fim do dia ou via setas.
- **Alternativa rejeitada**: Sempre exibir `pending[0]` ignorando o relógio — ruim quando o aplicativo é aberto no meio da tarde após uso parcial de manhã.

## 2. Testes unitários sem dependências extras

- **Decisão**: Usar `node:test` e `node:assert/strict` nativos do Node `v24.16.0` sobre `src/utils/focus.ts` utilizando `import type { RoutineCard } from '../types/routine.ts'` (sintaxe apagável de TypeScript). Caso `tsc --noEmit` reclame de tipos Node em `tests/`, excluir `tests` no `tsconfig.json` sem poluir `compilerOptions.types` do bundle browser.
- **Justificativa**: Atende ao Princípio IV (Dependências Mínimas) mantendo `package.json` limpo e oferecendo execução rápida (<200 ms).

## 3. Exclusividade mútua entre modos no `App.tsx`

- **Decisão**: `isFocusMode` é mutuamente exclusivo com `isWeekView` e `isEditMode`. Ativar o Modo Foco sempre aponta `activeDayIndex` para `todayIndex`. Selecionar outro dia, alternar Visão Semanal ou ativar Modo Edição encerra automaticamente `isFocusMode`.
- **Justificativa**: Garante previsibilidade de navegação e evita combinações confusas (ex.: editar lista ou ver semana enquanto o Modo Foco oculta abas).
