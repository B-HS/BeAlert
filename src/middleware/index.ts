import { Hono } from 'hono'
import { compress } from './compress'
import { serveStatic } from 'hono/bun'

const staticAssets: Record<string, string> = {
    '/output.css': './src/static/output.css',
    '/sw.js': './src/static/sw.js',
    '/hmr.js': './src/static/hmr.js',
    '/webpush-subscribe.js': './src/static/webpush-subscribe.js',
    '/subscribe-panel.js': './src/static/subscribe-panel.js',
    '/128.png': './src/static/128.png',
    '/512.png': './src/static/512.png',
    '/manifest.json': './src/static/manifest.json',
    '/accordion.js': './src/static/accordion.js',
    '/theme-toggle.js': './src/static/theme-toggle.js',
}

export const InitializeMiddleware = async (app: Hono) => {
    app.use('*', compress())

    app.use('*', async (c, next) => {
        c.header('Cache-Control', 'public, max-age=60')
        await next()
    })

    app.use(
        '/font/*',
        serveStatic({
            root: './src/static/font',
            rewriteRequestPath: (path) => path.replace(/^\/font/, ''),
        }),
    )

    Object.entries(staticAssets).forEach(([route, path]) => {
        app.use(route, serveStatic({ path }))
    })
}
