import { pgTable, text, uuid, foreignKey, timestamp, check, unique, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
});

export const values = pgTable("values", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    user_value_name_unique: unique().on(table.user_id, table.name),
  };
});

export const captures = pgTable("captures", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  kind: text("kind").notNull().default("THOUGHT")
    .$check(check("kind", "in ('THOUGHT','EXTERNAL_LINK')")),
  body: text("body"),
  url: text("url"),
  created_at: timestamp("created_at").defaultNow(),
});

export const actions = pgTable("actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  status: text("status").default("TODO")
    .$check(check("status", "in ('TODO','DOING','DONE')")),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const resonate = pgTable("resonate", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  capture_id: uuid("capture_id").notNull().references(() => captures.id),
  value_id: uuid("value_id").notNull().references(() => values.id),
  reflection: text("reflection"),
  xp_granted: integer("xp_granted").default(10),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    user_capture_value_unique: unique().on(table.user_id, table.capture_id, table.value_id),
  };
});

export const xp_ledger = pgTable("xp_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  delta: integer("delta").notNull(),
  source_description: text("source_description"),
  source_action_id: uuid("source_action_id").references(() => actions.id),
  source_resonate_id: uuid("source_resonate_id").references(() => resonate.id),
  created_at: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertValueSchema = createInsertSchema(values).omit({ id: true, created_at: true });
export const insertCaptureSchema = createInsertSchema(captures).omit({ id: true, created_at: true });
export const insertActionSchema = createInsertSchema(actions).omit({ id: true, created_at: true, updated_at: true });
export const insertResonateSchema = createInsertSchema(resonate).omit({ id: true, created_at: true });
export const insertXpLedgerSchema = createInsertSchema(xp_ledger).omit({ id: true, created_at: true });

// Insert types
export type InsertValue = z.infer<typeof insertValueSchema>;
export type InsertCapture = z.infer<typeof insertCaptureSchema>;
export type InsertAction = z.infer<typeof insertActionSchema>;
export type InsertResonate = z.infer<typeof insertResonateSchema>;
export type InsertXpLedger = z.infer<typeof insertXpLedgerSchema>;

// Select types
export type Value = InferSelectModel<typeof values>;
export type Capture = InferSelectModel<typeof captures>;
export type Action = InferSelectModel<typeof actions>;
export type Resonate = InferSelectModel<typeof resonate>;
export type XpLedger = InferSelectModel<typeof xp_ledger>;
