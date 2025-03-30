import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'

import * as mysql from 'mysql2/promise'

declare global {
    // eslint-disable-next-line no-unused-vars
    var _db: ReturnType<typeof drizzle> | undefined
}

const db = globalThis._db || drizzle(process.env.DATABASE_URL!)

if (process.env.NODE_ENV !== 'production') {
    globalThis._db = db
}

export { db }
