let locationMap = {};

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

    const locationId = resultData.title;
    const locationInfo = locationMap[locationId] || locationId;

    const notificationTitle = `[${locationInfo}]`;
    const notificationOptions = {
        body: resultData.body,
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