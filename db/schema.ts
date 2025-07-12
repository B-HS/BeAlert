import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const disasterSmsTable = sqliteTable('disaster_sms', {
  MD101_SN: integer('MD101_SN').primaryKey(),
  CREAT_DT: text('CREAT_DT'),
  DSSTR_SE_NM: text('DSSTR_SE_NM'),
  RCV_AREA_NM: text('RCV_AREA_NM'),
  MSG_CN: text('MSG_CN'),
  DSSTR_SE_ID: text('DSSTR_SE_ID'),
  MODF_DT: text('MODF_DT'),
  RCV_AREA_ID: text('RCV_AREA_ID'),
  UPDUSR_ID: text('UPDUSR_ID'),
  MSG_SE_CD: text('MSG_SE_CD'),
  DELETE_AT: text('DELETE_AT'),
  RNUM: integer('RNUM'),
  EMRGNCY_STEP_ID: text('EMRGNCY_STEP_ID'),
  REGIST_DT: text('REGIST_DT'),
  REGISTER_ID: text('REGISTER_ID'),
  EMRGNCY_STEP_NM: text('EMRGNCY_STEP_NM'),
})

export const subscriberTable = sqliteTable('subscriber', {
  id: integer('id').primaryKey(),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').unique().notNull(),
  auth: text('auth').notNull(),
})

export const subscriberKeywordTable = sqliteTable('subscriber_keyword', {
  id: integer('id').primaryKey(),
  subscriber_id: integer('subscriber_id').references(() => subscriberTable.id).notNull(),
  keyword: text('keyword').notNull(),
})

export const notificationHistoryTable = sqliteTable('notification_history', {
  id: integer('id').primaryKey(),
  subscriber_id: integer('subscriber_id').references(() => subscriberTable.id).notNull(),
  sms_id: integer('sms_id').references(() => disasterSmsTable.MD101_SN).notNull(),
  sent_at: text('sent_at').notNull(),
})



