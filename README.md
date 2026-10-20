# Mode

A personal issue tracker built with Next.js, React, and PostgreSQL. Create issues, track their status and priority, and keep your work organised in a clean, responsive interface.

A learning and portfolio project inspired by Linear.

## Features

- Account creation, sign-in, and sign-out.
- A dashboard showing the signed-in user's issues.
- Create, view, edit, and delete issues with a title and optional description.
- Four statuses: Backlog, Todo, In Progress, and Done.
- Three priority levels: Low, Medium, and High.
- Server-side validation and ownership checks for issue reads and writes.
- Light and dark themes based on system preferences.
- Animated loading placeholders that respect reduced-motion settings.

## Built with

- **Next.js 15 canary** with the App Router and Server Actions.
- **React 19** and **TypeScript**.
- **Tailwind CSS** and **Lucide** icons.
- **PostgreSQL**, **Drizzle ORM**, and **Drizzle Kit**.
- **JWT sessions** using `jose`, HTTP-only cookies, and `bcrypt` password hashing.
- **Zod** for validation.
- **Vitest** and **React Testing Library** for automated tests.

## Getting started

### Prerequisites

- Node.js 22.x (22.12 or newer) or 24.x, with npm.
- A running PostgreSQL instance and an empty database for this project.

### 1. Clone and install

```bash
git clone https://github.com/ellenwelsh92/next.js-issue-tracker.git
cd next.js-issue-tracker
npm ci
```

### 2. Configure the environment

Copy the example configuration into a local `.env` file:

```bash
cp .env.example .env
```

Update both values in `.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for your database. |
| `JWT_SECRET` | A private, randomly generated secret used to sign session tokens. |

Generate a secret locally with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value into `JWT_SECRET`. Keep `.env` private; it is excluded from version control. Use `.env` rather than `.env.local` so Next.js and Drizzle Kit read the same configuration.

### 3. Set up the database

Apply the schema to your development database:

```bash
npm run db:push
```

### 4. Start the app

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000), create an account, and add your first issue. If that port is already in use, follow the URL printed by the development server.

## Optional demo data

The seed script creates two demo accounts and five sample issues. **It deletes all existing users and issues in the configured database**, so only run it against a disposable development database.

This command explicitly loads `.env` before running the seed script:

```bash
node --env-file=.env --import tsx scripts/seed.ts
```

| Email | Password |
| --- | --- |
| `admin@example.com` | `password123` |
| `user@example.com` | `password123` |

Both accounts use the same app permissions; the names are demo labels.

## Development commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm start` | Serve an existing production build. |
| `npm run lint` | Run the configured Next.js lint command. |
| `npm test` | Run Vitest in watch mode. |
| `npm test -- --run` | Run the test suite once. |
| `npx tsc --noEmit` | Check TypeScript types. |
| `npm run db:push` | Apply the Drizzle schema to the configured database. |
| `npm run db:studio` | Open Drizzle Studio to inspect the database. |

Tests cover sign-in, issue editing, dashboard rendering, and account isolation for issue reads and writes. Database operations are mocked in the test suite.

## Project structure

```text
app/
  (auth)/           Sign-in and sign-up pages
  (marketing)/      Landing and pricing pages
  actions/          Authentication and issue Server Actions
  api/              Issue API route handlers
  components/       Shared forms, navigation, UI, and loading placeholders
  dashboard/        Issue dashboard
  issues/           Create, view, and edit issue pages
db/                 Drizzle schema and database connection
lib/                Authentication, data access, validation, and utilities
scripts/            Demo database seed script
tests/              Authentication, editing, and ownership tests
```

Dashboard rendering tests also live in `app/dashboard/__test__/`.

## Project status

The core account and issue-management flows are implemented. Marketing and pricing pages are demo content, with unfinished navigation and sales actions disabled. Team management, billing, email verification, and password reset are not implemented.

The app currently uses a Next.js canary release with experimental dynamic I/O enabled.
