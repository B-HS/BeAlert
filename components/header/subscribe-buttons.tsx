'use client'
import useFCM from '@/lib/notification'
import { Button } from '../ui/button'
import { useEffect, useState } from 'react'
const SubscribeButtons = ({ vapidKey }: { vapidKey: string }) => {
    const { requestPermission, requestUnsubscribe, addLocationInfoToIndexedDb } = useFCM(vapidKey)
    const [isSubscribed, setIsSubscribed] = useState(false)
    useEffect(() => {
        const fcm_token = localStorage.getItem('fcm_token')
        fcm_token && setIsSubscribed(true)
    }, [])

    const subscribe = () => {
        requestPermission()
            .then(() => setIsSubscribed(true))
            .catch(() => setIsSubscribed(false))
    }

    const unsubscribe = () => {
        requestUnsubscribe().then(() => setIsSubscribed(false))
    }

    return (
        <section className='flex items-center gap-2'>
            {!isSubscribed ? (
                <Button className='px-0' variant={'link'} size={'sm'} onClick={subscribe}>
                    구독
                </Button>
            ) : (
                <Button className='px-0' variant={'link'} size={'sm'} onClick={unsubscribe}>
                    구독해지
                </Button>
            )}
            <Button
                className='px-0'
                variant={'link'}
                size={'sm'}
                onClick={() => {
                    addLocationInfoToIndexedDb('마산')
                }}
            >
                설정
            </Button>
        </section>
    )
}

export default SubscribeButtons
