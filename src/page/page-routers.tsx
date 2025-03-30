import { Hono } from 'hono'
import AlertHistories from './alert-histories'
import SubscribePanel from './subscribe-panel'

export const InitializePages = (app: Hono) => {
    app.get('/', async (c) => {
        return c.html(<AlertHistories />)
    })

    app.get('/subscribe-panel', async (c) => {
        return c.html(<SubscribePanel />)
    })
}
