import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging'

const firebaseConfig = {
    apiKey: 'AIzaSyDU7gEdgf8nnQmOyiDfFuP8QwMm2X6rM_A',
    authDomain: 'bealert-89401.firebaseapp.com',
    projectId: 'bealert-89401',
    storageBucket: 'bealert-89401.appspot.com',
    messagingSenderId: '335950957415',
    appId: '1:335950957415:web:2ce5fff93a9e868ac0fdc2',
    measurementId: 'G-BD1MESEHRS',
}

const firebaseApp = initializeApp(firebaseConfig)
const messaging = getMessaging(firebaseApp)

const getFCMToken = async (vapidKey: string) => {
    try {
        const currentToken = await getToken(messaging, { vapidKey })
        if (currentToken) {
            return currentToken
        } else {
            console.log('No registration token available. Request permission to generate one.')
        }
    } catch (error) {
        console.log('An error occurred while retrieving token. ', error)
    }
}

const unsubscribeFromFCM = async (vapidKey: string) => {
    try {
        const currentToken = await getFCMToken(vapidKey)
        if (currentToken) {
            const result = await deleteToken(messaging)
            if (result) {
                console.log('Token successfully deleted.')
            } else {
                console.error('Failed to delete token.')
            }
        } else {
            console.warn('No token available to unsubscribe.')
        }
    } catch (error) {
        console.error('Error unsubscribing from FCM:', error)
    }
}

firebaseApp.automaticDataCollectionEnabled = false

export { messaging, getToken, onMessage, unsubscribeFromFCM }
