'use client'
import useFCM from '@/lib/notification'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import SettingSheet from './setting-sheet'
import Github from './github'

const SubscribeButtons = ({ vapidKey }: { vapidKey: string }) => {
    const { requestPermission, requestUnsubscribe } = useFCM(vapidKey)
    const [isSubscribed, setIsSubscribed] = useState<boolean>(() => Boolean(localStorage.getItem('fcm_token')))

    useEffect(() => {
        const fcmToken = localStorage.getItem('fcm_token')
        setIsSubscribed(Boolean(fcmToken))
    }, [])

    const handleSubscribe = async () => {
        try {
            await requestPermission()
        } catch {}
    }

    const handleUnsubscribe = async () => {
        await requestUnsubscribe()
    }

    return (
        <section className='flex items-center gap-3.5'>
            {isSubscribed ? (
                <Button className='px-0' variant='link' size='sm' onClick={handleUnsubscribe}>
                    구독해지
                </Button>
            ) : (
                <Button className='px-0' variant='link' size='sm' onClick={handleSubscribe}>
                    구독
                </Button>
            )}

            <SettingSheet vapidKey={vapidKey}>
                <Button className='px-0' variant='link' size='sm'>
                    설정
                </Button>
            </SettingSheet>
            <Github />
        </section>
    )
}

export default SubscribeButtons
