self.addEventListener('install', (event) => {
    console.log('📦 Service Worker installed')
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activated')

    event.waitUntil(
        (async () => {
            await self.clients.claim()
            console.log('🧠 클라이언트 컨트롤 권한 확보됨')
        })(),
    )
})
self.addEventListener('push', function (event) {
    const data = event.data?.json() ?? {}

    console.log('데이터 왔어요 !!!', data)

    event.waitUntil(
        self.registration.showNotification(data.title || '알림', {
            body: data.body || '',
            icon: 'https://blog.gumyo.net/favicon.ico',
        }),
    )
})
