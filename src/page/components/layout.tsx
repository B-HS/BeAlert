import { html } from 'hono/html'
import { FC } from 'hono/jsx'
import { DarkModeIcon } from './dark'
import { GitHubLogo } from './github'
import { LightModeIcon } from './light'

export const Layout: FC = (props) => html`
    <!DOCTYPE html>
    <html lang="ko" class="light">
        <head>
            <title>BeAlert</title>
            <link rel="stylesheet" href="/output.css" />
            <link rel="icon" href="https://blog.gumyo.net/favicon.ico" type="image/x-icon" sizes="64x64" />
            <link rel="manifest" href="/manifest.json" />
            <meta name="theme-color" content="#000000" id="meta-theme-color" />
            <meta name="description" content="재난 문자 PWA 어플리케이션" />
            <meta name="author" content="B-HS" />
            <meta name="keywords" content="alert data, 재난 데이터, 재난 문자" />
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="vapid-public-key" content="${process.env.VAPID_PUBLIC_KEY}" />
        </head>

        <body class="antialiased mx-auto min-h-dvh bg-primary text-primary-foreground pt-10">
            <header class="flex justify-between items-center border-b border-border fixed top-0 left-0 w-full bg-primary">
                <a href="/" class="text-xl font-bold cursor-pointer px-2" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })">BeAlert</a>
                <nav class="flex items-stretch h-10">
                    <div class="w-0.25 h-full bg-border"></div>
                    <button
                        id="subscribeBtn"
                        class="cursor-pointer text-sm font-bold hover:bg-secondary hover:text-foreground transition-all px-2"></button>
                    <div class="w-0.25 h-full bg-border"></div>
                    <div class="flex items-stretch h-full">
                        <a
                            href="/subscribe-panel"
                            class="text-sm font-bold h-full flex justify-center items-center hover:bg-secondary hover:text-foreground transition-all px-2"
                            >구독 설정</a
                        >
                        <div class="w-0.25 h-full bg-border"></div>
                    </div>
                    <a
                        href="https://github.com/B-HS/bealert"
                        target="_blank"
                        class="text-primary-foreground size-10 flex items-center justify-center hover:bg-secondary hover:text-foreground transition-all">
                        ${(<GitHubLogo height={22} />)}
                    </a>
                    <div class="w-0.25 h-full bg-border"></div>
                    <button
                        id="theme-toggle"
                        class="text-sm font-bold text-primary-foreground flex items-center justify-center size-10 cursor-pointer hover:bg-secondary hover:text-foreground transition-all">
                        <span id="light-icon" class="hidden">${(<LightModeIcon />)}</span>
                        <span id="dark-icon" class="hidden">${(<DarkModeIcon />)}</span>
                    </button>
                </nav>
            </header>

            ${props.children}

            <script src="/webpush-subscribe.js"></script>
            <script src="/theme-toggle.js"></script>
            <script src="/accordion.js"></script>
        </body>
    </html>
`
