# Controle de Obras

Sistema web para **controle financeiro de obras e construção**. Tudo fica em uma única página HTML, que também pode ser **instalada como app** no celular ou no computador (PWA). Login por e-mail/senha via Supabase Auth; os dados ficam sincronizados na nuvem (Supabase Postgres) e em cache local, então o app também funciona sem internet.

## Funcionalidades

- **Várias obras** — cliente, endereço, responsável técnico, prazo, valor do contrato, área (m²) e status.
- **Orçamento por etapa** — etapas padrão (serviços preliminares, fundação, estrutura, alvenaria…) ou personalizadas, com valor orçado, período previsto e **avanço físico (%)**.
- **Lançamentos** — saídas (material, mão de obra, equipamentos, terceirizados…) e entradas (medições/parcelas do cliente), com quantidade × valor unitário, fornecedor, NF/recibo, forma de pagamento, situação pago/pendente e vencimento. Busca e filtros por etapa, categoria, situação e mês; "Salvar e novo" para lançar uma nota item a item.
- **Painel** — orçamento, custo realizado, saldo, **custo projetado ao final** (orçado de cada etapa, ou o já gasto quando passou do orçado), caixa da obra, margem prevista, físico × financeiro e alertas automáticos (contas vencidas ou a vencer, etapa estourada, gasto adiantado em relação à obra, prazo vencido, margem negativa).
- **Saldo disponível** — lance o dinheiro que a obra tem (saldo inicial, aporte, parcela do cliente) como **Entrada**; o app mostra o saldo disponível (entradas recebidas − pagamentos) e o saldo previsto (+ a receber − a pagar).
- **Contas a pagar/receber** — de uma obra ou de todas, com baixa de pagamento em um clique.
- **Relatórios** — curva S (planejado × realizado), fluxo de caixa mensal, orçado × realizado por etapa, gastos por categoria, maiores fornecedores; impressão/PDF, exportação CSV (abre no Excel) e backup JSON.

### Precisão e sincronização

- Todos os valores são guardados em **centavos inteiros** — sem erro de arredondamento nas somas.
- Cada registro tem um carimbo de data de alteração, e exclusões deixam um registro de "apagado". Assim, dois aparelhos (ex.: escritório e canteiro) podem lançar ao mesmo tempo — ou offline — e os dados são **mesclados** sem que um sobrescreva o outro.
- O app atualiza sozinho ao voltar para a tela e a cada 45 s; o indicador no topo mostra se está sincronizado, salvando ou offline.

## Estrutura

- `index.html` — aplicação inteira (HTML + CSS + JS), sem build; Chart.js e supabase-js via CDN (versão fixa + hash SRI).
- `manifest.webmanifest`, `sw.js`, `icon*.{svg,png}` — instalação como app e funcionamento offline.
- `supabase/schema.sql` — tabela `obras_data` e políticas de RLS.

## Como usar localmente

```bash
npx serve .
```

Abra o endereço mostrado. (Abrir o `index.html` direto do disco também funciona, mas sem instalação como app/offline.)

## Configuração do Supabase (uma vez)

1. No painel do Supabase do projeto, abra **SQL Editor** e rode `supabase/schema.sql`.
2. `SUPABASE_URL` e `SUPABASE_KEY` (chave pública/anon — protegida pelas regras de RLS) estão no início do `<script>` em `index.html`. Para usar outro projeto Supabase, troque-os ali. **Nunca** coloque a chave `service_role`/secreta nesse arquivo.
3. Em **Authentication → URL Configuration**, adicione o domínio do site em *Redirect URLs* para o link de "Esqueci minha senha" funcionar.

## Instalar como app

- **Android / Chrome / Edge:** menu → "Instalar app" ou "Adicionar à tela inicial".
- **iPhone / iPad (Safari):** Compartilhar → "Adicionar à Tela de Início".

## Deploy (Netlify)

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → **GitHub** → repositório `rafael-molinari2025/obras`, branch `main`.
2. Build command: *(vazio)* · Publish directory: `.`
3. Em **Project configuration → Web security → Visitor access**, deixe como **Public** (o padrão "Private" retorna `401` para todos).
4. Domínio próprio (opcional): em **Domain management** adicione, por exemplo, `obras.primetitec.com.br` e crie no registro.br um registro **CNAME** `obras` apontando para `<nome-do-site>.netlify.app.`
