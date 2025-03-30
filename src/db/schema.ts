import { relations } from 'drizzle-orm'
import { bigint, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const alertMessages = mysqlTable('alert_messages', {
    sn: bigint('sn', { mode: 'number' }).primaryKey().autoincrement(),
    crtDt: varchar('crt_dt', { length: 50 }).notNull(),
    msgCn: text('msg_cn').notNull(),
    rcptnRgnNm: text('rcptn_rgn_nm').notNull(),
    emrgStepNm: varchar('emrg_step_nm', { length: 100 }).notNull(),
    dstSeNm: varchar('dst_se_nm', { length: 100 }).notNull(),
    regYmd: varchar('reg_ymd', { length: 50 }).notNull(),
    mdfcnYmd: varchar('mdfcn_ymd', { length: 50 }).notNull(),
})

export const subscriptions = mysqlTable('subscriptions', {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    endpoint: varchar('endpoint', { length: 600 }).notNull().unique(),
    p256dh: varchar('p256dh', { length: 500 }).notNull(),
    auth: varchar('auth', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const subscriberLocation = mysqlTable('subscriber_location', {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    subscriberId: bigint('subscriber_id', { mode: 'number' })
        .notNull()
        .references(() => subscriptions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    location: varchar('location', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

export const subscriptionRelations = relations(subscriptions, ({ many }) => ({
    locations: many(subscriberLocation),
}))

export const subscriberLocationRelations = relations(subscriberLocation, ({ one }) => ({
    subscriber: one(subscriptions, {
        fields: [subscriberLocation.subscriberId],
        references: [subscriptions.id],
    }),
}))

export const latestAlertMessageInfo = mysqlTable('latest_alert_message_info', {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    page: bigint('page', { mode: 'number' }).notNull(),
    pageSize: bigint('page_size', { mode: 'number' }).notNull(),
    totalCount: bigint('total_count', { mode: 'number' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})
