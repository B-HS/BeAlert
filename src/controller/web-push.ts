import type { Hono } from 'hono'

import { deleteLocation, getLocations, postLocation, subscribe, unsubscribe } from '@src/service/web-push.service'

export const WebpushRouter = (app: Hono) => {
    app.get('/locations/:p256dh', async (c) => {
        const { p256dh } = c.req.param()
        const { code, locations, message } = await getLocations(p256dh)
        return c.json({ message, code, locations })
    })

    app.post('/subscribe', async (c) => {
        const { subscription } = await c.req.json()
        const { message, code } = await subscribe(subscription)
        return c.json({ message, code })
    })

    app.post('/location', async (c) => {
        const { location, p256dh } = await c.req.json()
        console.log(location, p256dh)
        const { code, message } = await postLocation(location, p256dh)
        return c.json({ message, code })
    })

    app.delete('/unsubscribe/:p256dh', async (c) => {
        const { p256dh } = c.req.param()
        const { code, message } = await unsubscribe(p256dh)
        return c.json({ message, code })
    })

    app.delete('/location/:p256dh/:location', async (c) => {
        const { p256dh, location } = c.req.param()
        const { code, message } = await deleteLocation(p256dh, location)
        return c.json({ message, code })
    })
}
