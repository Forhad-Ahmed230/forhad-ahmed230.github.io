// Firebase SDK থেকে প্রয়োজনীয় ফাংশন ইম্পোর্ট করুন
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getFirestore(app);

// আপনার দেওয়া VAPID Key এখানে যুক্ত করা হয়েছে
const vapidKey = "BBWE-aOx-7UjOPWiOPjomq5iF7ElZ3C2aOpQM9QE65ZR6d21IoTunZLI4nH6s-IBrt_MgSIObJCMa3GhoTHOrwQ";

const allowBtn = document.getElementById('allowBtn');

allowBtn.addEventListener('click', () => {
  document.getElementById('notification-container').style.display = 'none';
  requestPermissionAndToken();
});

async function requestPermissionAndToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const currentToken = await getToken(messaging, { vapidKey: vapidKey });
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        await saveTokenToFirestore(currentToken);
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.warn('Notification permission denied.');
    }
  } catch (err) {
    console.error('An error occurred while retrieving token or permission.', err);
  }
}

async function saveTokenToFirestore(token) {
  const tokenDocRef = doc(db, 'fcm_tokens', token);
  const tokenData = {
    token: token,
    createdAt: serverTimestamp(),
    notificationCount: 0,
    lastNotification: null
  };
  try {
    await setDoc(tokenDocRef, tokenData, { merge: true });
    console.log('Token saved to Firestore successfully.');
    alert('Thank you! You will receive notifications from now on.');
  } catch (err) {
    console.error('Error saving token to Firestore: ', err);
  }
}