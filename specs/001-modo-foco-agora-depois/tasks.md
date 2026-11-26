---

description: "Task list for Modo Foco 'Agora e Depois' (First-Then)"
---

# Tasks: Modo Foco "Agora e Depois" (First–Then)

**Input**: Design documents from `/specs/001-modo-foco-agora-depois/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Incluídos explicitamente por `FR-009` e Princípio V para cobrir `resolveFocusWindow`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)

## Phase 1: Setup & Foundational

**Purpose**: Lógica pura derivada `FocusWindow` e suíte unitária nativa antes da UI

- [x] T001 Implementar interface `FocusWindow` (`current`, `next`, `pending`, `currentIndex`, `totalCount`, `doneCount`, `allDone` conforme `data-model.md#FocusWindow`), `parseTimeToMinutes` e `resolveFocusWindow` em `src/utils/focus.ts`
- [x] T002 [P] Criar testes unitários cobrindo os 8 cenários de `resolveFocusWindow` em `tests/focus.test.ts` (dia vazio, tudo concluído, antes da primeira tarefa, meio do dia ignorando tarefa matinal passada, avanço pós-conclusão, fallback de fim do dia, `manualOffset` com clamp e última pendente com `next === null`)

**Checkpoint**: `node --test tests/focus.test.ts` passa com todos os 8 cenários

---

## Phase 2: User Story 1 - Foco visual Agora e Depois com conclusão e desfazer rápido (Priority: P1) 🎯 MVP

**Goal**: Exibir somente a atividade atual (**Agora**) e a próxima (**Depois**), progresso do dia, ação **Concluir** e banner **Desfazer** de 1 toque.

**Independent Test**: Ativar Modo Foco no cabeçalho, concluir uma atividade em **Agora** e desfazer pelo banner exibido.

- [x] T003 [US1] Criar componente `FocusModeView` em `src/components/FocusModeView.tsx` com card de progresso diário, cartão em destaque **Agora** (`CARD_COLORS`, `getCardImageSrc`, horário `font-mono tabular-nums`, botão **Concluir**), conector `ArrowDown` + card **Depois** e banner suave **Desfazer**
- [x] T004 [US1] Integrar estado `isFocusMode`, alternância no cabeçalho (`Focus` icon, `aria-pressed`), subtítulo específico e renderização exclusiva do `FocusModeView` em `src/App.tsx` (ocultando abas de dia e `RoutineBlocksBar` no Modo Foco)

---

## Phase 3: User Story 2 - Abrir Timer Visual diretamente do cartão Agora (Priority: P2)

**Goal**: Permitir abrir o `VisualTimerModal` dentro do cartão **Agora** sem sair do Modo Foco.

**Independent Test**: Clicar em **Timer** dentro do cartão **Agora** e fechar o modal mantendo o Modo Foco ativo.

- [x] T005 [US2] Adicionar botão **Timer** com ícone `Clock` no cartão **Agora** de `src/components/FocusModeView.tsx` conectado a `onOpenTimer` em `src/App.tsx`

---

## Phase 4: User Story 3 - Navegação calma entre pendentes, conclusão do dia e saída do modo (Priority: P3)

**Goal**: Permitir navegar discretamente entre pendentes, celebrar fim da rotina do dia com calma e sair para a lista completa ou outros modos.

**Independent Test**: Percorrer pendentes com setas Anterior/Próxima, concluir todas as tarefas de hoje e sair por **Ver lista** ou troca de aba/modo.

- [x] T006 [US3] Adicionar controles discretos Anterior/Próxima (`ChevronLeft`/`ChevronRight` e contador `${currentIndex + 1}/${pending.length}`), estado vazio de dia (`totalCount === 0`), card calmo de dia concluído (`allDone`) e aviso de última atividade de hoje (`!next`) em `src/components/FocusModeView.tsx`
- [x] T007 [US3] Garantir encerramento automático de `isFocusMode` ao selecionar dia, alternar Visão Semanal ou entrar em Modo Edição em `src/App.tsx`

---

## Phase 5: Polish & Verification

**Purpose**: Verificação integral exigida pelo Princípio V da Constituição

- [x] T008 Verificar `tsconfig.json` (adicionar `"exclude": ["tests"]` se necessário para não misturar tipos Node ao cliente browser), executar `node --test tests/focus.test.ts`, `normalize.test.mts`, `npm run lint` e `npm run build`
- [x] T009 Atualizar `specs/001-modo-foco-agora-depois/tasks.md` marcando as tarefas concluídas e revisar `git status -sb` antes do commit
