import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const followsTable = pgTable("follows", {
    follower_id: uuid().notNull(),
    followee_id: uuid().notNull(),
    created_at: timestamp().defaultNow(),
});
