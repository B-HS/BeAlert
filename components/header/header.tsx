import dynamic from 'next/dynamic'
import { Skeleton } from '../ui/skeleton'
import { buttonVariants } from '../ui/button'

const ScrollStatus = dynamic(() => import('./scroll-status'), { ssr: false })
const SubscribeButtons = dynamic(() => import('./subscribe-buttons'), {
    ssr: false,
    loading: () => (
        <section className='flex items-center gap-2'>
            <Skeleton className={buttonVariants({ variant: 'link', size: 'sm', className: 'px-0' })} />
            <Skeleton className={buttonVariants({ variant: 'link', size: 'sm', className: 'px-0' })} />
        </section>
    ),
})

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
