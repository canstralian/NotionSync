import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const notionDatabases = pgTable("notion_databases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  notionId: text("notion_id").notNull().unique(),
  name: text("name").notNull(),
  recordCount: integer("record_count").default(0),
  lastSync: timestamp("last_sync"),
  syncDirection: text("sync_direction").notNull().default("bidirectional"), // bidirectional, pull, push
  status: text("status").notNull().default("connected"), // connected, syncing, error
  isActive: boolean("is_active").default(true),
});

export const syncOperations = pgTable("sync_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  databaseId: varchar("database_id").references(() => notionDatabases.id),
  operation: text("operation").notNull(), // sync, pull, push
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  recordsProcessed: integer("records_processed").default(0),
  totalRecords: integer("total_records").default(0),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  errorMessage: text("error_message"),
});

export const dataChanges = pgTable("data_changes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  databaseId: varchar("database_id").references(() => notionDatabases.id),
  recordName: text("record_name").notNull(),
  action: text("action").notNull(), // created, updated, deleted
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status").notNull().default("pending"), // pending, synced, failed
  recordData: jsonb("record_data"),
});

export const syncSettings = pgTable("sync_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  autoSync: boolean("auto_sync").default(true),
  syncInterval: integer("sync_interval").default(5), // minutes
  cacheSize: integer("cache_size").default(0), // MB
  notionAccessToken: text("notion_access_token"),
  isAuthenticated: boolean("is_authenticated").default(false),
});

export const insertNotionDatabaseSchema = createInsertSchema(notionDatabases).omit({
  id: true,
});

export const insertSyncOperationSchema = createInsertSchema(syncOperations).omit({
  id: true,
  startTime: true,
});

export const insertDataChangeSchema = createInsertSchema(dataChanges).omit({
  id: true,
  timestamp: true,
});

export const insertSyncSettingsSchema = createInsertSchema(syncSettings).omit({
  id: true,
});

export type NotionDatabase = typeof notionDatabases.$inferSelect;
export type InsertNotionDatabase = z.infer<typeof insertNotionDatabaseSchema>;
export type SyncOperation = typeof syncOperations.$inferSelect;
export type InsertSyncOperation = z.infer<typeof insertSyncOperationSchema>;
export type DataChange = typeof dataChanges.$inferSelect;
export type InsertDataChange = z.infer<typeof insertDataChangeSchema>;
export type SyncSettings = typeof syncSettings.$inferSelect;
export type InsertSyncSettings = z.infer<typeof insertSyncSettingsSchema>;
