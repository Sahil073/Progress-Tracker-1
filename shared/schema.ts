import { pgTable, text, serial, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We primarily use client-side storage as requested, 
// but we define these types for the API contract and potential server-side operations.

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  link: text("link").notNull(),
  category: text("category"), // e.g., "Excel Import" or "GitHub Readme"
  // We won't strictly use this table for persistence if user wants local-only,
  // but it's good practice to have the model ready.
});

// Schema for parsing requests
export const parseUrlSchema = z.object({
  url: z.string().url(),
  type: z.enum(['github', 'excel']).optional(),
});

export const questionSchema = z.object({
  title: z.string(),
  link: z.string().url().optional().or(z.literal("")),
  completed: z.boolean().default(false),
  category: z.string().optional(),
});

export type Question = z.infer<typeof questionSchema>;
export type ParseUrlRequest = z.infer<typeof parseUrlSchema>;

export const insertQuestionSchema = createInsertSchema(questions);
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type QuestionItem = typeof questions.$inferSelect;
