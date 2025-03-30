import { Hono } from 'hono'
import { compress } from './compress'
import { serveStatic } from 'hono/bun'

export const InitializeMiddleware = async (app: Hono) => {
    app.use('/output.css', serveStatic({ path: './src/static/output.css' }))
    app.use('/sw.js', serveStatic({ path: './src/static/sw.js' }))
    app.use('/hmr.js', serveStatic({ path: './src/static/hmr.js' }))
    app.use('/webpush-subscribe.js', serveStatic({ path: './src/static/webpush-subscribe.js' }))
    app.use('/subscribe-panel.js', serveStatic({ path: './src/static/subscribe-panel.js' }))
    app.use('/128.png', serveStatic({ path: './src/static/128.png' }))
    app.use('/512.png', serveStatic({ path: './src/static/512.png' }))
    app.use('/manifest.json', serveStatic({ path: './src/static/manifest.json' }))
    app.use('*', compress())
    app.use('*', async (c, next) => {
        c.header('Cache-Control', 'public, max-age=60')
        await next()
    })
}
