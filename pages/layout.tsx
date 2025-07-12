import { FC } from 'hono/jsx'
import { html } from 'hono/html'

export const Layout: FC<{ title: string; children?: any }> = ({ title, children }) => {
    let pageScript
    if (title === 'Home') {
        pageScript = '/assets/home.js'
    } else if (title === 'My Page') {
        pageScript = '/assets/mypage.js'
    }

    const vapidKey = Bun.env.VAPID_PUBLIC_KEY || ''

    return (
        <>
            {html`<!DOCTYPE html>`}
            <html lang='ko'>
                <head>
                    <title>{title} | BeAlert</title>
                    <meta charset='UTF-8' />
                    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
                    <meta name='theme-color' content='#FFFFFF' id='meta-theme-color' />
                    <meta name='description' content='재난 문자 PWA 어플리케이션' />
                    <meta name='author' content='B-HS' />
                    <meta name='keywords' content='alert data, 재난 데이터, 재난 문자' />
                    <meta name='vapid-public-key' content={vapidKey} />
                    <link rel='icon' href='https://blog.gumyo.net/favicon.ico' type='image/x-icon' sizes='64x64' />
                    <link rel='manifest' href='/assets/manifest.json' />
                    <link rel='stylesheet' href='/assets/styles.css' />
                    {pageScript && <script src={pageScript} defer></script>}
                    <script src='/assets/webpush-subscribe.js' defer></script>
                </head>
                <body>
                    <header class='header'>
                        <a href='/' class='header-logo'>
                            BeAlert
                        </a>
                        <nav class='header-nav'>
                            <a href='/mypage' id='navFavorites'>
                                즐겨찾기
                            </a>
                            <button id='subscribeBtn' class='btn btn-primary'></button>
                        </nav>
                    </header>
                    {children}
                </body>
            </html>
        </>
    )
}
