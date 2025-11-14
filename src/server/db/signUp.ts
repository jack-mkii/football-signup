import { pgTableCreator } from "drizzle-orm/pg-core";
import { users } from "./schema";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => name);


export const signUps = createTable(
  "signUp",
  (d) => ({
    id: d.uuid().primaryKey().notNull().unique(),
    name: d.text().notNull(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  })
);

export type SignUp = typeof signUps.$inferSelect;
export type InsertSignUp = typeof signUps.$inferInsert;
