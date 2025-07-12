import { addKeywordToSubscriber, getKeywordsForSubscriber, removeKeywordFromSubscriber } from '@/services/push.service'
import { Hono } from 'hono'

export const KeywordRoute = () => {
    const app = new Hono()

    app.get('/keywords/:subscriptionId', async (c) => {
        const subscriptionId = c.req.param('subscriptionId')
        const keywords = await getKeywordsForSubscriber(subscriptionId)
        return c.json({ keywords })
    })

    app.post('/keyword', async (c) => {
        const { subscriptionId, keyword } = await c.req.json()
        await addKeywordToSubscriber(subscriptionId, keyword)
        return c.json({ ok: true })
    })

    app.delete('/keyword', async (c) => {
        const { subscriptionId, id } = await c.req.json()
        await removeKeywordFromSubscriber(subscriptionId, id)
        return c.json({ ok: true })
    })

    return app
}
