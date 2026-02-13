importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBqpK0hbm48oZ_46gKzwB6ANVAKbVT7mbw",
    authDomain: "sxlentswebsite-80464.firebaseapp.com",
    projectId: "sxlentswebsite-80464",
    messagingSenderId: "785662700611",
    appId: "1:785662700611:web:b6ae713028a6976b4978f6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png"
  });
});
