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
    title: 'BeAlert',
    description: '재난 문자 현황 및 웹 알림 서비스',
}

const Layout = async ({ children }: { children: ReactNode }) => {
    const vapidKey = process.env.APP_VAPIDKEY || ''
    return (
        <html lang='ko' suppressHydrationWarning>
            <head>
                <link rel='manifest' href='/manifest.json' />
                <meta name='theme-color' content='#FFF' />
                <link rel='apple-touch-icon' href='/icons/icon-192x192.png' />
            </head>
            <body className={cn('max-w-screen-2xl min-h-dvh font-mplus antialiased', fontRound.variable)}>
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
