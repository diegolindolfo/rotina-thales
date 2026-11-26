# Data Model: Modo Foco "Agora e Depois"

## Persisted State Changes

**None.** `RoutineState`, `RoutineCard`, `DoneState`, `TimerConfig` e `localStorage` (`rotina-thales-v1`) permanecem exatamente iguais para garantir retrocompatibilidade total (Princípio III).

## Derived View Model (`src/utils/focus.ts`)

### `FocusWindow`

Representa a janela de foco calculada a partir das atividades ordenadas do dia atual e dos IDs concluídos hoje:

| Field | Type | Description |
| --- | --- | --- |
| `current` | `RoutineCard \| null` | Atividade exibida no cartão **Agora** (`null` quando dia vazio ou tudo concluído) |
| `next` | `RoutineCard \| null` | Próxima atividade pendente exibida no cartão **Depois** (`null` na última pendente) |
| `pending` | `RoutineCard[]` | Lista ordenada de atividades ainda não concluídas hoje |
| `currentIndex` | `number` | Índice 0-based de `current` dentro de `pending` (`-1` quando `current === null`) |
| `totalCount` | `number` | Total de atividades do dia |
| `doneCount` | `number` | Quantidade de atividades já concluídas hoje |
| `allDone` | `boolean` | `true` somente quando `totalCount > 0` e `pending.length === 0` |

## Ephemeral UI State (`src/App.tsx` / `src/components/FocusModeView.tsx`)

- `isFocusMode: boolean` (`App.tsx`) — controla exibição do `FocusModeView` e ocultação das abas de dia e barra de blocos.
- `manualOffset: number` (`FocusModeView.tsx`) — deslocamento temporário ao clicar em Anterior/Próxima, reiniciado para `0` ao concluir a atividade atual.
- `lastCompleted: { id: string; title: string } | null` (`FocusModeView.tsx`) — armazena a última tarefa recém-concluída pelo Modo Foco para viabilizar o botão **Desfazer** de 1 toque.
