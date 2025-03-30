import { Hono } from 'hono'
import { compress } from './compress'
import { serveStatic } from 'hono/bun'

export const InitializeMiddleware = async (app: Hono) => {
    app.use('/output.css', serveStatic({ path: './src/static/output.css' }))
    app.use('/sw.js', serveStatic({ path: './src/static/sw.js' }))
    app.use('/hmr.js', serveStatic({ path: './src/static/hmr.js' }))
    app.use('/webpush-subscribe.js', serveStatic({ path: './src/static/webpush-subscribe.js' }))
    app.use('/subscribe-panel.js', serveStatic({ path: './src/static/subscribe-panel.js' }))
    
    
    app.use('*', compress())
    // Cache-Control header 설정
    // app.use('*', async (c, next) => {
    //     c.header('Cache-Control', 'public, max-age=31536000, immutable')
    //     await next()
    // })
}
