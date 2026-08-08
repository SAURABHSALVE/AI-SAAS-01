import { createChain, type MockDb } from "../helpers/mock-db";

jest.mock("@/db", () => {
  const actual = jest.requireActual("@/db");
  return {
    ...actual,
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
});

jest.mock("@/lib/auth", () => ({
  auth: { api: { getSession: jest.fn() } },
}));

import { db } from "@/db";
import { agentsRouter } from "@/modules/agents/server/procedures";
import { createCallerFactory, type createTRPCContext } from "@/trpc/init";

const mockDb = db as unknown as MockDb;
const createCaller = createCallerFactory(agentsRouter);

type Ctx = Awaited<ReturnType<typeof createTRPCContext>>;

const authedCtx = (userId = "user_1"): Ctx =>
  ({
    userId,
    session: {
      user: { id: userId, name: "Test User", email: "test@example.com", image: null },
    },
  }) as unknown as Ctx;

const anonCtx: Ctx = { userId: null, session: null };

const validAgentInput = {
  name: "Support Bot",
  role: "Customer support",
  category: "support",
  systemPrompt: "You help customers with their questions.",
  suggestedQuestions: ["How do I reset my password?"],
  model: "gemini-2.5-flash",
  temperature: 0.5,
  voice: "Puck",
  visibility: "private" as const,
};

describe("agents.create", () => {
  it("rejects unauthenticated callers", async () => {
    const caller = createCaller(anonCtx);
    await expect(caller.create(validAgentInput)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects a missing name", async () => {
    const caller = createCaller(authedCtx());
    await expect(
      caller.create({ ...validAgentInput, name: "" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an out-of-range temperature", async () => {
    const caller = createCaller(authedCtx());
    await expect(
      caller.create({ ...validAgentInput, temperature: 999 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an invalid visibility value", async () => {
    const caller = createCaller(authedCtx());
    await expect(
      // @ts-expect-error intentionally invalid enum value
      caller.create({ ...validAgentInput, visibility: "everyone" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("creates an agent on valid input", async () => {
    const createdRow = { id: "agent_1", ownerId: "user_1", ...validAgentInput };
    mockDb.insert.mockReturnValue(createChain([createdRow]));

    const caller = createCaller(authedCtx());
    const result = await caller.create(validAgentInput);

    expect(result).toEqual(createdRow);
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
  });
});

describe("agents.getMany", () => {
  it("rejects unauthenticated callers", async () => {
    const caller = createCaller(anonCtx);
    await expect(caller.getMany()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns the caller's agents by default, flagged as owned", async () => {
    const rows = [{ id: "agent_1", ownerId: "user_1", name: "Support Bot" }];
    mockDb.select.mockReturnValue(createChain(rows));

    const caller = createCaller(authedCtx());
    const result = await caller.getMany();

    expect(result).toEqual([{ ...rows[0], isOwner: true }]);
  });

  it("flags agents owned by someone else as not owned", async () => {
    const rows = [{ id: "agent_2", ownerId: "someone_else", name: "Public Bot" }];
    mockDb.select.mockReturnValue(createChain(rows));

    const caller = createCaller(authedCtx());
    const result = await caller.getMany({ scope: "public" });

    expect(result).toEqual([{ ...rows[0], isOwner: false }]);
  });

  it("accepts a search term", async () => {
    mockDb.select.mockReturnValue(createChain([]));
    const caller = createCaller(authedCtx());
    await expect(caller.getMany({ search: "support" })).resolves.toEqual([]);
  });

  it("rejects an invalid scope value", async () => {
    const caller = createCaller(authedCtx());
    await expect(
      // @ts-expect-error intentionally invalid enum value
      caller.getMany({ scope: "everyone" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("agents.remove", () => {
  it("rejects unauthenticated callers", async () => {
    const caller = createCaller(anonCtx);
    await expect(caller.remove({ id: "agent_1" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects an empty id", async () => {
    const caller = createCaller(authedCtx());
    await expect(caller.remove({ id: "" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("throws NOT_FOUND when the agent isn't owned by the caller", async () => {
    mockDb.delete.mockReturnValue(createChain([]));

    const caller = createCaller(authedCtx());
    await expect(caller.remove({ id: "agent_1" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("removes an owned agent", async () => {
    const removedRow = { id: "agent_1", ownerId: "user_1" };
    mockDb.delete.mockReturnValue(createChain([removedRow]));

    const caller = createCaller(authedCtx());
    const result = await caller.remove({ id: "agent_1" });

    expect(result).toEqual(removedRow);
  });
});
