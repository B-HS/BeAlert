import { Hono } from 'hono'
import { InitializeMiddlewares } from './middlewares'
import { initializeRouter } from './routes'
import { startDisasterSmsScheduler } from './services/disaster.service'

const app = new Hono()
InitializeMiddlewares(app)
initializeRouter(app)
startDisasterSmsScheduler()

export default {
    fetch: app.fetch,
    port: 3000,
}
