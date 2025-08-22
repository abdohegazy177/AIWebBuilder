import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatSessionId: varchar("chat_session_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  messageType: text("message_type").default("text").notNull(), // 'text', 'image', 'video'
  mediaUrl: text("media_url"), // URL for generated images/videos
  mediaPrompt: text("media_prompt"), // Original prompt used for generation
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  title: true,
  userId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  chatSessionId: true,
  content: true,
  role: true,
  messageType: true,
  mediaUrl: true,
  mediaPrompt: true,
});

// Schema for image generation request
export const generateImageSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  model: z.enum(["dall-e-3", "stable-diffusion", "firefly"]).default("dall-e-3"),
  size: z.enum(["1024x1024", "1024x1792", "1792x1024"]).default("1024x1024"),
  style: z.enum(["natural", "vivid"]).default("vivid"),
});

// Schema for video generation request
export const generateVideoSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  model: z.enum(["runway-gen4", "pika-2.2"]).default("runway-gen4"),
  duration: z.number().min(2).max(10).default(4),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type GenerateImageRequest = z.infer<typeof generateImageSchema>;
export type GenerateVideoRequest = z.infer<typeof generateVideoSchema>;
