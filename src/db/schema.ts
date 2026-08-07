import { pgTable, text, timestamp, boolean, integer, real, jsonb, vector, pgEnum, index, unique } from "drizzle-orm/pg-core";
import {nanoid } from "nanoid";



export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});


export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);


export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);


export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
  ],
);


export const agentVisibility = pgEnum("agent_visibility", ["public", "private"]);

export const agents = pgTable(
  "agents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    name: text("name").notNull(),
    role: text("role").notNull(),
    description: text("description"),
    category: text("category").notNull().default("general"),

    systemPrompt: text("system_prompt").notNull(),
    personality: text("personality"),
    greeting: text("greeting"),
    suggestedQuestions: text("suggested_questions").array().notNull().default([]),

    model: text("model").notNull().default("gemini-2.5-flash"),
    temperature: real("temperature").notNull().default(0.7),
    voice: text("voice").notNull().default("Puck"),
    avatar: text("avatar"),

    visibility: agentVisibility("visibility").notNull().default("private"),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("agents_ownerId_idx").on(table.ownerId),
    index("agents_visibility_idx").on(table.visibility),
  ],
);


export const meetingProcessingStatus = pgEnum("meeting_processing_status", [
  "idle",
  "processing",
  "completed",
  "failed",
]);

export const meetings = pgTable(
  "meetings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: text("title").notNull(),
    description: text("description"),
    startsAt: timestamp("starts_at").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    participants: text("participants").array().notNull().default([]),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    agentId: text("agent_id").references(() => agents.id, { onDelete: "set null" }),

    processingStatus: meetingProcessingStatus("processing_status").notNull().default("idle"),
    processingError: text("processing_error"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("meetings_userId_idx").on(table.userId),
    index("meetings_startsAt_idx").on(table.startsAt),
    index("meetings_agentId_idx").on(table.agentId),
  ],
);

// ---- Meeting Intelligence -------------------------------------------------

export interface TranscriptEntry {
  speakerId: string;
  speakerName: string;
  text: string;
  startTs: number;
  stopTs: number;
}

export const meetingTranscripts = pgTable("meeting_transcripts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  meetingId: text("meeting_id")
    .notNull()
    .references(() => meetings.id, { onDelete: "cascade" }),
  streamTranscriptUrl: text("stream_transcript_url").notNull(),
  entries: jsonb("entries").notNull().$type<TranscriptEntry[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique("meeting_transcripts_meetingId_unique").on(table.meetingId),
]);

export interface ActionItem {
  text: string;
  owner: string | null;
  dueDate: string | null;
}
export interface KeyDecision {
  decision: string;
  context: string;
}
export interface Risk {
  risk: string;
  severity: "low" | "medium" | "high";
}
export interface Deadline {
  item: string;
  date: string;
}
export interface FollowUpTask {
  task: string;
  owner: string | null;
}
export interface SpeakerInsight {
  speakerName: string;
  talkTimeSeconds: number;
  talkTimePercent: number;
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  keyContributions: string[];
}
export interface ImportantQuote {
  quote: string;
  speaker: string;
  timestamp: number;
}
export interface AgendaItem {
  item: string;
}

export const meetingInsights = pgTable("meeting_insights", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  meetingId: text("meeting_id")
    .notNull()
    .references(() => meetings.id, { onDelete: "cascade" }),

  executiveSummary: text("executive_summary").notNull(),
  actionItems: jsonb("action_items").notNull().$type<ActionItem[]>(),
  keyDecisions: jsonb("key_decisions").notNull().$type<KeyDecision[]>(),
  risks: jsonb("risks").notNull().$type<Risk[]>(),
  deadlines: jsonb("deadlines").notNull().$type<Deadline[]>(),
  followUpTasks: jsonb("follow_up_tasks").notNull().$type<FollowUpTask[]>(),
  followUpEmail: text("follow_up_email").notNull(),
  tags: text("tags").array().notNull().default([]),
  topics: text("topics").array().notNull().default([]),
  sentiment: text("sentiment").notNull().$type<"positive" | "neutral" | "negative" | "mixed">(),
  sentimentScore: real("sentiment_score").notNull(),
  speakerInsights: jsonb("speaker_insights").notNull().$type<SpeakerInsight[]>(),
  importantQuotes: jsonb("important_quotes").notNull().$type<ImportantQuote[]>(),
  suggestedNextAgenda: jsonb("suggested_next_agenda").notNull().$type<AgendaItem[]>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  unique("meeting_insights_meetingId_unique").on(table.meetingId),
]);

export const meetingTranscriptChunks = pgTable("meeting_transcript_chunks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  meetingId: text("meeting_id")
    .notNull()
    .references(() => meetings.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  speakerName: text("speaker_name"),
  startTs: real("start_ts"),
  stopTs: real("stop_ts"),
  embedding: vector("embedding", { dimensions: 768 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("meeting_transcript_chunks_meetingId_idx").on(table.meetingId),
]);

export const meetingChatRole = pgEnum("meeting_chat_role", ["user", "assistant"]);

export interface ChatCitation {
  chunkId: string;
  speakerName: string | null;
  quote: string;
}

export const meetingChatMessages = pgTable("meeting_chat_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  meetingId: text("meeting_id")
    .notNull()
    .references(() => meetings.id, { onDelete: "cascade" }),
  role: meetingChatRole("role").notNull(),
  content: text("content").notNull(),
  citations: jsonb("citations").notNull().$type<ChatCitation[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("meeting_chat_messages_meetingId_idx").on(table.meetingId),
]);
