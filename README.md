# SpartanFit

A full-stack fitness and coaching application for tracking workouts, progress, gym membership, and coach communication.

## Overview

SpartanFit brings workout logging, body metrics, educational content, gym administration, and chat into a single web application. It is built as a Next.js App Router monolith: server-rendered pages and Server Actions call application services, Prisma persists domain data in PostgreSQL, and Supabase manages user authentication. Gemini-backed chat is optional and has a local fallback.

## Key Features

- User profiles with fitness goals and body metrics
- Workout logs linked to exercises, sets, repetitions, and load
- Progress dashboards with charts
- City, gym location, and user-to-gym administration
- Categorized educational content
- Role-aware coaching chat with optional Gemini integration
- Supabase authentication and protected server-rendered views

## Architecture

```mermaid
flowchart LR
    Browser --> Pages[Next.js App Router]
    Pages --> Actions[Server Actions]
    Actions --> Services[Application services]
    Services --> Prisma[Prisma client]
    Prisma --> DB[(PostgreSQL)]
    Pages --> Auth[Supabase Auth]
    Services --> Gemini[Gemini API, optional]
```

The application uses server-side rendering by default. Server Actions coordinate mutations, services contain business logic, and Prisma provides the database access layer. Authentication is handled through Supabase's SSR integration.

## Tech Stack

- **Application:** Next.js 16, React 19, TypeScript
- **Database:** PostgreSQL, Prisma 7, `pg` driver
- **Authentication:** Supabase Auth, `@supabase/ssr`
- **UI and charts:** Tailwind CSS 4, Recharts, Lucide
- **AI integration:** Gemini API (optional)
- **Quality tooling:** ESLint, TypeScript

## Project Structure

```text
app/          App Router pages and route handlers
actions/      Server Actions
components/   Shared and feature UI
lib/services/ Business and integration logic
prisma/       Prisma schema
utils/        Shared utilities and Supabase clients
specs/        Product and implementation specifications
```

## Demo

A public live demo and project screenshots are not currently verified. You can run the application locally after configuring a PostgreSQL database and Supabase project.

## Getting Started

### Prerequisites

- Node.js 20.9 or later
- A PostgreSQL database
- A Supabase project for authentication

### Installation

```bash
git clone https://github.com/EndDark16/spartanfit-mvp.git
cd spartanfit-mvp
npm install
```

Create `.env.local` in the repository root and provide the values for your own services:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
# Optional: enables Gemini-backed chat responses
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Generate the Prisma client, apply the checked-in migrations, and start the development server:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Open `http://localhost:3000`. Do not commit `.env.local` or real credentials.
The repository does not currently include a checked-in Prisma migration history; `db push` synchronizes the schema for local development and is not a production migration workflow.

## Testing and Quality

The repository does not currently define an automated test script. Available checks are:

```bash
npm run lint
npm run build
```

## Engineering Decisions

- **Server-first Next.js:** server rendering and Server Actions keep data access and mutations on the server unless client-side interaction is needed.
- **Prisma with PostgreSQL:** relational models express users, workouts, metrics, exercises, and gym assignments with explicit constraints. A versioned production migration workflow remains future work.
- **Optional AI integration:** chat can use Gemini when configured and retains a local response path when it is unavailable.

## Future Improvements

- Publish a verified demo and add screenshots of the main workflows.
- Add automated tests for authentication, workout recording, and role-based access.
- Document a reproducible seed-data workflow for local evaluation.
