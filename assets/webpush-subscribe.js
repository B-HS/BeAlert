const registeringServiceWorker = async () => {
    await navigator.serviceWorker.register('/sw.js')
    return navigator.serviceWorker.ready
}

const initPushButton = async (PUBLIC_KEY) => {
    const btn = document.getElementById('subscribeBtn')
    if (!PUBLIC_KEY) return
    const registration = await registeringServiceWorker()
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
        window.__p256dh__ = subscription.toJSON().keys.p256dh || 'NOT FOUND'

        // dispatch event
        const event = new CustomEvent('favorites:load')
        document.dispatchEvent(event)

        if (btn) {
            btn.innerText = '구독 해지'
            btn.onclick = async () => {
                await subscription.unsubscribe()
                await fetch(`/unsubscribe/${subscription.toJSON().keys.p256dh}`, {
                    method: 'delete',
                })
                console.log('❌ 구독 해지됨')
                btn.innerText = '구독 하기'
                btn.onclick = () => subscribe(PUBLIC_KEY)
            }
        }
    } else {
        if (btn) {
            btn.innerText = '구독하기'
            btn.onclick = () => subscribe(PUBLIC_KEY)
        }
    }
}

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)))
}

const subscribe = async (PUBLIC_KEY) => {
    if (!PUBLIC_KEY) {
        alert('VAPID 키가 존재하지 않습니다.')
        return
    }

    try {
        if (!navigator.serviceWorker.controller) {
            const shouldReload = !window.location.search.includes('sw=ready')
            if (shouldReload) {
                window.location.replace(window.location.pathname + '?sw=ready')
                return
            }
        }

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
            alert('알림 권한을 허용해주세요!')
            return
        }

        console.log('🛠 구독 프로세스 시작')
        const registration = await navigator.serviceWorker.ready
        let subscription = await registration.pushManager.getSubscription()

        if (subscription) {
            console.log('✅ 이미 구독됨:', subscription)
            return
        }

        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
        })

        await fetch('/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'user123',
                subscription: subscription.toJSON(),
            }),
        })

        alert('푸시 구독이 완료되었습니다.')
        await initPushButton(PUBLIC_KEY)
    } catch (error) {
        console.error('❌ 구독 실패:', error)
        alert('구독 중 오류가 발생했습니다.')
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const PUBLIC_KEY = document.querySelector('meta[name="vapid-public-key"]')?.getAttribute('content')
    try {
        await initPushButton(PUBLIC_KEY)
    } catch (error) {
        console.error('❌ 푸시 알림 초기화 실패:', error)
        alert('푸시 알림 초기화 중 오류가 발생했습니다.')
        const btn = document.getElementById('subscribeBtn')
        const favorites = document.getElementById('navFavorites')
        if (btn) {
            btn.style.display = 'none'
        }
        if (favorites) {
            favorites.style.display = 'none'
        }
    }

    /*
    setTimeout(() => {
        new URLSearchParams(window.location.search).forEach((value, key) => {
            if (key === 'sw' && value === 'ready') {
                subscribe(PUBLIC_KEY)
            }
        })
    }, 1000)
    */
})
