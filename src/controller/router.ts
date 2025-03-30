import { Hono } from 'hono'
import { CronController } from './cron'
import { AlertRouter } from './alert'
import { WebpushRouter } from './web-push'

export const InitializeRouter = (app: Hono) => {
    AlertRouter(app)
    CronController(app)
    WebpushRouter(app)
}
