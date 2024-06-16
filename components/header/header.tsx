import dynamic from 'next/dynamic'

const ScrollStatus = dynamic(() => import('./scroll-status'), { ssr: false })
const SubscribeButtons = dynamic(() => import('./subscribe-buttons'), { ssr: false })

const SiteHeader = ({ vapidKey }: { vapidKey: string }) => {
    return (
        <header className='top-0 z-50 sticky backdrop-blur border-b w-full'>
            <section className='flex justify-between items-center p-3'>
                <section>
                    <span>BEALRERT</span>
                </section>
                <SubscribeButtons vapidKey={vapidKey} />
            </section>
            <ScrollStatus />
        </header>
    )
}

export default SiteHeader
