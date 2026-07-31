# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
# Development
npm run dev                          # Start dev server (http://localhost:3000)

# Database
npx prisma migrate dev --name init   # Create and apply migrations
npx prisma studio                    # Open Prisma GUI (localhost:5555)
npx prisma generate                  # Regenerate Prisma client after schema changes

# Production
npm run build                        # Build for production
npm start                            # Run production build locally

# Reset local environment
rm -rf node_modules .prisma .next    # Complete clean
npm install                          # Reinstalls and runs prisma generate via postinstall
```

---

## Architecture Overview

**Controle Estoque & Vendas** is a Next.js 15 SaaS for inventory & sales management, aimed at **any kind of retail business** (not a single niche). It started as a fork of the Chaveiro Pro codebase, so parts of the UI/copy may still use locksmith wording — generalize them as you touch each file. Key architectural decisions:

### Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Auth**: NextAuth v5 with JWT sessions (30-day maxAge)
- **Database**: PostgreSQL (Supabase recommended, free tier)
- **ORM**: Prisma (with auto-migrations during dev)
- **Payment**: Stripe (trial model: 15 days free, then monthly subscription)
- **Email**: Nodemailer + Brevo SMTP (free: 300 emails/day)
- **UI**: Tailwind CSS + Lucide icons
- **Type Safety**: TypeScript strict mode

### Core Flows

**1. Authentication (Multi-Provider)**
- Location: `lib/auth.ts` + `app/api/auth/[...nextauth]/route.ts`
- Providers: Google OAuth, GitHub OAuth, Credentials (email/password)
- Google/GitHub users created without password; email/password users created via `/api/register` with bcryptjs hash (12 rounds)
- **Key Issue**: Users created via Google/GitHub cannot login via email/password. They must use OAuth.
- Session check pattern: Use `await auth()` in Server Components to redirect unauthenticated users

**2. Password Recovery**
- Flow: User requests reset → email with 1-hour token link → `/reset-password?token=...` → new password
- Endpoints: `POST /api/forgot-password` (generates token) + `POST /api/reset-password` (validates & updates)
- Schema fields: `resetToken` (unique), `resetTokenExpires` (DateTime)
- Email: `lib/email.ts` sends HTML template via Brevo SMTP
- **CRITICAL**: `SMTP_FROM` must be a verified sender in Brevo or emails are silently dropped

**3. Subscription & Trial**
- Location: `app/api/stripe/webhook/route.ts` + `lib/auth.ts` (signIn event handler)
- On signup: 15-day trial auto-created, status = "trialing"
- On trial end or manual upgrade: Stripe webhook updates subscription status
- User multi-tenancy enforced via `userId` foreign key on all business entities (Product, Sale, StockMovement)

**4. Page Routing Pattern**
- Server wrappers at page entry points (e.g., `app/login/page.tsx`) check session and redirect:
  - Authenticated users accessing `/login` → redirect to `/dashboard`
  - Unauthenticated users accessing `/dashboard/*` → redirect to `/login`
- Client components split out for interactivity (e.g., `app/login/login-form.tsx`)

### Database Schema Isolation
- **User-owned entities**: Product, Sale, Sale Item, StockMovement (all have `userId` FK)
- Queries must always filter by logged-in user's ID to prevent cross-tenant data leaks
- No cascading deletes on user except where explicitly marked (Account, Session, Subscription cascade on user delete)

### Environment Variables Required

**NextAuth & Database**
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random 32+ char string>
DATABASE_URL=postgresql://...
```

**OAuth Providers**
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...
```

**Stripe (test mode first, then live)**
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Email (Brevo SMTP)**
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=b062dc001@smtp-brevo.com
SMTP_PASS=xsmtpsib-...
SMTP_FROM=your-verified-sender@domain.com  # MUST be verified in Brevo!
```

---

## Common Patterns & Gotchas

**Session Check in Server Components**
```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  // Now safe to use session.user.id
}
```

**Prisma After Schema Changes**
If you get "Unknown argument `resetToken`" or similar errors:
```bash
rm -rf node_modules/.prisma
npm install  # This runs postinstall which regenerates Prisma client
```

**API Routes: Always Filter by UserID**
```typescript
const session = await auth();
if (!session?.user?.id) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

// Bad: const products = await prisma.product.findMany();
// Good:
const products = await prisma.product.findMany({
  where: { userId: session.user.id }
});
```

**Email Sender Verification**
- Brevo silently discards emails from unverified senders but returns HTTP 200
- Always test password recovery flow with the verified sender email first
- To add new sender: Brevo Dashboard → Senders → verify domain/email → wait for confirmation

**Stripe Webhook Testing Locally**
Use `stripe listen --forward-to localhost:3000/api/stripe/webhook` to forward test events. Webhook secret is different for local vs. production.

---

## File Structure Reference

```
app/
  ├─ page.tsx                  # Home (now checks session for button routing)
  ├─ login/
  │  ├─ page.tsx               # Server wrapper: redirects logged-in users
  │  └─ login-form.tsx         # Client component: form UI + signIn logic
  ├─ dashboard/                # All pages here protected by server-side auth()
  │  ├─ page.tsx
  │  ├─ produtos/page.tsx
  │  ├─ estoque/page.tsx
  │  ├─ vendas/page.tsx
  │  ├─ relatorios/page.tsx
  │  └─ configuracoes/page.tsx
  ├─ forgot-password/page.tsx   # Request reset token
  ├─ reset-password/page.tsx    # Validate token + set new password
  └─ api/
     ├─ auth/[...nextauth]/route.ts  # NextAuth handler
     ├─ register/route.ts            # POST: email/password signup
     ├─ forgot-password/route.ts      # POST: generate reset token
     ├─ reset-password/route.ts       # POST: validate token + hash new password
     ├─ products/route.ts            # CRUD for products (scoped to user)
     ├─ sales/route.ts               # CRUD for sales
     ├─ stock/route.ts               # Stock movement log
     ├─ reports/route.ts             # Aggregated reports
     ├─ settings/
     │  ├─ update-theme/route.ts
     │  └─ cancel-subscription/route.ts
     └─ stripe/
        ├─ checkout/route.ts         # Create checkout session
        └─ webhook/route.ts          # Stripe event handler (subscription updates)

lib/
  ├─ auth.ts                  # NextAuth config + providers + callbacks
  ├─ email.ts                 # Nodemailer transport + password reset template
  ├─ prisma.ts                # Prisma client singleton
  └─ stripe.ts                # Stripe SDK instance (if present)

prisma/
  └─ schema.prisma            # Database models (User, Account, Session, Product, Sale, Subscription, etc.)

public/                        # Static assets

styles/                        # Global CSS (Tailwind config usually in tailwind.config.js)
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `lib/auth.ts` | NextAuth config: all providers, JWT callback (adds user.id to token), signIn event (creates trial) |
| `prisma/schema.prisma` | Database schema: User model has resetToken + resetTokenExpires for password recovery |
| `app/login/page.tsx` | Server wrapper: checks session, redirects to `/dashboard` if already logged in |
| `app/page.tsx` | Home page: dynamic button routing based on session state |
| `lib/email.ts` | Password reset email template + Brevo SMTP config |
| `app/api/forgot-password/route.ts` | Generates 32-byte crypto token, 1-hour expiration |
| `app/api/reset-password/route.ts` | Validates token expiry, hashes password with bcryptjs, clears reset fields |

---

## Testing Checklist

**After Auth Changes**
- [ ] Unauthenticated user can see home + login pages
- [ ] Login with email/password works
- [ ] Login with Google/GitHub works
- [ ] Already-logged-in user sees `/dashboard` instead of login form when visiting `/login`
- [ ] Password recovery email arrives (check SMTP_FROM is verified in Brevo)
- [ ] Reset link works and expires after 1 hour

**After Database Schema Changes**
- [ ] Run `npx prisma migrate dev --name <description>`
- [ ] Verify Prisma client regenerates (no "Unknown argument" errors)
- [ ] Test affected queries/mutations

**Before Vercel Deploy**
- [ ] All environment variables set in Vercel dashboard (including `SMTP_FROM`)
- [ ] Build passes: `npm run build`
- [ ] Test Stripe webhook URL points to production domain
- [ ] OAuth callback URLs updated in Google/GitHub consoles
