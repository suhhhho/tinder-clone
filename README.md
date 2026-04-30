# Tinder Clone (Student MVP)

Full-stack dating app built with Next.js App Router, Prisma, PostgreSQL, and NextAuth.

## Features

- Email/password registration and login
- JWT-based authenticated sessions with protected routes
- Multi-step onboarding and profile editing
- Photo uploads and ordered profile gallery
- Swipe deck with LIKE/NOPE actions
- Mutual matching based on reciprocal likes
- Persistent chat per match
- Optional demo auto-replies via environment flag
- Four-language UI support (EN, UA, RU, DE)
- Marketing landing page and static info pages

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth (credentials provider)
- Tailwind CSS v4

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env` and update values if needed.

Required variables:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `AUTO_REPLY` (optional demo mode)

### 3) Start PostgreSQL with Docker

```bash
docker-compose up -d
```

### 4) Run migrations

```bash
npx prisma migrate dev
```

### 5) Seed demo data

```bash
npm run seed
```

### 6) Run app

```bash
npm run dev
```

Open http://localhost:3000

## Demo Accounts

After running seed, demo users are available with the same password:

- Password for all seeded users: DemoPass123!
- Account 1: emma.johnson@example.com
- Account 2: liam.smith@example.com

You can also register your own account from the UI.

## Screenshots

Add screenshots here before submission:

- Landing page: docs/screenshots/landing.png
- Swipe deck: docs/screenshots/swipe.png
- Chat view: docs/screenshots/chat.png

## Demo Notes

- If `AUTO_REPLY=true`, matched users generate instant auto-responses in chat for demo purposes.
- Swipe reset is available from the swipe UI.
- Uploaded media is written to `public/uploads/` and ignored by git.

## Project Structure (high-level)

- `src/app`: pages and API routes
- `src/components`: shared UI components
- `src/lib`: auth, Prisma client, i18n helpers
- `prisma`: schema, migrations, seeds

## Known Limitations

- Chat currently uses polling, not WebSockets/SSE.
- Some UX states are demo-oriented (for example, optional auto-replies).

## Future Work

- Replace polling chat with realtime transport (SSE or WebSockets).
- Add per-user rate limiting for swipe and message endpoints.
- Add report and block flows with moderation actions.

## Useful Commands

- `npm run dev`: run dev server
- `npm run build`: production build
- `npm run lint`: lint check
- `npm run seed`: seed database
