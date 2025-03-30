import { db } from '@src/db'
import { alertMessages, latestAlertMessageInfo, subscriberLocation, subscriptions } from '@src/db/schema'
import { AlertData } from '@src/types'
import { desc, eq } from 'drizzle-orm'
import webpush = require('web-push')

export type NotificationPayload = {
    title: string
    body: string
    icon?: string
    url?: string
}

export const sendPush = async ({
    payload,
    subscriptionsInfo,
}: {
    payload: NotificationPayload
    subscriptionsInfo: typeof subscriptions.$inferSelect
}) => {
    const data = JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: '/',
    })

    const pushSubscription = {
        endpoint: subscriptionsInfo.endpoint,
        keys: {
            p256dh: subscriptionsInfo.p256dh,
            auth: subscriptionsInfo.auth,
        },
    }

    try {
        const result = await webpush.sendNotification(pushSubscription, data)
        console.log('푸시 전송 성공:', result)
        return true
    } catch (error) {
        console.error('푸시 전송 실패:', error)
        return false
    }
}

const parseLocations = (rcptnRgnNm: string): string[] => {
    const locationsSet = new Set<string>()
    const parts = rcptnRgnNm.split(',')
    parts.forEach((part) => {
        const trimmed = part.trim()
        if (trimmed) {
            trimmed.split(/\s+/).forEach((loc) => {
                if (loc) locationsSet.add(loc)
            })
        }
    })
    return Array.from(locationsSet)
}

const getLastPageNo = (totalCount: number, limit: number) => Math.ceil(totalCount / limit)

export const sendWebPushNotification = async () => {
    const latestPaginationData = await db.select().from(latestAlertMessageInfo).orderBy(desc(latestAlertMessageInfo.createdAt)).limit(1)

    const query = new URLSearchParams()
    query.append('serviceKey', process.env.SERVICE_KEY || '')
    query.append('pageNo', latestPaginationData[0]?.page.toString() || '1')
    query.append('numOfRows', latestPaginationData[0]?.pageSize.toString() || '30')
    const url = `https://www.safetydata.go.kr/V2/api/DSSP-IF-00247?${query.toString()}`

    const alertData = await fetch(url).then((res) => res.json() as Promise<AlertData>)

    console.log(alertData)

    const paginationData = {
        pageSize: alertData.numOfRows || 30,
        totalCount: alertData.totalCount || 1,
    }

    const lastPageNo = getLastPageNo(paginationData.totalCount, paginationData.pageSize)

    await db.insert(latestAlertMessageInfo).values({
        page: lastPageNo,
        ...paginationData,
    })

    const alerts = alertData.body || []

    const newAlerts: AlertData['body'] = []
    for (const alert of alerts) {
        const exists = await db.select().from(alertMessages).where(eq(alertMessages.sn, alert.SN))
        if (exists.length === 0) {
            await db.insert(alertMessages).values({
                sn: alert.SN,
                crtDt: alert.CRT_DT,
                msgCn: alert.MSG_CN,
                rcptnRgnNm: alert.RCPTN_RGN_NM,
                emrgStepNm: alert.EMRG_STEP_NM,
                dstSeNm: alert.DST_SE_NM,
                regYmd: alert.REG_YMD,
                mdfcnYmd: alert.MDFCN_YMD,
            })
            newAlerts.push(alert)
        }
    }

    const alertsWithLocations = newAlerts.map((alert) => {
        const locations = parseLocations(alert.RCPTN_RGN_NM)
        return { ...alert, locations }
    })

    const alertsWithSubscribers = [] as typeof alertsWithLocations & { subscriberIds: number[] }[]
    for (const alert of alertsWithLocations) {
        const subscriberIdSet = new Set<number>()
        for (const loc of alert.locations) {
            const subs = await db.select().from(subscriberLocation).where(eq(subscriberLocation.location, loc))
            subs.forEach((sub) => subscriberIdSet.add(sub.subscriberId))
        }
        alertsWithSubscribers.push({
            ...alert,
            subscriberIds: Array.from(subscriberIdSet),
        })
    }

    for (const alert of alertsWithSubscribers) {
        for (const subscriberId of alert.subscriberIds) {
            const subscription = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriberId))
            if (subscription.length === 0) {
                console.log('구독자 없음:', subscriberId)
                continue
            }

            const result = await sendPush({
                payload: {
                    title: 'BeAlert',
                    body: alert.MSG_CN,
                    url: '/alert-histories',
                },
                subscriptionsInfo: subscription[0],
            })

            if (result) {
                console.log('푸시 알림 전송 성공:', result)
            } else {
                console.log('푸시 알림 전송 실패')
            }

            console.log('send to subscriberId:', subscriberId)
        }
    }
}
