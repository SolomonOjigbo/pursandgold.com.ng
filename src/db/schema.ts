import { pgTable, text, timestamp, jsonb, uuid, varchar } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  company: varchar("company", { length: 200 }),
  interest: varchar("interest", { length: 120 }),
  message: text("message"),
  source: varchar("source", { length: 80 }).notNull().default("contact"),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const discoveryRequests = pgTable("discovery_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  company: varchar("company", { length: 200 }).notNull(),
  contactName: varchar("contact_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
