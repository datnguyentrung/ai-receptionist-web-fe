importScripts("/fcm-config.js");
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp(self.__FCM_CONFIG__);

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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickUrl = event.notification.data?.clickUrl || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
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
