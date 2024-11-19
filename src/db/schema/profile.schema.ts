import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const profilesTable = pgTable("profiles", {
    id: uuid().primaryKey().notNull(),
    updated_at: timestamp(),
    username: text().unique().notNull(),
    full_name: text(),
    avatar_url: text(),
    works_at: text(),
    location: text(),
});
