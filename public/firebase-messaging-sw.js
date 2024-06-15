self.addEventListener("install", () => {
    console.log("FCM installing");
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", async (e) => {
    if (!e.data.json()) return;
    const resultData = e.data.json().notification;


    const openDatabase = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('LocationDB', 1)

            request.onupgradeneeded = (event) => {
                const db = event.target.result
                if (!db.objectStoreNames.contains('locations')) {
                    console.log('Creating locations object store')
                    db.createObjectStore('locations', { keyPath: 'id' })
                }
            }

            request.onsuccess = (event) => {
                console.log('Database opened successfully')
                const db = event.target.result
                resolve(db)
            }

            request.onerror = (event) => {
                reject(`IndexedDB error: ${event.target.error?.message}`)
            }
        })
    }

    const getLocationData = async () => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction(["locations"], "readonly");
            const store = transaction.objectStore("locations");

            const getRequest = store.get("1");

            return new Promise((resolve, reject) => {
                getRequest.onsuccess = (event) => {
                    const result = event.target.result;
                    resolve(result ? result.info : "");
                };

                getRequest.onerror = (event) => {
                    reject(`Error getting location data: ${event.target.error?.message}`);
                };
            });
        } catch (error) {
            console.error("Failed to retrieve location data from IndexedDB:", error);
            return "";
        }
    };

    let locationInfo = "";
    try {
        locationInfo = await getLocationData();
    } catch (error) {
        console.error("Failed to retrieve location data from IndexedDB:", error);
    }

    const notificationTitle = `${resultData.title} - ${locationInfo}`;
    const notificationOptions = {
        body: `${resultData.body} - ${locationInfo}`,
        icon: resultData.image,
        tag: resultData.tag,
        ...resultData,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
    const url = "/";
    event.notification.close();
    event.waitUntil(clients.openWindow(url));
});