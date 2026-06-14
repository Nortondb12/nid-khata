# Plano de Refatoração e Otimização — NID Server Copy App

## Estado atual

Já concluído nas iterações anteriores:
- **Fase 1–5** — Arquitetura por feature (`src/features/nid/*`), schemas zod, hook `useNidLookup`, cliente HTTP isolado, lazy load do resultado, esqueletos de loading.
- **Fase 6–9** — Acessibilidade (skip link, `lang="bn"`, `aria-*`, focus-visible), performance básica (QueryClient defaults), SEO (JSON-LD, sitemap, robots), segurança (`safeText`, logger PII-aware).
- **UI moderna** — Header fixo, hero split, seção de passos, cards elevados, formulário com ícones inline e contador, resultado redesenhado, suporte a print e `prefers-reduced-motion`.
- **Lovable Cloud** habilitado (Supabase backend pronto, secrets configurados, sem tabelas ainda).

## Próximas fases propostas

### Fase 10 — Testes automatizados
- Instalar `vitest` + `@testing-library/react` + `jsdom`.
- Testes unitários:
  - `schema.test.ts` — casos válidos/ inválidos para NID (10/13/17 dígitos) e DOB (data futura, < 1900).
  - `safeText.test.ts` — strip de controle, cap de tamanho.
  - `logger.test.ts` — redaction de campos PII.
  - `nidClient.test.ts` — mock `fetch`, casos 200/4xx/5xx, timeout, `NidLookupError`.
- Testes de componente:
  - `NidForm.test.tsx` — valida erros em campos, envia e renderiza resultado, fecha erro de API.
- Script `bun run test` + `test:watch`.

### Fase 11 — Tooling e DX
- Endurecer `tsconfig.app.json`: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- Adicionar script `typecheck` (`tsc --noEmit`).
- Configurar `lint-staged` + `husky` (pre-commit: eslint, typecheck nos arquivos alterados).
- Seção `## Desenvolvimento` no README com scripts, estrutura de pastas e variáveis.

### Fase 12 — Backend seguro (Lovable Cloud)

Mover a chamada da API NID do browser para uma Edge Function, evitando vazamento das credenciais Porichoy.

```text
[ Browser ]                       [ Lovable Cloud ]
NidForm  ──── POST /nid-lookup ──► Edge Function
                                   ├─ valida zod
                                   ├─ rate-limit por IP
                                   ├─ chama Porichoy API (secrets)
                                   ├─ grava audit log
                                   └─ retorna NidData saneado
```

Passos:
1. **Migração**:
   - Tabela `public.nid_lookup_audit` (`id`, `ip_hash`, `nid_hash`, `status`, `created_at`).
   - RLS: bloqueio total para `anon`/`authenticated`; apenas `service_role` lê/escreve.
2. **Edge function `nid-lookup`** (`supabase/functions/nid-lookup/index.ts`):
   - CORS + validação zod do body.
   - Rate-limit simples (janela de 60s por IP via tabela ou KV).
   - Chama Porichoy API usando secrets (`PORICHOY_USERNAME`, `PORICHOY_PASSWORD`).
   - Mapeia resposta para `NidData`, aplica `safeText` server-side.
   - Logga em `nid_lookup_audit` (sem PII bruto — apenas hashes).
3. **Cliente**: trocar `API_ENDPOINT` em `nidClient.ts` para `supabase.functions.invoke("nid-lookup", { body })`.
4. **Secrets**: solicitar `PORICHOY_USERNAME` e `PORICHOY_PASSWORD` quando o usuário tiver as credenciais.
5. **Feature flag**: manter `demo mode` como fallback enquanto Porichoy não responder.

### Fase 13 — Observabilidade e monitoramento (opcional)
- Logs estruturados na edge function (JSON: requestId, status, latência).
- Painel simples `/admin` (rota privada) listando últimos lookups do audit (count, status), protegido por role `admin` (tabela `user_roles` + `has_role`).

### Fase 14 — PWA leve (opcional)
- `manifest.webmanifest`, ícones 192/512, `theme_color`, `display: standalone`.
- Service worker mínimo para cache de assets estáticos (Vite PWA plugin).

## Ordem de execução recomendada

1. **Fase 11** (tooling) — rápida, melhora todas as fases seguintes.
2. **Fase 10** (testes) — congela comportamento atual antes do backend.
3. **Fase 12** (backend) — depende das credenciais Porichoy do usuário.
4. **Fase 13–14** — opcionais, após validação do backend em produção.

Cada fase é independente, revisível e reversível. Posso começar pela fase que preferir — sugiro Fase 11 + 10 em sequência, e aguardar suas credenciais Porichoy para a Fase 12.

---

## Progresso

- **Fase 10 (testes)** — ✅ Concluída. 38 testes em 5 suítes (`schema`, `safeText`, `logger`, `nidClient`) — todos passando.
- **Fase 11 (tooling)** — ✅ Script `bun run typecheck` adicionado. Strict TS NÃO ativado para não quebrar shadcn UI; pode ser adotado por arquivo via `// @ts-strict` no futuro.
- **Fase 12 (backend)** — ⏳ Aguardando credenciais Porichoy do usuário.
