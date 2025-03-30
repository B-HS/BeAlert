import { sendWebPushNotification } from "@src/service"

let intervalMap = {
    GET_ALERTS: false,
}
let intervalIds: NodeJS.Timer[] = []

// 예시: 주기적으로 alerts를 요청하는 함수
const requestGetAlerts = async ({ interval = 10000 }: { interval?: number }) => {
    if (intervalMap.GET_ALERTS) {
        console.log('Already running')
        return
    }

    setInterval(async () => {
        console.log('Interval running')
        await sendWebPushNotification()
    }, interval)

    intervalMap.GET_ALERTS = true
    console.log('[Alerts Cronjob Started]')
}

export const startCronjob = ({ alerts }: { alerts: number }) => {
    console.log('[BeAlert] Starting cronjob')
    requestGetAlerts({ interval: alerts })
}

export const stopCronjob = () => {
    intervalIds.forEach((intervalId) => clearInterval(intervalId))
    intervalIds = []
}

export const getCurrentIntervals = () => intervalIds
