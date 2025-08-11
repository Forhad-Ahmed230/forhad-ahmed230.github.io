// Firebase SDK ইম্পোর্ট করুন
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// আপনার Firebase কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyAasfaqKX6_YerMvNNqMEkLhyHQKCkUCYY",
  authDomain: "notification-6e1fe.firebaseapp.com",
  projectId: "notification-6e1fe",
  storageBucket: "notification-6e1fe.appspot.com",
  messagingSenderId: "466180249875",
  appId: "1:466180249875:web:a8cdea1129ecb9d20b62e6",
  measurementId: "G-LYGLEQDE0M"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ব্যাকগ্রাউন্ডে আসা মেসেজ হ্যান্ডেল করুন
messaging.onBackgroundMessage(async (payload) => {
  console.log('[SW] Received background message payload:', payload);

  // payload.data থেকে নোটিফিকেশনের তথ্য সংগ্রহ করুন
  const notificationTitle = payload.data.title;
  const notificationBody = payload.data.body;
  const notificationIcon = payload.data.icon;
  const notificationBadge = payload.data.badge;
  const notificationUrl = payload.data.url;

  // নোটিফিকেশন দেখানোর জন্য অপশন তৈরি করুন
  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    badge: notificationBadge,
    data: {
      url: notificationUrl || 'https://www.facebook.com/forhad.ahmed.official'
    }
  };

  // কাস্টম সাউন্ড চালান
  try {
    const audio = new Audio('notification sound.mp3');
    await audio.play();
    console.log('[SW] Notification sound played.');
  } catch (error) {
    console.error('[SW] Error playing sound:', error);
  }

  // সার্ভিস ওয়ার্কার থেকে নোটিফিকেশন দেখান
  return self.registration.showNotification(notificationTitle, notificationOptions);
});


// নোটিফিকেশন ক্লিকে কী হবে তা নির্ধারণ করুন
self.addEventListener('notificationclick', (event) => {
  const urlToOpen = event.notification.data.url;
  event.notification.close();
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});