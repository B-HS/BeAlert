import webpush = require('web-push')

export const InitializeWebPush = () => {
    const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!

    webpush.setVapidDetails('mailto:hs@gumyo.net', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}
