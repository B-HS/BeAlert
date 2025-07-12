import { addSubscription, removeSubscription } from '@/services/push.service'
import { Hono } from 'hono'

export const SubscribeRoute = () => {
    const app = new Hono()

    app.post('/subscribe', async (c) => {
        const body = await c.req.json()
        await addSubscription(body.subscription)
        return c.json({ ok: true })
    })

    app.delete('/unsubscribe/:p256dh', async (c) => {
        await removeSubscription(c.req.param('p256dh'))
        return c.json({ ok: true })
    })
    return app
}
