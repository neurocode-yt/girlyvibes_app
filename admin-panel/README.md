# Girly Vibes Admin Panel

Private Next.js admin panel for the Girly Vibes mobile app.

## Install

```bash
cd admin-panel
npm install
```

## Local Development

Create a local `.env.local` file from `.env.example`:

```bash
cp .env.example .env.local
```

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key-never-use-in-client
ADMIN_PASSWORD=choose-a-strong-admin-password
```

`NEXT_PUBLIC_SUPABASE_URL` must be the project origin only. Do not use a REST/Auth/Storage endpoint such as `/rest/v1`, `/auth/v1`, or `/storage/v1`.

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Vercel Deployment

- Import the GitHub repository in Vercel.
- Set **Root Directory** to `admin-panel`.
- Framework preset: **Next.js**.
- Build command: `npm run build`.
- Install command: `npm install`.
- Output directory: leave default.
- Add the environment variables listed above in Vercel Project Settings.

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` with a `NEXT_PUBLIC_` prefix.
- The service role key is only used by server-only code in `lib/supabaseAdmin.ts`.
- The login state is stored in an httpOnly cookie named `gv_admin`.
- This panel does not show private diary note text by default.
- Actual notification sending should be implemented later in a secure server route or Supabase Edge Function with server-only Firebase credentials.
