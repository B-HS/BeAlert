import { drizzle } from "drizzle-orm/bun-sqlite"
import { Database } from "bun:sqlite"
import * as schema from "@/db/schema"
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'

const sqlite = new Database("db/sqlite.db")
export const db = drizzle(sqlite)

migrate(db, { migrationsFolder: "./db/drizzle" })

export { schema } 