'use client'
import useFCM from '@/lib/notification'
import { Button } from '../ui/button'

const SiteHeader = ({ vapidKey }: { vapidKey: string }) => {
    const { requestPermission, requestUnsubscribe, addLocationInfoToIndexedDb } = useFCM(vapidKey)
    return (
        <header className='flex justify-between p-3 border-b'>
            <section>
                <span>BEALRERT</span>
            </section>
            <section>
                <Button variant={'ghost'} size={'sm'} onClick={requestPermission}>
                    Subscribe
                </Button>
                <Button variant={'ghost'} size={'sm'} onClick={requestUnsubscribe}>
                    Unsubscribe
                </Button>
                <Button
                    variant={'ghost'}
                    size={'sm'}
                    onClick={() => {
                        addLocationInfoToIndexedDb('마산')
                    }}
                >
                    Add Location
                </Button>
            </section>
        </header>
    )
}

export default SiteHeader
