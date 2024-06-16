'use client'
import useFCM from '@/lib/notification'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import SettingSheet from './setting-sheet'

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
            setIsSubscribed(true)
        } catch {
            setIsSubscribed(false)
        }
    }

    const handleUnsubscribe = async () => {
        await requestUnsubscribe()
        setIsSubscribed(false)
    }

    return (
        <section className='flex items-center gap-2'>
            {isSubscribed ? (
                <Button className='px-0' variant='link' size='sm' onClick={handleUnsubscribe}>
                    구독해지
                </Button>
            ) : (
                <Button className='px-0' variant='link' size='sm' onClick={handleSubscribe}>
                    구독
                </Button>
            )}

            <SettingSheet>
                <Button className='px-0' variant='link' size='sm'>
                    설정
                </Button>
            </SettingSheet>
        </section>
    )
}

export default SubscribeButtons
