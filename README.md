# BEEW / Aialgo

AI-assisted algorithmic trading dashboard built with Next.js, React, and PostgreSQL-backed authentication and application data.

## Stack

- Next.js App Router
- React 19
- TypeScript
- PostgreSQL for users, sessions, and application data via `DATABASE_URL`
- Zustand for client state

## Environment

Create `.env.local` with:

```env
DATABASE_URL=postgres://user:password@host:5432/database
POSTGRES_SSL=true
POSTGRES_POOL_MAX=10
AUTH_SESSION_DAYS=30
DEFAULT_INITIAL_BALANCE=10000

OPENAI_API_KEY=optional-openai-key
GEMINI_API_KEY=optional-gemini-key

MT4_TERMINAL_EXE=C:\Program Files (x86)\Your Broker MT4 Terminal\terminal.exe
MT4_DATA_PATH=C:\Users\you\AppData\Roaming\MetaQuotes\Terminal\your-terminal-id

NEXT_PUBLIC_ENABLE_DEMO_DATA=false
```

## PostgreSQL Setup

Run the schema against your PostgreSQL database:

```bash
psql "$DATABASE_URL" -f src/lib/postgres/schema.sql
```

The schema creates `app_users`, `user_sessions`, `strategies`, `watchlists`, `trades`, `exchange_connections`, `market_reports`, and `backtests`.

## Login

Use `/register` to create a PostgreSQL-backed account, then sign in at `/login`. Sessions are stored in `user_sessions` and mirrored to the browser with an HTTP-only `beew_session` cookie.

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm test
npm run build
```
