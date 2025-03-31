import { relations } from 'drizzle-orm'
import { bigint, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const alertMessages = mysqlTable('alert_messages', {
    sn: bigint('sn', { mode: 'number' }).primaryKey().autoincrement(),
    crtDt: varchar('crt_dt', { length: 50 }),
    msgCn: text('msg_cn'),
    rcptnRgnNm: text('rcptn_rgn_nm'),
    emrgStepNm: varchar('emrg_step_nm', { length: 100 }),
    dstSeNm: varchar('dst_se_nm', { length: 100 }),
    regYmd: varchar('reg_ymd', { length: 50 }),
    mdfcnYmd: varchar('mdfcn_ymd', { length: 50 }),
})

export const subscriptions = mysqlTable('subscriptions', {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    endpoint: varchar('endpoint', { length: 600 }).unique(),
    p256dh: varchar('p256dh', { length: 500 }),
    auth: varchar('auth', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
})

export const subscriberLocation = mysqlTable('subscriber_location', {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    subscriberId: bigint('subscriber_id', { mode: 'number' }).references(() => subscriptions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    location: varchar('location', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
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
    page: bigint('page', { mode: 'number' }),
    pageSize: bigint('page_size', { mode: 'number' }),
    totalCount: bigint('total_count', { mode: 'number' }),
    createdAt: timestamp('created_at').defaultNow(),
})
