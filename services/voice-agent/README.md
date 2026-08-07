# Meet.AI voice-agent service

A small FastAPI service that joins a Meet.AI meeting's Stream Video call as
a talking Gemini Live agent, using Stream's open-source [Vision
Agents](https://github.com/GetStream/Vision-Agents) framework. This is the
first non-Node service in the repo — Vision Agents is Python-only.

It's entirely optional: the main app degrades gracefully if this isn't
running (the human can still join meetings normally; the agent just won't
speak).

## Setup

Requires Python 3.12+ and [`uv`](https://docs.astral.sh/uv/).

```bash
cd services/voice-agent
uv sync
cp .env.example .env
```

Fill in `.env` with the same Stream and Gemini credentials already in the
root `meeting-ai/.env`:

| This service's `.env`  | Copy the value from root `.env`         |
| ----------------------- | ---------------------------------------- |
| `STREAM_API_KEY`        | `NEXT_PUBLIC_STREAM_VIDEO_API_KEY`       |
| `STREAM_API_SECRET`     | `STREAM_VIDEO_SECRET_KEY`                |
| `GOOGLE_API_KEY`        | `GEMINI_API_KEY`                         |

(Different names because Vision Agents expects its own env var
conventions — see its [quickstart](https://visionagents.ai/introduction/quickstart).)

## Run

```bash
uv run uvicorn main:app --port 8000
```

Keep this running alongside `next dev`, `inngest-cli dev`, and `ngrok` —
it's a fourth local process. The Next.js app calls it at
`AGENT_SERVICE_URL` (defaults to `http://localhost:8000`).

## Endpoints

- `POST /join` — `{ meetingId, agentUserId, name, systemPrompt, personality, greeting, voice, model, temperature }`. Joins the call as the agent, speaks `greeting` if present, then stays connected until `/leave` or a 3-hour safety timeout.
- `POST /leave` — `{ meetingId }`. Cancels the active session for that meeting, if any.
- `GET /health` — liveness check + active session count.

## Known gaps (v1)

- **No native "call ended" detection yet.** The agent currently leaves only
  via an explicit `/leave` call or the safety timeout — it does not yet
  react to the human leaving the call. Wiring this to Vision Agents' actual
  call-lifecycle events (or a Stream `call.session_ended` webhook) is the
  next thing to build here.
- The `gemini.Realtime(voice=..., model=..., temperature=...)` kwargs in
  `main.py` are based on Stream's documented quickstart pattern but should
  be verified against the exact installed `vision-agents` version before
  relying on them in a real call — the constructor's accepted kwargs can
  change between releases.
