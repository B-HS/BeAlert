import { useEffect } from 'react'
import backend from './fetch-config'
import { getToken, messaging, onMessage, unsubscribeFromFCM } from './firebase'

const useFCM = (vapidKey: string) => {
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

            // Optionally, unregister service worker if needed
            await unregisterServiceWorker()
            localStorage.removeItem('fcm_token')
            console.log('All service workers unregistered.')
        } catch (error) {
            console.error('Error while unsubscribing:', error)
        }
    }

    useEffect(() => {
        if (localStorage.getItem('fcm_token')) {
            getToken(messaging, { vapidKey }).then((token) => {
                console.log('Token called')
            })
            onMessage(messaging, (payload) => {
                console.log('Message received. ', payload)
            })
        }
    }, [vapidKey])

    const sendTokenToServer = async (token: string) => {
        try {
            const response = await backend('/addtoken/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            })

            if (!response) {
                throw new Error('Failed to send token to server')
            }
        } catch (error) {
            console.error('Error sending token to server:', error)
        }
    }

    const removeTokenFromServer = async (token: string) => {
        try {
            const response = await backend(`/deletetoken/${token}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (!response) {
                throw new Error('Failed to remove token from server')
            }
        } catch (error) {
            console.error('Error removing token from server:', error)
        }
    }

    const openDatabase = (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('LocationDB', 1)

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result
                if (!db.objectStoreNames.contains('locations')) {
                    console.log('Creating locations object store')
                    db.createObjectStore('locations', { keyPath: 'id' })
                }
            }

            request.onsuccess = (event: Event) => {
                console.log('Database opened successfully')
                const db = (event.target as IDBOpenDBRequest).result
                resolve(db)
            }

            request.onerror = (event: Event) => {
                reject(`IndexedDB error: ${(event.target as IDBOpenDBRequest).error?.message}`)
            }
        })
    }

    const checkAndCreateObjectStore = async (): Promise<void> => {
        const db = await openDatabase()
        if (!db.objectStoreNames.contains('locations')) {
            db.close()
            const request = indexedDB.open('LocationDB', db.version + 1)
            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result
                if (!db.objectStoreNames.contains('locations')) {
                    console.log('Creating locations object store during upgrade')
                    db.createObjectStore('locations', { keyPath: 'id' })
                }
            }

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log("Object store 'locations' created successfully")
                    resolve()
                }

                request.onerror = (event: Event) => {
                    reject(`IndexedDB upgrade error: ${(event.target as IDBOpenDBRequest).error?.message}`)
                }
            })
        }
        db.close()
    }

    const resetIndexedDb = async (): Promise<void> => {
        const db = await openDatabase()
        const transaction = db.transaction(['locations'], 'readwrite')
        const store = transaction.objectStore('locations')
        const clearRequest = store.clear()
        clearRequest.onerror = (event: Event) => {
            console.error(`Error clearing the locations object store:`, (event.target as IDBRequest).error?.message)
        }
        transaction.oncomplete = () => {
            db.close()
        }
    }

    const removeLocationInfoFromIndexedDb = async (valueToRemove: string): Promise<void> => {
        try {
            await checkAndCreateObjectStore()
            const db = await openDatabase()
            const transaction = db.transaction(['locations'], 'readwrite')
            const store = transaction.objectStore('locations')
            const getRequest = store.get('1')

            getRequest.onsuccess = () => {
                const existingData = getRequest.result
                if (existingData) {
                    const updatedInfo = existingData.info
                        .split(',')
                        .filter((value: string) => value !== valueToRemove)
                        .join(',')
                    const updateRequest = store.put({ id: '1', info: updatedInfo })
                    updateRequest.onsuccess = () => {
                        console.log(`Value ${valueToRemove} removed from IndexedDB`)
                    }
                    updateRequest.onerror = (event: Event) => {
                        console.error(`Error removing value ${valueToRemove}:`, (event.target as IDBRequest).error?.message)
                    }
                }
            }

            getRequest.onerror = (event: Event) => {
                console.error(`Error retrieving location 1:`, (event.target as IDBRequest).error?.message)
            }

            transaction.oncomplete = () => {
                db.close()
            }
        } catch (error) {
            console.error('Failed to remove value from IndexedDB:', error)
        }
    }

    const addLocationInfoToIndexedDb = async (location: string = '1'): Promise<void> => {
        try {
            await checkAndCreateObjectStore()
            const db = await openDatabase()
            const transaction = db.transaction(['locations'], 'readwrite')
            const store = transaction.objectStore('locations')
            const getRequest = store.get('1')

            getRequest.onsuccess = () => {
                const existingData = getRequest.result
                let newData = location
                if (existingData) {
                    newData = `${existingData.info},${location}`
                }
                const addRequest = store.put({ id: '1', info: newData })
                addRequest.onsuccess = () => {
                    console.log(`Location ${location} added to IndexedDB`)
                }
                addRequest.onerror = (event: Event) => {
                    console.error(`Error adding location ${location}:`, (event.target as IDBRequest).error?.message)
                }
            }

            getRequest.onerror = (event: Event) => {
                console.error(`Error retrieving location 1:`, (event.target as IDBRequest).error?.message)
            }

            transaction.oncomplete = () => {
                db.close()
            }
        } catch (error) {
            console.error('Failed to add location to IndexedDB:', error)
        }
    }

    return { requestPermission, requestUnsubscribe, addLocationInfoToIndexedDb, resetIndexedDb, removeLocationInfoFromIndexedDb }
}

export default useFCM
