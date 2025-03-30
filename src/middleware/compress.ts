import { MiddlewareHandler } from 'hono'
import { createDeflate, createGzip } from 'zlib'

const COMPRESSIBLE_CONTENT_TYPE_REGEX =
    /^\s*(?:text\/[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i
const ENCODING_TYPES = ['gzip', 'deflate'] as const
const cacheControlNoTransformRegExp = /(?:^|,)\s*?no-transform\s*?(?:,|$)/i

interface CompressionOptions {
    encoding?: (typeof ENCODING_TYPES)[number]
    threshold?: number
}

export const compress = (options?: CompressionOptions): MiddlewareHandler => {
    const threshold = options?.threshold ?? 1024

    return async function compress(ctx, next) {
        await next()

        const contentLength = ctx.res.headers.get('Content-Length')

        if (
            ctx.res.headers.has('Content-Encoding') ||
            ctx.req.method === 'HEAD' ||
            (contentLength && Number(contentLength) < threshold) ||
            !shouldCompress(ctx.res) ||
            !shouldTransform(ctx.res)
        ) {
            return
        }

        const accepted = ctx.req.header('Accept-Encoding')
        const encoding = options?.encoding ?? ENCODING_TYPES.find((e) => accepted?.includes(e))
        if (!encoding || !ctx.res.body) {
            return
        }

        let compressedStream
        if (encoding === 'gzip') {
            compressedStream = createGzip()
        } else if (encoding === 'deflate') {
            compressedStream = createDeflate()
        } else {
            return
        }

        const nodeToWebReadable = (nodeStream: NodeJS.ReadableStream): ReadableStream => {
            return new ReadableStream({
                start(controller) {
                    nodeStream.on('data', (chunk) => controller.enqueue(chunk))
                    nodeStream.on('end', () => controller.close())
                    nodeStream.on('error', (err) => controller.error(err))
                },
                cancel() {
                    // @ts-ignore
                    nodeStream.destroy()
                },
            })
        }

        const reader = ctx.res.body?.getReader()
        reader?.read().then(function process({ done, value }) {
            if (done) {
                compressedStream.end()
                return
            }
            compressedStream.write(value)
            reader.read().then(process)
        })

        ctx.res = new Response(nodeToWebReadable(compressedStream), ctx.res)
        ctx.res.headers.delete('Content-Length')
        ctx.res.headers.set('Content-Encoding', encoding)
    }
}

const shouldCompress = (res: Response) => {
    const type = res.headers.get('Content-Type')
    return type && COMPRESSIBLE_CONTENT_TYPE_REGEX.test(type)
}

const shouldTransform = (res: Response) => {
    const cacheControl = res.headers.get('Cache-Control')
    return !cacheControl || !cacheControlNoTransformRegExp.test(cacheControl)
}
