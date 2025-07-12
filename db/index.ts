import * as schema from '@/db/schema'
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'

const sqlite = new Database('db/sqlite.db')
export const db = drizzle(sqlite)

export { schema }
