import { MiddlewareHandler } from 'hono'
import { brotliCompressSync } from 'node:zlib'

type Encoding = 'gzip' | 'br' | 'zstd'

interface CompressionOptions {
    threshold?: number
    minCompressLevel?: number
    maxCompressLevel?: number
}

const cacheControlNoTransformRegExp = /(?:^|,)\s*no-transform\s*(?:,|$)/i

const compressors: Record<Encoding, (input: Uint8Array, level: number) => Uint8Array> = {
    br: (raw, level) => brotliCompressSync(raw, { params: { [0x01]: level } }),
    zstd: (raw, level) => Bun.zstdCompressSync(raw, { level }),
    gzip: (raw, level) => Bun.gzipSync(raw, { level: level as -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 }),
}

const compressibleTypes = new Set([
    'text/html',
    'text/plain',
    'text/css',
    'text/csv',
    'text/javascript',
    'text/xml',
    'application/json',
    'application/javascript',
    'application/ecmascript',
    'application/xml',
    'application/x-javascript',
    'application/x-www-form-urlencoded',
    'application/wasm',
    'application/vnd.ms-fontobject',
    'application/vnd.ms-opentype',
    'application/postscript',
    'application/x-sh',
    'application/x-httpd-php',
    'application/toml',
    'application/rtf',
    'application/x-tar',
    'application/x-virtualbox-vhd',
    'image/bmp',
    'image/x-ms-bmp',
    'image/vnd.adobe.photoshop',
    'image/vnd.microsoft.icon',
    'image/x-icon',
    'font/otf',
    'font/ttf',
    'message/rfc822',
    'model/gltf-binary',
    'x-shader/x-fragment',
    'x-shader/x-vertex',
])

const hasCompressibleSuffix = (type: string) => type.includes('+json') || type.includes('+xml') || type.includes('+text') || type.includes('+yaml')

export const compress = (options?: CompressionOptions): MiddlewareHandler => {
    const threshold = options?.threshold ?? 1024
    const minLevel = options?.minCompressLevel ?? 1
    const maxLevel = options?.maxCompressLevel ?? 5

    return async (c, next) => {
        await next()

        const res = c.res
        const contentType = res.headers.get('Content-Type')?.toLowerCase().split(';')[0].trim()
        const contentLength = res.headers.get('Content-Length')
        const isCompressible = !!contentType && (compressibleTypes.has(contentType) || hasCompressibleSuffix(contentType))

        if (
            !res.body ||
            contentType?.startsWith('image/') ||
            contentType?.startsWith('video/') ||
            contentType?.startsWith('audio/') ||
            contentType === 'application/zip' ||
            contentType === 'application/pdf' ||
            contentType === 'application/octet-stream' ||
            res.headers.has('Content-Encoding') ||
            contentType?.startsWith('text/event-stream') ||
            c.req.method === 'HEAD' ||
            (contentLength && Number(contentLength) < threshold) ||
            !isCompressible ||
            cacheControlNoTransformRegExp.test(res.headers.get('Cache-Control') || '')
        ) {
            return
        }

        const accept = c.req.header('Accept-Encoding') ?? ''
        const encoding: Encoding = accept.includes('zstd') ? 'zstd' : accept.includes('br') ? 'br' : 'gzip'

        const raw = new Uint8Array(await res.arrayBuffer())
        const rawSize = raw.byteLength

        const dynamicLevel = Math.max(minLevel, Math.min(maxLevel, Math.floor(threshold / 512 + rawSize / 51200)))
        let compressed = compressors[encoding](raw, dynamicLevel)

        c.res.headers.delete('Content-Length')
        c.res.headers.set('Content-Encoding', encoding)
        c.res.headers.set('Vary', 'Accept-Encoding')

        c.res = new Response(compressed, {
            status: res.status,
            headers: c.res.headers,
        })
    }
}
