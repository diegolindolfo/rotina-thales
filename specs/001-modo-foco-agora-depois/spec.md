# Feature Specification: Modo Foco "Agora e Depois" (First–Then)

**Feature Branch**: `main`

**Created**: 2026-11-26

**Status**: Approved

**Input**: User description: "Adicionar Modo Foco 'Agora e Depois' (First–Then) para apoio visual de baixo estímulo para crianças autistas no Rotina do Thales, mostrando apenas a atividade atual e a próxima pendente com ação direta de concluir, desfazer rápido, acesso ao Timer Visual e navegação calma entre pendentes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Foco visual Agora e Depois com conclusão e desfazer rápido (Priority: P1)

Como criança ou cuidador usando o quadro visual do **Rotina do Thales**, quero ativar um **Modo Foco** no cabeçalho para enxergar somente a atividade que preciso fazer **Agora** (em destaque com ilustração ou emoji, horário e botão **Concluir**) e a prévia calma da próxima atividade (**Depois**), reduzindo sobrecarga visual durante transições difíceis.

**Why this priority**: A estratégia visual *First–Then* ("Primeiro / Depois") é o padrão ouro no apoio a crianças autistas para reduzir ansiedade e melhorar previsibilidade de transição sem poluir a tela com toda a lista do dia.

**Independent Test**: Ativar o botão **Modo Foco (Agora e Depois)** no cabeçalho estando no dia de hoje; verificar que as abas de dia e blocos ficam ocultas, o cartão **Agora** e o cartão **Depois** aparecem com o progresso diário, clicar em **Concluir** avança automaticamente para a próxima pendente e exibe o aviso suave **Desfazer** funcional.

**Acceptance Scenarios**:

1. **Given** a rotina de hoje possui atividades pendentes, **When** o usuário ativa o botão de Modo Foco no cabeçalho, **Then** a tela exibe o resumo de progresso de hoje, o cartão em destaque **Agora** com imagem/emoji, horário e botão **Concluir**, e abaixo o cartão compacto **Depois** com a próxima atividade pendente.
2. **Given** o Modo Foco está aberto mostrando a atividade atual **Agora**, **When** o usuário toca em **Concluir**, **Then** a atividade é marcada como concluída no estado diário (com som de conclusão quando ativado), o cartão **Agora** avança para a próxima atividade pendente e um banner calmo oferece o botão **Desfazer** para reverter o clique acidental em um toque.

---

### User Story 2 - Abrir Timer Visual diretamente do cartão Agora (Priority: P2)

Como criança ou cuidador em uma tarefa no Modo Foco, quero abrir o **Timer Visual** diretamente a partir do cartão **Agora** para acompanhar visualmente o tempo de espera ou transição sem sair do Modo Foco.

**Why this priority**: Muitas transições no TEA combinam o apoio *First–Then* com um temporizador visual; abrir o timer dentro do cartão atual evita que o usuário precise sair do modo simplificado.

**Independent Test**: No Modo Foco com uma atividade ativa, clicar no botão **Timer** do cartão **Agora** e verificar que o `VisualTimerModal` abre corretamente e, ao fechá-lo, o usuário permanece no Modo Foco.

**Acceptance Scenarios**:

1. **Given** o Modo Foco exibe uma atividade **Agora**, **When** o usuário toca no botão **Timer**, **Then** o modal do Timer Visual é aberto mantendo o Modo Foco ativo ao fundo.

---

### User Story 3 - Navegação calma entre pendentes, conclusão do dia e saída do modo (Priority: P3)

Como cuidador ou criança, quero avançar ou voltar discretamente entre as atividades pendentes do dia, visualizar uma celebração calma quando todas forem concluídas e retornar para a lista completa a qualquer momento.

**Why this priority**: Permite lidar com situações reais (pular temporariamente uma atividade adiada, revisar uma anterior ou celebrar o fim do dia sem estímulo excessivo).

**Independent Test**: Em um dia com múltiplas pendências, usar as setas Anterior/Próxima no cartão **Agora** para percorrer pendentes respeitando os limites; concluir todas as tarefas e verificar a mensagem de parabéns; clicar em **Ver lista** (ou no botão do cabeçalho) e verificar o retorno à visualização padrão por blocos.

**Acceptance Scenarios**:

1. **Given** existem duas ou mais atividades pendentes hoje no Modo Foco, **When** o usuário toca nas setas Anterior/Próxima no topo do cartão **Agora**, **Then** a visualização muda calmamente entre as pendências mantendo coerência com **Depois**.
2. **Given** todas as atividades de hoje foram concluídas, **When** o Modo Foco está ativo, **Then** é exibida uma mensagem calma de conclusão do dia com a ação **Ver rotina completa**.
3. **Given** o usuário está no Modo Foco, **When** toca em **Ver lista**, seleciona um dia, abre **Visão Semanal** ou entra em **Edição**, **Then** o Modo Foco é encerrado de forma previsível e a visualização solicitada assume a tela.

---

### Edge Cases

- **Dia sem atividades cadastradas**: exibe card vazio calmo informando que não há atividades hoje e botão para sair do Modo Foco e voltar à lista.
- **Última atividade pendente do dia**: o bloco **Depois** informa de forma tranquila que esta é a última atividade de hoje e que toda a rotina estará concluída ao marcá-la.
- **Atividades da manhã não marcadas no meio do dia**: no horário atual, o algoritmo prioriza a atividade pendente correspondente ao horário vigente (ou próxima do horário), em vez de prender a criança em uma tarefa antiga da manhã; se não houver mais pendentes à frente do horário atual, faz fallback para a primeira pendente anterior ainda não concluída.
- **Alternância entre modos**: ativar o Modo Foco seleciona automaticamente o dia de hoje (`todayIndex`) e desativa `isWeekView` e `isEditMode`; sair pelo botão do cabeçalho, **Ver lista**, troca de dia, Visão Semanal ou Edição preserva todas as alterações salvas em `localStorage`.
- **Impressão**: `PrintContent.tsx` permanece intacto para impressão diária e semanal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar um botão acessível de alternância **Modo Foco (Agora e Depois)** no cabeçalho (`aria-pressed` e rótulo claro).
- **FR-002**: Ao ativar o Modo Foco, o sistema DEVE focar o dia de hoje (`todayIndex`), desativar Visão Semanal e Modo Edição, e ocultar as abas de dia e blocos para reduzir ruído visual.
- **FR-003**: A seleção da janela de foco (`resolveFocusWindow`) DEVE ser determinística, pura e baseada em horários (`HH:MM`) e lista de IDs concluídos (`doneIds`), retornando `current`, `next`, `pending`, `currentIndex`, `totalCount`, `doneCount` e `allDone`.
- **FR-004**: O cartão **Agora** DEVE usar a paleta pastel do cartão (`CARD_COLORS`), renderizar a ilustração do Thales ou foto customizada ou emoji via `getCardImageSrc(card)`, exibir o horário em `font-mono tabular-nums`, o título em destaque e o botão **Concluir**.
- **FR-005**: Após concluir uma atividade pelo Modo Foco, o sistema DEVE oferecer um banner discreto com ação **Desfazer** de 1 toque para reverter o clique acidental enquanto o item permanecer concluído.
- **FR-006**: O cartão **Agora** DEVE incluir botão **Timer** que abre o `VisualTimerModal` existente sem perder o contexto do Modo Foco.
- **FR-007**: Quando houver mais de uma atividade pendente, o cartão **Agora** DEVE exibir controles discretos Anterior/Próxima com indicador numérico (`indice/total`), e o cartão **Depois** DEVE mostrar a próxima pendente ou aviso de última atividade do dia.
- **FR-008**: A funcionalidade NÃO DEVE alterar o esquema persistido em `localStorage` (`RoutineState`) nem adicionar dependências npm externas.
- **FR-009**: Toda a lógica de seleção `resolveFocusWindow` DEVE ser coberta por testes unitários automatizados executáveis localmente.

### Key Entities

- **FocusWindow**: Visão derivada em memória contendo `current` (`RoutineCard | null`), `next` (`RoutineCard | null`), `pending` (`RoutineCard[]`), `currentIndex` (`number`), `totalCount` (`number`), `doneCount` (`number`) e `allDone` (`boolean`), calculada a partir das atividades do dia atual e dos IDs concluídos em `RoutineState.done.ids`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue alternar para o Modo Foco e concluir a atividade atual em 1 toque diretamente pelo cartão **Agora**, com atualização imediata de progresso e prévia **Depois**.
- **SC-002**: 100% dos cenários de borda da função `resolveFocusWindow` (dia vazio, tudo concluído, antes da primeira tarefa, meio do dia com tarefa matinal pendente, fallback no fim do dia, deslocamento manual e última tarefa) passam nos testes automatizados via `node --test`.
- **SC-003**: `npm run lint` (`tsc --noEmit`) e `npm run build` (`vite build`) executam com código de saída `0` e mantêm o precache PWA completo (`35` entradas).
- **SC-004**: Nenhuma regressão é introduzida na normalização de `RoutineState` (`normalizeRoutineState`) nem na impressão (`PrintContent.tsx`).

## Assumptions

- O Modo Foco atua sempre sobre a rotina do dia atual (`todayIndex`), alinhado ao objetivo prático de uso em tempo real no dia a dia.
- O estado `isFocusMode` e o deslocamento manual temporário (`manualOffset`) são transitórios de sessão de UI e não precisam ser persistidos em `localStorage`.
- As 18 ilustrações já integradas em `public/illustrations/*.jpg` e fotos customizadas existentes são reutilizadas diretamente via `getCardImageSrc`.
