import * as webpush from 'web-push'
import { db } from '@/db'
import { subscriberTable, subscriberKeywordTable, notificationHistoryTable } from '@/db/schema'
import { inArray, sql, eq } from 'drizzle-orm'
import type { DisasterSms } from '@/types'
import type { PushSubscription } from 'web-push'

type SubscriptionKeys = { p256dh: string; auth: string }

type SubscriptionPayload = {
    endpoint: string
    keys: SubscriptionKeys
}

export type Favorite = {
    area1: { code: string; name: string }
    area2: { code: string; name: string }
    area3: { code: string; name: string }
}

const VAPID_PUBLIC_KEY = Bun.env.VAPID_PUBLIC_KEY ?? ''
const VAPID_PRIVATE_KEY = Bun.env.VAPID_PRIVATE_KEY ?? ''

webpush.setVapidDetails('mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

export const addSubscription = async (subscription: SubscriptionPayload) => {
    const { endpoint, keys } = subscription
    const existing = await db.select().from(subscriberTable).where(eq(subscriberTable.p256dh, keys.p256dh)).get()

    if (existing) {
        await db
            .update(subscriberTable)
            .set({ endpoint, auth: keys.auth })
            .where(eq(subscriberTable.id, existing.id))
            .run()
    } else {
        await db.insert(subscriberTable).values({ endpoint, p256dh: keys.p256dh, auth: keys.auth }).run()
    }
}

export const addKeywordToSubscriber = async (p256dh: string, keyword: Favorite) => {
    const subscriber = await db.select().from(subscriberTable).where(eq(subscriberTable.p256dh, p256dh)).get()
    if (!subscriber) {
        throw new Error('Subscriber not found')
    }
    const subscriberId = subscriber.id
    await db
        .insert(subscriberKeywordTable)
        .values({
            subscriber_id: subscriberId,
            keyword: JSON.stringify(keyword),
        })
        .run()
}

export const removeKeywordFromSubscriber = async (p256dh: string, keywordId: number) => {
    const subscriber = await db.select().from(subscriberTable).where(eq(subscriberTable.p256dh, p256dh)).get()
    if (!subscriber) {
        throw new Error('Subscriber not found')
    }
    await db
        .delete(subscriberKeywordTable)
        .where(sql`id = ${keywordId} AND subscriber_id = ${subscriber.id}`)
        .run()
}

export const getKeywordsForSubscriber = async (p256dh: string) => {
    const subscriber = await db.select().from(subscriberTable).where(eq(subscriberTable.p256dh, p256dh)).get()
    if (!subscriber) {
        return []
    }
    const keywordsRaw = await db
        .select()
        .from(subscriberKeywordTable)
        .where(eq(subscriberKeywordTable.subscriber_id, subscriber.id))
        .all()

    return keywordsRaw.map((k) => {
        const keywordData = JSON.parse(k.keyword)
        return {
            id: k.id,
            area1: keywordData.area1,
            area2: keywordData.area2,
            area3: keywordData.area3,
        }
    })
}

export const removeSubscription = async (p256dh: string) => {
    const subscriber = await db.select().from(subscriberTable).where(eq(subscriberTable.p256dh, p256dh)).get()
    if (!subscriber) return
    const id = subscriber.id
    await db.delete(subscriberKeywordTable).where(eq(subscriberKeywordTable.subscriber_id, id)).run()
    await db.delete(subscriberTable).where(eq(subscriberTable.id, id)).run()
}

const extractKeywords = (area: string) => {
    return area
        .split(' ,')
        .flatMap((seg) => seg.trim().split(' '))
        .filter((k) => k.length)
}

const findTargetSubscribers = async (smsKeywords: string[]) => {
    const uniqSmsKeywords = Array.from(new Set(smsKeywords))
    const allKeywords = await db.select().from(subscriberKeywordTable).all()

    const targetSubscriberIds = new Set<number>()

    for (const keywordRow of allKeywords) {
        try {
            const favorite = JSON.parse(keywordRow.keyword) as Favorite

            const subscriptionKeywords = [favorite.area1.name]
            if (favorite.area2.name) {
                subscriptionKeywords.push(favorite.area2.name)
            }
            if (favorite.area3.name && favorite.area3.name !== '전체') {
                subscriptionKeywords.push(favorite.area3.name)
            }

            const isMatch = subscriptionKeywords.every((subKeyword) => uniqSmsKeywords.includes(subKeyword))

            if (isMatch) {
                targetSubscriberIds.add(keywordRow.subscriber_id)
            }
        } catch (e) {
            console.error('Error parsing keyword JSON', e)
        }
    }

    const subscriberIds = Array.from(targetSubscriberIds)
    if (!subscriberIds.length) return []
    return db.select().from(subscriberTable).where(inArray(subscriberTable.id, subscriberIds)).all()
}

export const sendNotificationsForSms = async (list: DisasterSms[]) => {
  for (const sms of list) {
    const keywords = extractKeywords(sms.RCV_AREA_NM)
    const subscribers = await findTargetSubscribers(keywords)

    const payload = {
      title: `${sms.DSSTR_SE_NM} 알림`,
      body: sms.MSG_CN,
    }

    for (const sub of subscribers) {
      const already = await db
        .select({ value: sql<number>`count(*)` })
        .from(notificationHistoryTable)
        .where(sql`sms_id = ${sms.MD101_SN} and subscriber_id = ${sub.id}`)
        .get()
      if (already?.value) continue

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          } as PushSubscription,
          JSON.stringify(payload),
        )
        await db
          .insert(notificationHistoryTable)
          .values({ subscriber_id: sub.id, sms_id: sms.MD101_SN, sent_at: new Date().toISOString() })
          .run()
      } catch (e) {
        await removeSubscription(sub.p256dh)
      }
    }
  }
} 