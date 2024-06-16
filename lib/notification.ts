import { useEffect } from 'react'
import backend from './fetch-config'
import { getToken, messaging, onMessage, unsubscribeFromFCM } from './firebase'
import { AlertApi } from './alert-api'

const useFCM = (vapidKey: string) => {
    const alertApi = new AlertApi()
    const requestPermission = async () => {
        if (!('Notification' in window)) {
            return
        }

        try {
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                console.log('Notification permission not granted.')
                return
            }

            console.log('Notification permission granted.')
            await navigator.serviceWorker
                .register('/firebase-messaging-sw.js', { scope: '/firebase-cloud-messaging-push-scope' })
                .then(async (reg) => {
                    console.log('Service worker registered:', reg)

                    const currentToken = await getToken(messaging, { vapidKey })
                    if (currentToken) {
                        console.log('FCM Token:', currentToken)
                        await sendTokenToServer(currentToken)
                        console.log('Token sent to server.')
                    } else {
                        console.log('No registration token available. Request permission to generate one.')
                    }

                    localStorage.setItem('fcm_token', currentToken)
                })
        } catch (error) {
            console.log('Error during subscription:', error)
        }
    }

    const unsubscribeFromPushService = async () => {
        try {
            const registration = await navigator.serviceWorker.getRegistration()
            if (!registration) {
                console.log('No service worker registration found')
                return null
            }
            console.log('Service worker is ready:', registration)

            const subscription = await registration.pushManager.getSubscription()
            console.log('Current subscription:', subscription)

            if (subscription) {
                await subscription.unsubscribe()
                console.log('Successfully unsubscribed from push service')
            } else {
                console.log('No push subscription found')
            }

            return subscription
        } catch (error) {
            console.error('Error during push service unsubscription:', error)
            throw error
        }
    }

    const unregisterServiceWorker = async () => {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations()
            for (const registration of registrations) {
                await registration.unregister()
                console.log('Service worker unregistered:', registration)
            }
        } catch (error) {
            console.error('Error during service worker unregistration:', error)
            throw error
        }
    }

    const requestUnsubscribe = async () => {
        try {
            console.log('Remove token from server...')
            getToken(messaging, { vapidKey }).then((token) => {
                removeTokenFromServer(token)
            })

            console.log('Unsubscribing...')
            await unsubscribeFromPushService()
            console.log('Unsubscribed from push service.')

            await unsubscribeFromFCM(vapidKey)
            console.log('Unsubscribed from FCM.')

            await unregisterServiceWorker()
            localStorage.removeItem('fcm_token')
            console.log('All service workers unregistered.')
        } catch (error) {
            console.error('Error while unsubscribing:', error)
        }
    }

    useEffect(() => {
        if (localStorage.getItem('fcm_token')) {
            getToken(messaging, { vapidKey }).then(() => {
                console.log('Token called')
            })
            onMessage(messaging, (payload) => {
                console.log('Message received. ', payload)
            })
        }
    }, [vapidKey])

    const sendTokenToServer = async (token: string) => {
        try {
            const response = await alertApi.requestAddToken(token)

            if (!response) {
                throw new Error('Failed to send token to server')
            }
        } catch (error) {
            console.error('Error sending token to server:', error)
        }
    }

    const removeTokenFromServer = async (token: string) => {
        try {
            const response = await alertApi.requestDeleteToken(token)
            if (!response) {
                throw new Error('Failed to remove token from server')
            }
        } catch (error) {
            console.error('Error removing token from server:', error)
        }
    }

    const requestLocationListByToken = async (): Promise<void> => {
        try {
            const currentToken = await getToken(messaging, { vapidKey })
            await alertApi.requestSubscribedListByToken(currentToken)
        } catch (error) {
            console.error('Failed to update location list in IndexedDB:', error)
        }
    }

    const requestSubscribeLocation = async (location: string): Promise<void> => {
        try {
            const currentToken = await getToken(messaging, { vapidKey })
            await alertApi.requestSubscribeLocation(location, currentToken)
        } catch (error) {
            console.error('Failed to subscribe location:', error)
        }
    }

    const requestUnsubscribeLocation = async (location: string): Promise<void> => {
        try {
            const currentToken = await getToken(messaging, { vapidKey })
            await alertApi.requestUnsubscribeLocation(location, currentToken)
        } catch (error) {
            console.error('Failed to unsubscribe location:', error)
        }
    }

    return {
        requestPermission,
        requestUnsubscribe,
        requestLocationListByToken,
        requestSubscribeLocation,
        requestUnsubscribeLocation,
    }
}

export default useFCM
