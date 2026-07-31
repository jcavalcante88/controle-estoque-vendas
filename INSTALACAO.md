# Chaveiro Pro — versão SaaS (com login, trial de 15 dias e cobrança no cartão)

Este projeto adiciona ao seu sistema demo:
- Cadastro/login com **Google** e **GitHub**
- Cada cliente só vê os próprios dados (multi-cliente)
- **15 dias de teste grátis**, depois cobrança mensal automática no cartão via **Stripe**

Tudo abaixo usa apenas planos **gratuitos** das ferramentas. A única coisa que tem custo real é a
**taxa do Stripe por transação** quando um cliente de verdade pagar (isso é inevitável em qualquer
sistema de pagamento do mundo — Stripe não cobra mensalidade nem taxa de configuração).

---

## 1. Banco de dados — Supabase (grátis)

1. Crie conta em https://supabase.com
2. **New Project** → escolha uma senha forte para o banco → aguarde a criação (~2 min)
3. Vá em **Project Settings → Database → Connection string** → copie a URI no formato "URI" (modo "Session pooler" funciona melhor com Next.js/Vercel)
4. Cole esse valor em `DATABASE_URL` no seu `.env`

---

## 2. Login com Google (grátis)

1. Acesse https://console.cloud.google.com
2. Crie um projeto novo (qualquer nome)
3. Menu lateral → **APIs e serviços → Tela de consentimento OAuth** → escolha "Externo" → preencha nome do app e e-mail
4. **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**
5. Tipo de aplicativo: **Aplicativo da Web**
6. Em "URIs de redirecionamento autorizados", adicione:
   - `http://localhost:3000/api/auth/callback/google` (para testar local)
   - `https://SEUDOMINIO.vercel.app/api/auth/callback/google` (produção)
7. Copie o **Client ID** e **Client Secret** para `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`

---

## 3. Login com GitHub (grátis)

1. Acesse https://github.com/settings/developers
2. **New OAuth App**
3. Homepage URL: a URL do seu site
4. Authorization callback URL:
   - `http://localhost:3000/api/auth/callback/github` (local)
   - depois adicione outra OAuth App separada para produção com `https://SEUDOMINIO.vercel.app/api/auth/callback/github`
5. Copie o **Client ID** e gere um **Client Secret** → cole em `GITHUB_ID` e `GITHUB_SECRET`

---

## 4. Stripe — cobrança com 15 dias de teste (grátis para configurar)

1. Crie conta em https://dashboard.stripe.com/register
2. Fique no **modo de teste** primeiro (chave começando com `sk_test_`) — só ative o modo real depois de testar tudo
3. **Product catalog → Add product**:
   - Nome: "Chaveiro Pro — Plano Mensal"
   - Preço: defina o valor mensal → tipo "Recurring" (recorrente) → mensal
   - Copie o **Price ID** (começa com `price_...`) → cole em `STRIPE_PRICE_ID`
4. **Developers → API keys** → copie a "Secret key" → cole em `STRIPE_SECRET_KEY`
5. **Developers → Webhooks → Add endpoint**:
   - URL: `https://SEUDOMINIO.vercel.app/api/stripe/webhook`
   - Eventos para escutar: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copie o **Signing secret** → cole em `STRIPE_WEBHOOK_SECRET`

### Testando sem usar cartão de verdade
No modo de teste do Stripe, use o cartão fictício:
```
Número: 4242 4242 4242 4242
Validade: qualquer data futura
CVC: qualquer 3 números
```
Isso simula um pagamento real sem cobrar nada de ninguém.

---

## 5. Rodando o projeto localmente

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

Acesse `http://localhost:3000`.

---

## 6. Deploy na Vercel (grátis)

1. Suba este projeto para um repositório no GitHub (igual você já fez com o demo)
2. Em vercel.com → **Add New → Project** → importe o repositório
3. Em **Environment Variables**, adicione TODAS as variáveis do seu `.env` (com os valores de produção — lembre de trocar as URLs de `localhost` para o domínio real depois do primeiro deploy)
4. Deploy
5. Depois do primeiro deploy, copie a URL gerada (ex: `chaveiro-pro.vercel.app`) e:
   - Atualize `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` nas variáveis de ambiente da Vercel
   - Volte no Google e GitHub e adicione essa URL nos redirecionamentos OAuth (passos 2 e 3 acima)
   - Atualize a URL do webhook no Stripe (passo 4)

---

## 7. Quando for cobrar de verdade

Troque as chaves do Stripe do modo teste (`sk_test_...`) para o modo real (`sk_live_...`) nas variáveis
de ambiente da Vercel, e refaça o cadastro do produto/preço no modo real (o Stripe mantém os dois
ambientes completamente separados).

---

## O que ainda falta construir (próxima etapa)

Esse pacote entrega a fundação (login, banco multi-cliente, cobrança com trial). As telas visuais
(Produtos, Estoque, Vendas, Relatórios) do seu demo precisam ser portadas para componentes React que
chamam essas rotas de API (`/api/products`, etc.) em vez de usar dados em memória. Posso te ajudar a
fazer essa portagem tela por tela — é só pedir.
