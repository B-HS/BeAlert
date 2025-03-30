import { Hono } from 'hono'

export const AlertRouter = (app: Hono) => {
    app.get('/alert', async (c) => {
        return c.json({ message: 'Alert API is working!' })
    })
}
