import { db } from '@src/db'
import { alertMessages, latestAlertMessageInfo, subscriberLocation, subscriptions } from '@src/db/schema'
import { AlertData } from '@src/types'
import { getLocationList, parseLocations } from '@src/utils'
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

    const isValid = Object.entries(subscriptionsInfo).some(([_, value]) => !value)
    if (isValid) {
        console.error('푸시 구독 정보가 유효하지 않습니다:', subscriptionsInfo)
        return false
    }

    const pushSubscription = {
        endpoint: subscriptionsInfo.endpoint!,
        keys: {
            p256dh: subscriptionsInfo.p256dh!,
            auth: subscriptionsInfo.auth!,
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

const getLastPageNo = (totalCount: number, limit: number) => Math.ceil(totalCount / limit)

export const sendWebPushNotification = async () => {
    const latestPaginationData = await db.select().from(latestAlertMessageInfo).orderBy(desc(latestAlertMessageInfo.createdAt)).limit(1)

    const query = new URLSearchParams()
    query.append('serviceKey', process.env.SERVICE_KEY || '')
    query.append('pageNo', latestPaginationData[0]?.page?.toString() || '1')
    query.append('numOfRows', latestPaginationData[0]?.pageSize?.toString() || '30')
    const url = `https://www.safetydata.go.kr/V2/api/DSSP-IF-00247?${query.toString()}`

    const alertData = await fetch(url).then((res) => res.json() as Promise<AlertData>)

    const paginationData = {
        pageSize: alertData.numOfRows || 30,
        totalCount: alertData.totalCount || 1,
    }

    const lastPageNo = getLastPageNo(paginationData.totalCount, paginationData.pageSize)

    if (alertData.numOfRows && alertData.totalCount){
        await db.insert(latestAlertMessageInfo).values({
            page: lastPageNo,
            ...paginationData,
        })
        console.log('[Bealert] Latest alert pagination info', lastPageNo, alertData.totalCount)
    }
        
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
            subs.forEach((sub) => sub.subscriberId && subscriberIdSet.add(sub.subscriberId))
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
                    title: getLocationList(alert.RCPTN_RGN_NM).join(', '),
                    body: alert.MSG_CN,
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
