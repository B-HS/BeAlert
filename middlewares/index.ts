import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { webPushMiddleware } from './web-push'
import { compress } from './compress'
import { cache } from 'hono/cache'

export const InitializeMiddlewares = (app: Hono) => {
    app.use('*', compress())
    app.use(
        '/*',
        cache({
            cacheName: 'bealert-v3-assets',
            cacheControl: 'public, max-age=86400',
        })
    )
    app.use('/*', serveStatic({ root: './assets' }))
    webPushMiddleware()
    return app
}
