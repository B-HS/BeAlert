import { html } from 'hono/html'
import { FC } from 'hono/jsx'

export const Layout: FC = (props) => html`
    <!DOCTYPE html>
    <html lang="ko">
        <head>
            <title>BeAlert</title>
            <link rel="stylesheet" href="/output.css" />
            <link rel="icon" href="https://blog.gumyo.net/favicon.ico" type="image/x-icon" sizes="64x64" />
            <meta name="description" content="재난 문자 PWA 어플리케이션" />
            <meta name="author" content="B-HS" />
            <meta name="keywords" content="alert data, 재난 데이터, 재난 문자" />
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="vapid-public-key" content="${process.env.VAPID_PUBLIC_KEY}" />
        </head>

        <body class="antialiased">
            ${props.children}
            <script src="/webpush-subscribe.js"></script>
        </body>
    </html>
`
