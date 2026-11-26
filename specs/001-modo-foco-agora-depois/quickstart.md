# Quickstart & Verification: Modo Foco "Agora e Depois"

## Verificações Automatizadas

Executar a partir da raiz `c:\Users\diego\Downloads\Nova pasta (3)\rotina-thales`:

```powershell
node --test tests/focus.test.ts
npx tsx "C:\Users\diego\.gemini\antigravity\brain\2929c600-e0eb-4dd2-8ea9-795d49fbd7fe\scratch\normalize.test.mts"
npm run lint
npm run build
```

## Cenários de Validação Manual

1. **Ativar Modo Foco**: Tocar no botão **Modo Foco (Agora e Depois)** no cabeçalho; confirmar que as abas de dia e os blocos somem e aparece apenas **Agora** + **Depois** + barra de progresso.
2. **Concluir e Desfazer**: Tocar em **Concluir** no cartão **Agora**; confirmar avanço imediato para a próxima atividade pendente e funcionamento do banner **Desfazer**.
3. **Timer direto no Modo Foco**: Tocar em **Timer** dentro do cartão **Agora**; iniciar ou fechar o `VisualTimerModal` e confirmar permanência no Modo Foco.
4. **Navegação e Retorno**: Percorrer pendentes com Anterior/Próxima, testar conclusão de todas as tarefas e clicar em **Ver lista** para retornar à lista padrão.
