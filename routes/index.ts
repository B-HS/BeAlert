import { Hono } from 'hono'
import { KeywordRoute } from './keyword.routes'
import { PageRoute } from './page.routes'
import { SubscribeRoute } from './subscribe.routes'

export const initializeRouter = (app: Hono) => {
    app.route('/api/subscribe', KeywordRoute())
    app.route('/', SubscribeRoute())
    app.route('/', PageRoute())
}
