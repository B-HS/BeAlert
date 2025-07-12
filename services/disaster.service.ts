import { db } from '@/db'
import { disasterSmsTable } from '@/db/schema'
import { and, desc, like, sql } from 'drizzle-orm'
import { DisasterSmsResponse, SearchInfo } from '../types'
import { sendNotificationsForSms } from './push.service'

const DISASTER_SMS_LIST_URL = 'https://www.safekorea.go.kr/idsiSFK/sfk/cs/sua/web/DisasterSmsList.do'

const getFormattedDate = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
}

const defaultFetchParams = () => {
    const today = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)

    return {
        searchBgnDe: getFormattedDate(sevenDaysAgo),
        searchEndDe: getFormattedDate(today),
    }
}

const fetchRemoteDisasterSmsList = async () => {
    const searchInfo: SearchInfo = {
        pageIndex: '1',
        pageUnit: '100',
        pageSize: '100',
        firstIndex: '1',
        lastIndex: '1',
        recordCountPerPage: '100',
        searchGb: '1',
        searchWrd: '',
        rcv_Area_Id: '',
        dstr_se_Id: '',
        c_ocrc_type: '',
        sbLawArea1: '',
        sbLawArea2: '',
        sbLawArea3: '',
        ...defaultFetchParams(),
    }

    try {
        const response = await fetch(DISASTER_SMS_LIST_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({ searchInfo }),
        })

        if (!response.ok) throw new Error(`HTTP error ${response.status}`)

        const data: DisasterSmsResponse = await response.json()
        return data.disasterSmsList
    } catch (err) {
        console.error('Remote fetch error', err)
        return []
    }
}

export const saveSmsListToDb = async (list: any[]) => {
    if (!list.length) return

    for (const sms of list) {
        try {
            await db.insert(disasterSmsTable).values({
                MD101_SN: sms.MD101_SN,
                CREAT_DT: sms.CREAT_DT,
                DSSTR_SE_NM: sms.DSSTR_SE_NM,
                RCV_AREA_NM: sms.RCV_AREA_NM,
                MSG_CN: sms.MSG_CN,
            })
        } catch (e) {
            console.error('DB Insert Error', e)
        }
    }
}

export const startDisasterSmsScheduler = () => {
    const task = async (): Promise<void> => {
        const remoteSmsList = await fetchRemoteDisasterSmsList()
        if (remoteSmsList.length) {
            const remoteSmsIds = remoteSmsList.map((sms) => sms.MD101_SN)
            const existingSms = db
                .select({ id: disasterSmsTable.MD101_SN })
                .from(disasterSmsTable)
                .where(sql`MD101_SN IN ${remoteSmsIds}`)
                .all()

            const existingSmsIds = new Set(existingSms.map((sms) => sms.id))
            const newSmsList = remoteSmsList.filter((sms) => !existingSmsIds.has(sms.MD101_SN))

            console.log(`🔑 Found ${newSmsList.length} new disaster SMS.`)
            if (newSmsList.length) {
                await saveSmsListToDb(newSmsList)
                await sendNotificationsForSms(newSmsList)
            }
        }

        const nextDelay = 30_000 + Math.floor(Math.random() * 60_001)
        setTimeout(task, nextDelay)
    }

    task()
}

export const fetchDisasterSmsList = async (searchParams: Partial<SearchInfo> = {}): Promise<DisasterSmsResponse> => {
    const pageSize = parseInt(searchParams.pageUnit || '10', 10)
    const pageIndex = parseInt(searchParams.pageIndex || '1', 10)
    const offset = (pageIndex - 1) * pageSize

    const whereClauses = [] as any[]
    if (searchParams.searchWrd) {
        whereClauses.push(like(disasterSmsTable.MSG_CN, `%${searchParams.searchWrd}%`))
    }

    if (searchParams.sbLawArea1) {
        whereClauses.push(like(disasterSmsTable.RCV_AREA_NM, `%${searchParams.sbLawArea1}%`))
    }

    const where = whereClauses.length ? and(...whereClauses) : undefined

    const countSelector = db.select({ value: sql<number>`count(*)` }).from(disasterSmsTable)
    const totalRes = where ? await countSelector.where(where).get() : await countSelector.get()
    const totCnt = Number(totalRes?.value ?? 0)

    const baseSelect = db.select().from(disasterSmsTable)
    const dataQuery = (where ? baseSelect.where(where) : baseSelect).orderBy(desc(disasterSmsTable.CREAT_DT)).limit(pageSize).offset(offset)

    const disasterSmsList = await dataQuery.all()

    return {
        disasterSmsList: disasterSmsList as unknown as import('../types').DisasterSms[],
        rtnResult: {
            totCnt,
            pageSize,
            resultCode: '0',
            resultMsg: 'SUCCESS',
        },
    }
}
