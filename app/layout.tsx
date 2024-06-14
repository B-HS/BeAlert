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
    title: 'B-Hotdeal',
    description: 'HOT DEAL CRAWLING SITE',
}

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <html lang='ko' suppressHydrationWarning>
            <body className={cn('container p-0 max-w-screen-2xl h-dvh bg-background font-mplus antialiased flex flex-col', fontRound.variable)}>
                <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
                    <SiteHeader />
                    <section className='flex flex-col flex-1 min-w-[350px] size-full'>
                        <GoToTop />
                        {children}
                    </section>
                </ThemeProvider>
            </body>
        </html>
    )
}

export default Layout
