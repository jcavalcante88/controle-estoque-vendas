# 🔐 Recuperação de Senha - Setup Completo

## ✅ O que foi implementado

- ✅ **Endpoints de API** para solicitar e resetar senha
- ✅ **Páginas UI** modernas e responsivas
- ✅ **Email com template HTML** profissional
- ✅ **Integração com Brevo** (SMTP gratuito: 300 emails/dia)
- ✅ **Tokens seguros** com expiração (1 hora)

---

## 📧 Passo 1: Configurar Email (Brevo - Gratuito)

### 1.1 Criar conta no Brevo

1. Acesse: **https://www.brevo.com/pt/**
2. Clique em **"Inscrever-se gratuitamente"**
3. Preencha:
   - Email
   - Senha
   - Confirmar senha
4. Clique em **"Inscrever-se"**
5. **Confirme seu email** (verifique inbox)

### 1.2 Obter credenciais SMTP

1. Após login, vá para: **Settings (Parâmetros)** → **SMTP & API**
2. Na aba **SMTP**, você verá:
   - **SMTP Host:** `smtp-relay.brevo.com`
   - **SMTP Port:** `587`
   - **SMTP User:** seu email cadastrado
   - **SMTP Password:** clique em "Generate new SMTP key"

### 1.3 Copiar credenciais para `.env`

No arquivo `.env` do seu projeto, preencha:

```env
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="seu_email_do_brevo@gmail.com"
SMTP_PASS="xsmtpb-..."  # Cole a chave gerada
SMTP_FROM="noreply@chaveiro.com"
```

---

## 🚀 Passo 2: Instalar Dependências

A dependência `nodemailer` já deve estar instalada. Se não estiver:

```bash
npm install nodemailer@6 --legacy-peer-deps
```

---

## 🗄️ Passo 3: Rodar Migração do Banco

A migração já foi aplicada automaticamente. Para verificar:

```bash
npx prisma studio
```

E veja se a tabela `User` possui os campos:
- `resetToken`
- `resetTokenExpires`

---

## 🧪 Passo 4: Testar Localmente

### 4.1 Iniciar o servidor

```bash
npm run dev
```

### 4.2 Ir para login

Acesse: **http://localhost:3000/login**

### 4.3 Testar fluxo completo

1. ✅ Clique em **"Esqueceu sua senha?"**
2. ✅ Digite um email válido (de uma conta existente)
3. ✅ Verifique seu email (pode levar 1-2 minutos)
4. ✅ Clique no link recebido
5. ✅ Defina uma nova senha
6. ✅ Faça login com a nova senha

### ⚠️ Problemas comuns:

- **Email não chega?** Verifique a pasta **Spam/Lixo**
- **Link expirou?** Solicite um novo reset (máximo 1 hora)
- **Erro de autenticação SMTP?** Verifique as credenciais no `.env`

---

## 📁 Arquivos Criados/Modificados

### ✅ Novos arquivos

| Arquivo | Descrição |
|---------|-----------|
| `lib/email.ts` | Configuração do Nodemailer + template |
| `app/api/forgot-password/route.ts` | Endpoint para solicitar reset |
| `app/api/reset-password/route.ts` | Endpoint para confirmar novo password |
| `app/forgot-password/page.tsx` | Página de solicitar reset |
| `app/reset-password/page.tsx` | Página de definir nova senha |

### 🔄 Modificados

| Arquivo | Mudança |
|---------|---------|
| `prisma/schema.prisma` | Adicionado `resetToken` e `resetTokenExpires` ao User |
| `app/login/page.tsx` | Adicionado link "Esqueceu sua senha?" |
| `.env` | Adicionadas variáveis SMTP |

---

## 🔒 Segurança

- ✅ Tokens gerados com `crypto.randomBytes(32)`
- ✅ Tokens expiram em 1 hora
- ✅ Senhas hasheadas com bcryptjs
- ✅ Não revelamos se email existe (previne enumeração)
- ✅ SMTP com porta 587 (TLS seguro)

---

## 📊 Limites Brevo (Gratuito)

- **300 emails/dia**
- **Emails únicos/mês: ilimitados**
- **Suporta 50.000 contatos**

Se exceder, considere:
- Mailgun (50.000/mês grátis)
- Sendgrid (100 emails/dia grátis)

---

## 🌐 Deploy (Produção)

Antes de fazer deploy, certifique-se:

1. ✅ `.env` está no `.gitignore` (segredo não vaza)
2. ✅ `NEXTAUTH_URL` está correto (https://seudominio.com)
3. ✅ SMTP credentials estão definidas no servidor
4. ✅ Banco de dados migrado (`prisma migrate deploy`)

---

## 📞 Suporte

Erro? Tente:

```bash
# Verificar schema
npx prisma studio

# Criar novo reset token
npx prisma db push

# Ver logs do email (console do next dev)
npm run dev  # Procure por "Enviando email" ou erros
```

---

**Tudo pronto! 🎉 Recuperação de senha está funcionando.**
