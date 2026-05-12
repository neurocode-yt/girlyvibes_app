# GirlyVibes App 🌸

GirlyVibes is a self-care and lifestyle companion app designed to empower users through daily routines, personalized glow-up plans, advice, boredom/detox activities, camera/filter flows, and streak-based profile progression.

This repository is a full-stack monorepo containing both the React Native (Expo) mobile frontend and an Express.js backend, heavily integrated with AI features and shared tooling.

---

## 🌟 Features

### 📱 Frontend (Mobile App)
- **Daily Routines & Streaks**: Track daily self-care routines with a streak system to build consistent habits.
- **Glow-Up Plans**: Tailored lifestyle and self-improvement plans.
- **Advice Hub**: Curated articles and advice with category selection and favorites.
- **Camera & Photo Logging**: Integrated camera and media picker for taking and saving photos, optionally uploading them securely.
- **Boredom/Detox Activities**: Engaging tasks to help disconnect from social media and relax.
- **Modern UI**: Smooth file-based routing via Expo Router, vibrant aesthetics, and fluid tab navigation.

### ⚙️ Backend (API Server)
- **AI Chat (Coming Soon)**: Server-Sent Events (SSE) based real-time chat integrated with Google's Gemini AI.
- **Telemetry & Logging**: Endpoints for tracking app-open analytics and handling secure photo logs.
- **Email Notifications**: Integrated with Resend to forward specific logs and media safely.
- **Scalable Architecture**: Express.js server, structured logging with Pino, and prepared for persistent storage with Drizzle ORM and PostgreSQL.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native 0.81.5 + Expo SDK 54
- **Routing**: Expo Router (file-based routing)
- **State & Data Fetching**: React Context API, React Query
- **Storage**: AsyncStorage (`@react-native-async-storage/async-storage`)

### Backend
- **Framework**: Node.js with Express 5
- **AI Integration**: Google Gemini AI (`@workspace/integrations-gemini-ai`)
- **Email Delivery**: Resend API
- **Database (Prepared)**: Drizzle ORM + PostgreSQL (`lib/db`)
- **Validation**: Zod
- **Logging**: Pino & Pino-HTTP

### Shared & Tooling
- **Workspace Manager**: `pnpm` workspaces
- **API Contracts**: OpenAPI (`openapi.yaml`) + Orval codegen for generated React client hooks and Zod schemas.
- **Language**: TypeScript across the entire stack.

---

## 📂 Project Structure

```text
├── artifacts/
│   ├── girlyvibes/            # Expo React Native App (Frontend)
│   │   ├── app/               # Expo Router pages/tabs
│   │   ├── components/        # Reusable UI components
│   │   └── contexts/          # App state and contexts
│   ├── api-server/            # Express API service (Backend)
│   │   ├── src/routes/        # API endpoints (/chat, /log, /healthz)
│   │   └── ...
├── lib/                       # Shared internal libraries
│   ├── api-spec/              # OpenAPI source + Orval codegen config
│   ├── api-client-react/      # Generated typed client/hooks
│   ├── api-zod/               # Generated Zod schemas/types
│   ├── db/                    # Drizzle + Postgres setup
│   └── integrations-gemini-ai/# Centralized Gemini AI client
├── scripts/                   # Workspace utility scripts
├── pnpm-workspace.yaml        # PNPM workspace configuration
└── package.json               # Root package manager config
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- `pnpm` (Corepack enabled: `corepack enable pnpm`)
- Expo Go app on your physical device (or an emulator setup)

### 1. Install Dependencies
Navigate to the root directory and run:
```bash
corepack pnpm install --ignore-scripts
```

### 2. Start the API Server (Backend)
Navigate to the backend directory:
```bash
cd artifacts/api-server
```
Make sure you have set the required environment variables (see below). Then build and start the server:
```bash
# On Windows (PowerShell)
$env:NODE_ENV='development'
corepack pnpm run build
corepack pnpm run start

# On Mac/Linux
NODE_ENV=development corepack pnpm run build && corepack pnpm run start
```

### 3. Start the Mobile App (Frontend)
Open a new terminal window, navigate to the frontend directory:
```bash
cd artifacts/girlyvibes
```
Start the Expo development server:
```bash
corepack pnpm exec expo start --lan --clear
```
_Note: Scan the generated QR code using the Expo Go app on your phone (ensure you are on the same Wi-Fi network)._

---

## 🔐 Environment Variables

You need to configure environment variables for the backend and frontend to communicate successfully. Create a `.env` file where required.

### API Server (`artifacts/api-server/.env`)
- `PORT` - Port for the server (e.g., 3000)
- `AI_INTEGRATIONS_GEMINI_BASE_URL` - Gemini API base URL
- `AI_INTEGRATIONS_GEMINI_API_KEY` - Gemini API Key (Required for chat)
- `RESEND_API_KEY` - Resend API Key (Required for email logs)
- `DATABASE_URL` - PostgreSQL connection string (if using DB features)

### Mobile App (`artifacts/girlyvibes/.env`)
- `EXPO_PUBLIC_DOMAIN` - The base URL of your API Server (e.g., `http://<your-local-ip>:3000`)

---

## 📝 Future Roadmap
- Wire up the Mobile Chat UI to the backend SSE (`/api/chat`) endpoints.
- Fully integrate PostgreSQL via Drizzle ORM for persistent data storage.
- Expand end-to-end tests and CI/CD pipelines.
