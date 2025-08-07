// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('✅ Service Worker registered successfully'))
    .catch(err => console.error('Service Worker registration failed:', err));
}

const allowBtn = document.getElementById('allowBtn');
const notifSound = document.getElementById('notifSound');

allowBtn.addEventListener('click', () => {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      notifSound.play().catch(() => {});
      document.getElementById('notification-container').style.display = 'none';

      // Send a message to the service worker to start the notification process
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          action: 'scheduleNotifications'
        });
        console.log('Request sent to Service Worker to schedule notifications.');
      }
    } else {
      console.warn('Notification permission was denied.');
      alert('You denied the permission. Please allow notifications from site settings to proceed.');
    }
  });
});