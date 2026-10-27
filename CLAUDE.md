# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file, static construction-project finance tracker (`index.html`), installable as a PWA. No build step, no package.json — one HTML file with inline CSS and JS, loading Chart.js and supabase-js from a CDN (both pinned to an exact version with an SRI hash). Supabase provides auth (email/password) and Postgres storage; `localStorage` is a per-user local cache so the app also works offline. UI text is Brazilian Portuguese.

## Commands

No build, lint, or test tooling. Run locally with `npx serve .` (the service worker only registers over https). There are no automated tests.

## Architecture

- **Data shape** — `data = {v, obras:[{id, nome, cliente, resp, endereco, inicio, fim, contrato, area, status, obs, u, etapas:[{id, nome, orcado, fisico, ini, fim, u}], lanc:[{id, tipo:'s'|'e', desc, data, cat, etapaId, forn, qtd, un, unit, valor, status:'pago'|'pend', venc, pg, forma, doc, obs, u}]}], del:{[id]: timestamp}}`. Dates are `YYYY-MM-DD` strings. **All money is integer centavos**; convert with `cents()` (parse input) and `fmt()`/`fmtN()` (display). Never store floats for money.
- **Mutations** — set the record's `u` to `Date.now()`, then call `commit()` (bumps `editSeq`, marks `dirty`, writes the cache, calls `render()`, debounces `sync()`). Deletions must also add the id to `data.del` (tombstone) or the record will come back on the next merge.
- **`sync()`** — reads the remote `obras_data` row, merges with `mergeData()` (per-record newest `u` wins; tombstoned ids are dropped; obra-level fields and nested `etapas`/`lanc` are merged separately), and writes with an optimistic check on the `rev` column, retrying when another device wrote in between. When not `dirty`, it simply adopts the remote copy. Runs on edit, on `online`, on tab visibility, and every 45s.
- **`render()`** — sole re-render entry point; does not save. Rebuilds the visible views from `data` (`renderPainel`, `renderLanc`, `renderOrc`, `renderContas`, `renderObras`); `renderRel`/`drawCharts` only when the Relatórios tab is active. The Lançamentos filter bar is created once and kept so typing in it isn't interrupted.
- **`calc(o)`** — all derived numbers for an obra (budget, paid/pending, by stage/category/supplier, physical vs. financial progress, EAC = realized ÷ physical %, margin). `alertas()` and the views read from it — put new metrics there.
- **Forms** are native `<dialog>`s (`dlgLanc`, `dlgObra`, `dlgEtapa`) with `open*`/`save*`/`del*` functions.
- **HTML building** uses template strings; always pass user text through `esc()`.
- **PWA** — `manifest.webmanifest`, `sw.js` (network-first for HTML, cache for the pinned CDN libs and icons; never caches Supabase calls). Bump `CACHE` in `sw.js` when shell files change.

## Backend (Supabase)

Schema in `supabase/schema.sql`: `obras_data(user_id pk references auth.users, data jsonb, rev bigint, updated_at)` with RLS limiting select/insert/update to `auth.uid() = user_id`. `SUPABASE_URL`/`SUPABASE_KEY` (publishable/anon key, safe client-side) are hardcoded near the top of the `<script>`. Never put the `service_role`/secret key in this file.

## Data & privacy

Never commit real project or financial data (client names, values) to the repo — real data lives only in Supabase (per user, via RLS) and in the browser cache.
