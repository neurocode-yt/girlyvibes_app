# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Girly Vibes App (artifacts/girlyvibes)

Arabic-first bilingual (AR/EN) daily self-improvement Expo/React Native app for teen girls.

### Features
- **Home** — daily reminders, streaks, morning routine progress
- **Routines** — morning/evening routine checklists
- **Glow Up** — self-improvement challenges
- **Advice** — daily articles/tips
- **Chat** — "Coming Soon" placeholder (AI chatbot wired to API server, backend works)
- **Activities** — boredom buster ideas
- **Glow Cam** — camera with 7 photo filters: Normal, Warm, Cool, Rose, Vintage, Dream, Mono

### Architecture
- All icons: inline SVG via `react-native-svg` (no font loading), mapped in `components/Icons.tsx`
- Language: `contexts/LanguageContext.tsx` with `toggleLanguage()` for instant AR↔EN switching, RTL support
- i18n: `constants/i18n.ts` with all translations
- Theme: soft coquette palette (#FFF9F7 bg, #FBE4EC card, #F7C9D9 highlight, #C88AA0 primary, #6B4B5C text)

### AI Chat
- Backend: `artifacts/api-server/src/routes/chat/index.ts` — SSE streaming endpoint at `/api/chat`
- Uses `@workspace/integrations-gemini-ai` (Gemini 2.5 Flash) with bilingual system prompts
- Rate limited: 20 requests/min per IP, max 30 messages per request
- Client: `artifacts/girlyvibes/app/(tabs)/chat.tsx` with buffered SSE parser
- API URL from Expo: `https://${EXPO_PUBLIC_DOMAIN}/api/chat`

### Building the Android APK

To produce an installable `.apk` for Android:

1. Create a free account at https://expo.dev
2. Go to **Account Settings → Access Tokens** and create a new token
3. Add the token as a Replit secret named `EXPO_TOKEN`
4. Run the build from the project root:
   ```
   pnpm --filter @workspace/girlyvibes run build:android
   ```
5. When the build finishes (10–20 min), download the `.apk` from the link printed in the console or from https://expo.dev/accounts/neurocoode/projects/girlyvibes/builds
6. Transfer the `.apk` to your Android phone and install it (enable "Install from unknown sources" in Android settings)

EAS config: `artifacts/girlyvibes/eas.json` — `preview` profile outputs `.apk`, `production` outputs `.aab` for Play Store.
