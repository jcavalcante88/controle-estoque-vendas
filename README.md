# 📦 Controle de Estoque & Vendas — SaaS

Sistema **SaaS multi-cliente** de gestão de estoque e vendas para **qualquer tipo de comércio** — lojas, distribuidoras, oficinas, papelarias, autopeças e afins. Controle de produtos com margem, vendas com baixa automática de estoque, relatórios, login seguro e cobrança recorrente por assinatura.

> 🚧 **Projeto em adaptação.** Nasceu a partir do código do [Chaveiro Pro](https://github.com/jcavalcante88/chaveiro-saas) e está sendo generalizado para atender qualquer segmento de varejo.

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

> ⚠️ **Importante:** este projeto precisa do **próprio banco de dados e das próprias chaves**. Não reutilize as do Chaveiro Pro — senão os dados dos dois sistemas se misturam.

## 📋 Roteiro de adaptação (o que falta generalizar)

- [ ] Trocar textos e marca de "Chaveiro Pro" para o nome deste sistema
- [ ] Revisar categorias de produtos (hoje voltadas a fechaduras/chaves)
- [ ] Ajustar a página inicial (copy de vendas para público geral)
- [ ] Criar banco de dados novo e configurar o `.env`
- [ ] Configurar produto/preço próprios no Stripe

---

## 👤 Autor

**Jerry Cavalcante Camargo Das Dores** — Desenvolvedor Full-Stack

- 🐙 GitHub: [@jcavalcante88](https://github.com/jcavalcante88)
- 💼 LinkedIn: [jerry-camargo](https://www.linkedin.com/in/jerry-camargo)
- 🌐 Portfólio: [portf-lio-xi-ruddy.vercel.app](https://portf-lio-xi-ruddy.vercel.app)
