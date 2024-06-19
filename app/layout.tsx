import SiteHeader from '@/components/header/header'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { M_PLUS_Rounded_1c } from 'next/font/google'
import { ReactNode } from 'react'
import './globals.css'

const GoToTop = dynamic(() => import('@/components/go-top-top'), { ssr: false })
const fontRound = M_PLUS_Rounded_1c({
    subsets: ['latin'],
    variable: '--font-mplus',
    weight: ['300', '500', '700', '900'],
})


export const metadata: Metadata = {
    metadataBase: new URL('https://alert.hyns.dev/'),
    title: "BeAlert",
    authors: [{ name: 'Hyunseok Byun', url: 'https://github.com/B-HS' }],
    description: '재난 문자 현황 및 웹 알림 서비스',
    openGraph: {
        title: 'BeAlert',
        description: '재난 문자 현황 및 웹 알림 서비스',
        url: 'https://alert.hyns.dev/',
        siteName: 'BeAlert',
        images: [
            {
                url: `/img/icon.ico`,
                width: 1200,
                height: 630,
            },
        ],
    },
    twitter: {
        images: {
            url: `/img/icon.ico`,
            alt: 'BeAlert thumbnail',
        },
        title: 'BeAlert',
        description: 'BeAlert',
        creator: 'Hyunseok Byun',
    },
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: 'img/icon.ico',
    },
}


const Layout = async ({ children }: { children: ReactNode }) => {
    const vapidKey = process.env.APP_VAPIDKEY || ''
    return (
        <html lang='ko' suppressHydrationWarning className='none-scroll'>
            <head>
                <link rel='manifest' href='/manifest.json' />
                <meta name="theme-color" content="hsl(0, 0%, 3.9%)" />
                <link rel='apple-touch-icon' href='/icons/icon-192x192.png' />
                <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' />
            </head>
            <body className={cn('min-h-dvh font-mplus antialiased', fontRound.variable)}>
                <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
                    <SiteHeader vapidKey={vapidKey} />
                    <section className='flex flex-col flex-1 min-w-[300px] size-full'>
                        <GoToTop />
                        {children}
                    </section>
                </ThemeProvider>
            </body>
        </html>
    )
}

export default Layout
