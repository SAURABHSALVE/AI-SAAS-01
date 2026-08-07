"""FastAPI service that joins Meet.AI's Stream Video calls as a talking
Gemini Live agent, using Stream's open-source Vision Agents framework.

Triggered by the Next.js app's `meetings.triggerAgentJoin` tRPC mutation
whenever a human clicks "Join meeting" on a meeting that has an agent
attached. Optional infrastructure — the app degrades gracefully if this
service isn't running.
"""

import asyncio
import os
from contextlib import suppress

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from vision_agents.core import Agent, User
from vision_agents.plugins import gemini, getstream

load_dotenv()

app = FastAPI(title="meet-ai-voice-agent")

# meetingId -> running session task. Prevents double-joins for the same
# meeting and lets /leave cancel a specific session.
_active_sessions: dict[str, asyncio.Task] = {}

CALL_TYPE = "default"
# Hard cap so a session can't run forever if call-end detection misses an
# event. See the README for why this exists instead of a native "call
# ended" hook.
SAFETY_TIMEOUT_SECONDS = 3 * 60 * 60


class JoinRequest(BaseModel):
    meetingId: str
    agentUserId: str
    name: str
    systemPrompt: str
    personality: str | None = None
    greeting: str | None = None
    voice: str = "Puck"
    model: str = "gemini-2.5-flash"
    temperature: float = 0.7


class LeaveRequest(BaseModel):
    meetingId: str


def _build_instructions(system_prompt: str, personality: str | None) -> str:
    if not personality:
        return system_prompt
    return f"{system_prompt}\n\nPersonality: {personality}"


async def _run_agent_session(payload: JoinRequest) -> None:
    agent = Agent(
        edge=getstream.Edge(),
        agent_user=User(name=payload.name, id=payload.agentUserId),
        instructions=_build_instructions(payload.systemPrompt, payload.personality),
        # `gemini.Realtime` only takes model/config/http_options/client/api_key
        # directly — voice and temperature live inside the LiveConnectConfigDict
        # `config`, mirroring the raw google-genai Live API shape. `payload.model`
        # ("gemini-2.5-flash"/"-pro") is the agent's *text* model for
        # insights/chat and is NOT Live-capable, so it's intentionally not
        # passed here — this lets vision-agents use its own Live-capable
        # default model instead.
        llm=gemini.Realtime(
            config={
                "temperature": payload.temperature,
                "speech_config": {
                    "voice_config": {
                        "prebuilt_voice_config": {"voice_name": payload.voice}
                    }
                },
            },
        ),
    )

    call = await agent.create_call(CALL_TYPE, payload.meetingId)

    async with agent.join(call):
        if payload.greeting:
            await agent.simple_response(text=payload.greeting)

        # Stay connected until /leave cancels this task or the safety
        # timeout elapses.
        with suppress(asyncio.CancelledError):
            await asyncio.sleep(SAFETY_TIMEOUT_SECONDS)


@app.post("/join")
async def join(payload: JoinRequest):
    if payload.meetingId in _active_sessions:
        return {"status": "already-active"}

    task = asyncio.create_task(_run_agent_session(payload))
    _active_sessions[payload.meetingId] = task
    task.add_done_callback(lambda _t: _active_sessions.pop(payload.meetingId, None))

    return {"status": "joining"}


@app.post("/leave")
async def leave(payload: LeaveRequest):
    task = _active_sessions.pop(payload.meetingId, None)
    if task is None:
        return {"status": "not-active"}

    task.cancel()
    return {"status": "left"}


@app.get("/health")
async def health():
    return {"status": "ok", "activeSessions": len(_active_sessions)}
