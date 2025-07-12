import { setVapidDetails } from 'web-push'

export const webPushMiddleware = () => {
    const VAPID_PUBLIC_KEY = Bun.env.VAPID_PUBLIC_KEY!
    const VAPID_PRIVATE_KEY = Bun.env.VAPID_PRIVATE_KEY!

    setVapidDetails('mailto:hs@gumyo.net', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}