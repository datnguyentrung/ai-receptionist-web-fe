const urlParams = new URLSearchParams(location.search);
const projectId = urlParams.get("projectId");

if (projectId) {
  const firebaseConfig = {
    apiKey: urlParams.get("apiKey"),
    authDomain: urlParams.get("authDomain"),
    projectId: projectId,
    storageBucket: urlParams.get("storageBucket"),
    messagingSenderId: urlParams.get("messagingSenderId"),
    appId: urlParams.get("appId"),
  };

  importScripts(
    "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
  );
  importScripts(
    "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
  );

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const { title, body, icon } = payload.notification || {};
    if (!title) return;
    const clickUrl = payload.data?.clickUrl || payload.data?.url || "/";

    self.registration.showNotification(title, {
      body: body || "",
      icon: icon || "/assets/taekwondo.jpg",
      data: { clickUrl, ...payload.data },
      badge: "/assets/taekwondo.jpg",
    });
  });
} else {
  console.warn(
    "[SW] Firebase configuration parameters missing. Waiting for dynamic activation.",
  );
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickUrl = event.notification.data?.clickUrl || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(clickUrl);
            return client.focus();
          }
        }

        return self.clients.openWindow(clickUrl);
      }),
  );
});
