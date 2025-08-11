// Firebase SDK ইম্পোর্ট করুন
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// আপনার দেওয়া Firebase কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyAasfaqKX6_YerMvNNqMEkLhyHQKCkUCYY",
  authDomain: "notification-6e1fe.firebaseapp.com",
  projectId: "notification-6e1fe",
  storageBucket: "notification-6e1fe.appspot.com",
  messagingSenderId: "466180249875",
  appId: "1:466180249875:web:a8cdea1129ecb9d20b62e6",
  measurementId: "G-LYGLEQDE0M"
};

// Firebase অ্যাপ ইনিশিয়ালাইজ করুন
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.data.icon || '/facebook logo.png',
    data: { url: payload.data.url || '/login.html' }
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) { return client.focus(); }
      }
      if (clients.openWindow) { return clients.openWindow(urlToOpen); }
    })
  );
});
