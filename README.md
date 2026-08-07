# Meet.AI

An AI meeting platform: schedule meetings, run them through Stream Video with a
configurable AI agent, get automatic transcripts, and let Gemini generate
insights (summary, action items, decisions, risks, quotes, agenda) plus a
RAG-powered chat that answers questions about the meeting with citations.

## Tech stack

- **Next.js 15** (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- **Better Auth** for authentication (email/password, GitHub, Google)
- **Drizzle ORM + Neon Postgres** (with `pgvector` for embeddings)
- **tRPC** for the typed API layer
- **Stream Video** for calls, recordings, and transcription
- **Inngest** for the background job that turns a raw transcript into AI insights
- **Google Gemini** for insight generation, embeddings, and RAG chat

## Prerequisites

- Node.js 18+
- A Neon Postgres database (with the `pgvector` extension available)
- Accounts/API keys for: Better Auth (GitHub/Google OAuth apps), Stream
  (video), Google AI Studio (Gemini), and Inngest

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Create a `.env` file in the project root with:

```bash
# Database
DATABASE_URL=postgres://...

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Stream Video
NEXT_PUBLIC_STREAM_VIDEO_API_KEY=...
STREAM_VIDEO_SECRET_KEY=...
STREAM_WEBHOOK_SECRET=...

# Gemini
GOOGLE_GENERATIVE_AI_API_KEY=...

# Inngest (dev server picks these up automatically; set for prod)
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
```

If you're testing on a device other than `localhost` (e.g. via ngrok), add
that origin to `trustedOrigins` in [`src/lib/auth.ts`](src/lib/auth.ts) —
Better Auth rejects sign-in/sign-up requests from origins not in that list.

## 3. Set up the database

```bash
npm run db:push      # push the current Drizzle schema to your database
npm run db:studio    # optional: browse the DB in Drizzle Studio
```

The schema includes the `meetings`, `agents`, `meetingTranscripts`,
`meetingInsights`, `meetingTranscriptChunks` (pgvector), and
`meetingChatMessages` tables — see [`src/db/schema.ts`](src/db/schema.ts).

## 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. Run the Inngest dev server (required for AI insights)

Insight generation runs as a background job. In a separate terminal:

```bash
npx inngest-cli dev -u http://localhost:3000/api/inngest
```

Keep this running while you test — without it, transcripts will sit in
`idle`/`processing` status and insights will never be generated. The Inngest
dashboard is at [http://localhost:8288](http://localhost:8288).

## 6. Expose your app for Stream webhooks (local dev only)

Stream needs a public URL to notify your app when a call's transcript is
ready. Use ngrok (or similar):

```bash
ngrok http 3000
```

Then register the webhook against your Stream app so `call.transcription_ready`
events hit `https://<your-ngrok-domain>/api/webhooks/stream`, and add the
ngrok origin to `trustedOrigins` in `src/lib/auth.ts` (see step 2). Note that
free ngrok URLs change every time the tunnel restarts, so both of these need
to be updated again after a restart.

## Using the app

1. **Sign up / sign in** — email/password, GitHub, or Google.
2. **Create an agent** (optional) — under Agents, define a name, instructions,
   and visibility (private or public). Agents can be attached to meetings.
3. **Schedule a meeting** — pick a title, date/time, duration, and optionally
   an agent.
4. **Join the call** — from the meeting page, click "Join Call". Stream Video
   handles the call UI; transcription is turned on automatically.
5. **End the call** — once the meeting ends, Stream finalizes the recording
   and transcript, then fires a webhook that queues an Inngest job.
6. **View insights** — on the meeting page, the "Insights" tab shows a
   summary, action items, key decisions, risks, deadlines, speaker
   breakdowns, and notable quotes once the background job finishes
   (usually well under a minute after the transcript is ready).
7. **Chat about the meeting** — use the chat panel to ask questions like
   "What were the action items?" or "What did we decide about pricing?".
   Answers are generated via RAG over the transcript and include citations
   back to the relevant transcript excerpts.

## Useful scripts

| Command              | Description                                  |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Start the Next.js dev server                  |
| `npm run build`       | Production build                              |
| `npm run start`       | Start the production server                   |
| `npm run lint`        | Run ESLint                                    |
| `npm run db:generate` | Generate a Drizzle migration from schema diff |
| `npm run db:migrate`  | Apply pending migrations                      |
| `npm run db:push`     | Push schema directly to the database          |
| `npm run db:studio`   | Open Drizzle Studio                           |

## Known limitations

- AI agents currently do not speak or join calls with a live voice — that
  requires a real-time Gemini Live audio integration, which is not yet built.
  Agents only provide instructions/context used elsewhere (e.g. framing for
  future automated participation).
