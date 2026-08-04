# 📦 Controle de Estoque & Vendas — SaaS

Sistema **SaaS multi-cliente** de gestão de estoque e vendas para **qualquer tipo de comércio** — lojas, distribuidoras, oficinas, papelarias, autopeças e afins. Controle de produtos com margem, vendas com baixa automática de estoque, relatórios, login seguro e cobrança recorrente por assinatura.

🔗 **No ar:** https://controle-estoque-vendas.vercel.app

> Nasceu a partir do código do [Chaveiro Pro](https://github.com/jcavalcante88/chaveiro-saas) e foi generalizado para atender qualquer segmento de varejo, com marca, identidade visual e infraestrutura próprias.

---

## ✨ Funcionalidades (herdadas e funcionais)

- 🔑 Autenticação com e-mail/senha e login social (Google e GitHub)
- 🏢 Multi-cliente: cada usuário enxerga somente os próprios dados
- 📦 Produtos: cadastro com custo, preço de venda e cálculo de margem
- 🛒 Vendas: carrinho com baixa automática de estoque
- 📊 Movimentação de estoque: entradas, saídas e ajustes com histórico
- 📈 Relatórios de vendas e produtos
- 💳 Assinatura com Stripe (período de teste + cobrança mensal)
- 🔒 Recuperação de senha por e-mail e rate limiting

## 🛠️ Tecnologias

| Camada | Tecnologias |
|--------|-------------|
| Front-end | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Back-end | Next.js API Routes, Prisma ORM |
| Banco de dados | PostgreSQL |
| Autenticação | NextAuth / Auth.js |
| Pagamentos | Stripe |
| E-mail | Nodemailer + Brevo SMTP |

## 🚀 Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Criar o arquivo .env com as chaves próprias deste projeto
#    (banco, OAuth, Stripe e SMTP — veja INSTALACAO.md)

# 3. Preparar o banco de dados
npx prisma generate
npx prisma db push

# 4. Rodar
npm run dev     # http://localhost:3000
```

> ⚠️ **Importante:** este projeto usa **banco de dados e chaves próprios** — veja `.env.example`. A única infraestrutura compartilhada com o Chaveiro Pro é o Redis do Upstash (limite do plano gratuito), e mesmo assim as chaves ficam isoladas pelo prefixo `estoque:` definido em `lib/ratelimit.ts`.

## 📋 Estado da adaptação

- [x] Marca, identidade visual e textos próprios
- [x] Banco de dados próprio (Neon) e `.env` configurado
- [x] Produto/preço próprios no Stripe (modo teste)
- [x] Deploy em produção com OAuth, webhook e rate limiting ativos
- [ ] Migrar o Stripe para modo real (live) quando for cobrar de verdade

---

## 👤 Autor

**Jerry Cavalcante Camargo Das Dores** — Desenvolvedor Full-Stack

- 🐙 GitHub: [@jcavalcante88](https://github.com/jcavalcante88)
- 💼 LinkedIn: [jerry-camargo](https://www.linkedin.com/in/jerry-camargo)
- 🌐 Portfólio: [portf-lio-xi-ruddy.vercel.app](https://portf-lio-xi-ruddy.vercel.app)
