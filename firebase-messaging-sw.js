importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

const firebaseConfig = { apiKey: "AIzaSyAasfaqKX6_YerMvNNqMEkLhyHQKCkUCYY", authDomain: "notification-6e1fe.firebaseapp.com", projectId: "notification-6e1fe", storageBucket: "notification-6e1fe.appspot.com", messagingSenderId: "466180249875", appId: "1:466180249875:web:a8cdea1129ecb9d20b62e6", measurementId: "G-LYGLEQDE0M" };

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon,
        image: payload.data.image,
        badge: payload.data.badge,
        data: { url: payload.data.url },

        // --- নতুন এবং নির্ভরযোগ্য সাউন্ড ফিচার ---
        silent: false, // নিশ্চিত করে যে নোটিফিকেশন সাইলেন্ট নয়
        requireInteraction: true // ব্যবহারকারী interact না করা পর্যন্ত নোটিফিকেশন থাকবে
        // ------------------------------------
    };
    
    // আমাদের আগের কাস্টম সাউন্ড প্লে করার কোডটি এখন আর প্রয়োজন নেই, কারণ silent: false বেশি নির্ভরযোগ্য।
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    const urlToOpen = event.notification.data.url;
    event.notification.close();
    event.waitUntil(clients.openWindow(urlToOpen));
});
