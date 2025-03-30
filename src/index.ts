import { Hono } from 'hono'
import { InitializeConfig } from './config'
import { InitializeRouter } from './controller'
import { InitializeMiddleware } from './middleware'
import { InitializePages } from './page/page-routers'

const app = new Hono()
InitializeMiddleware(app)
InitializeRouter(app)
InitializePages(app)
InitializeConfig()

const server = Bun.serve({
    port: 31513,
    reusePort: true,
    fetch: app.fetch,
})

console.log(`Server running on port ${server.port}`)
