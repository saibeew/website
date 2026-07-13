# BEEW Studio Local Worker

This project now has a local worker for the heavy BEEW Studio jobs that should not run inside the hosted Next.js web app.

## What Runs Locally

- Reel Clipper queued jobs from `studio_jobs`
- Effects Studio queued jobs from `studio_jobs`
- Postgres status/progress updates
- Local output paths saved back into each job `output`

The web app queues jobs. The worker processes them.

## Requirements

Install these on the worker machine:

- Node.js dependencies: `npm install`
- PostgreSQL reachable from `DATABASE_URL`
- FFmpeg in PATH
- Python in PATH
- yt-dlp in PATH for source URL clipping
- Whisper dependency used by the clipper pipeline

Recommended Windows installs:

```bat
winget install --id Gyan.FFmpeg -e
pip install faster-whisper yt-dlp
```

## Local Environment

`.env.local` must include:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/aialgo
POSTGRES_SSL=false
```

Then initialize the database:

```bat
npm.cmd run build
npx ts-node scripts/init-postgres.ts
```

## Run The App

Port 3000 is blocked on this machine, so local dev uses 3100.

```bat
start-dev.cmd
```

Open:

```text
http://127.0.0.1:3100
```

## Run The Worker

Process one queued job:

```bat
npm.cmd run studio:worker:once
```

Run continuously:

```bat
npm.cmd run studio:worker
```

## Test Flow

1. Open Studio in the web app.
2. Queue a Reel Clipper or Effects Studio job.
3. Open the Studio `Jobs` tab.
4. Run `npm.cmd run studio:worker:once`.
5. Refresh the `Jobs` tab and inspect output/error.

## Production Credentials Needed Later

To make BEEW Studio 100% live in production, provide:

- Cloud PostgreSQL `DATABASE_URL`
- AWS access for media storage or an IAM role attached to the worker
- S3 bucket name and region
- Public media base URL or CloudFront distribution URL
- EC2/VPS/worker host credentials or deployment target
- Telegram bot token and chat ID
- TikTok developer app credentials
- Instagram/Facebook Graph API app credentials
- YouTube Data API OAuth credentials
- X API credentials
- OpenAI/Gemini key for stronger script generation if desired

The worker can be moved from local Windows to EC2 once these are available.
