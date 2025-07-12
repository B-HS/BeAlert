import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    out: './db/drizzle',
    schema: './db/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: './db/sqlite.db',
    },
})
