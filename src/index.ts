import { readFileSync } from 'fs'
import { Hono } from 'hono'
import { InitializeConfig } from './config'
import { InitializeRouter } from './controller'
import { InitializeMiddleware } from './middleware'
import { InitializePages } from './page/page-routers'
import path = require('path')

const app = new Hono()
InitializeMiddleware(app)
InitializeRouter(app)
InitializePages(app)
InitializeConfig()

const cert = readFileSync(path.join(__dirname, './cert.pem'), 'utf8')
const key = readFileSync(path.join(__dirname, './key.pem'), 'utf8')

const server = Bun.serve({
    tls: {
        cert,
        key,
    },
    port: 31513,
    reusePort: true,
    fetch: app.fetch,
})

console.log(`Server running on port ${server.port}`)
