# CLAUDE.md — Projeto IA Volta

## Plugins e Skills Instalados

### Commit Commands
Comandos git simplificados para commit, push e PR.
- `/commit` — Cria commit com mensagem gerada automaticamente
- `/commit-push-pr` — Commit + push + criação de PR em um passo
- `/clean_gone` — Remove branches locais deletadas do remoto

---

### Code Review
Review automatizado de PRs com múltiplos agentes especializados.
- `/code-review` — Review de um PR com scoring por confiança

---

### PR Review Toolkit
Conjunto de agentes especializados para revisão profunda de PRs.
- `comment-analyzer` — Analisa precisão e manutenibilidade de comentários
- `pr-test-analyzer` — Analisa qualidade e cobertura de testes
- `silent-failure-hunter` — Detecta falhas silenciosas e problemas de error handling
- `type-design-analyzer` — Analisa qualidade de tipos e invariantes
- `code-reviewer` — Review de compliance com CLAUDE.md e bugs
- `code-simplifier` — Oportunidades de simplificação e refactoring

---

### Feature Development
Workflow sistemático de 7 fases para desenvolvimento de features.
- `/feature-dev` — Lança workflow guiado com exploração, arquitetura e review
- Agentes: `code-explorer`, `code-architect`, `code-reviewer`

---

### CLAUDE.md Management
Mantém e melhora arquivos CLAUDE.md.
- `/revise-claude-md` — Captura aprendizados da sessão atual no CLAUDE.md
- Skill `claude-md-improver` — Audita CLAUDE.md contra o estado atual do codebase

---

### Claude Code Setup
Analisa o codebase e recomenda automações (MCP servers, skills, hooks, subagents).
- Skill `claude-code-setup` — Recomenda as 1-2 melhores automações por categoria

---

### Agent SDK Development
Cria e verifica aplicações Claude Agent SDK em Python e TypeScript.
- `/new-sdk-app` — Cria nova aplicação Claude Agent SDK interativamente
- Agentes: `agent-sdk-verifier-py`, `agent-sdk-verifier-ts`

---

### Plugin Development Toolkit
Toolkit completo para criar plugins para Claude Code.
- `/plugin-dev:create-plugin` — Workflow de 8 fases para criar plugins do zero
- Skills: `hook-development`, `mcp-integration`, `plugin-structure`, `plugin-settings`, `command-development`, `agent-development`, `skill-development`

---

### Skill Creator
Cria, melhora e mede performance de skills com evals.
- Skill `skill-creator` — Cria, atualiza e otimiza skills

---

### Hookify
Cria hooks personalizados para prevenir comportamentos indesejados.
- `/hookify` — Cria regras a partir de instruções ou análise de conversa
- `/hookify:list` — Lista todas as regras
- `/hookify:configure` — Configura regras interativamente
- `/hookify:help` — Ajuda

---

### Ralph Loop
Loop iterativo de auto-melhoria (técnica Ralph Wiggum).
- `/ralph-loop` — Inicia um loop Ralph na sessão atual
- `/cancel-ralph` — Cancela o loop ativo

---

### Frontend Design
Gera interfaces frontend distintivas e production-grade sem estética genérica de IA.
- Skill `frontend-design` — Ativada automaticamente para trabalho frontend

---

### Playground
Cria playgrounds HTML interativos e auto-contidos.
- Skill `playground` — Gera playgrounds com templates visuais interativos

---

### Explanatory Output Style
Hook que adiciona insights educacionais sobre escolhas de implementação.
- Ativado automaticamente via SessionStart hook

---

### Learning Output Style
Modo de aprendizado interativo com insights educacionais em pontos de decisão.
- Ativado automaticamente via SessionStart hook
