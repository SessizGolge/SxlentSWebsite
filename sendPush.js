const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function sendPush() {
  const snapshot = await db.collection("tokens").get();
  const tokens = snapshot.docs.map((doc) => doc.data().token);

  if (tokens.length === 0) {
    console.log("No tokens found.");
    return;
  }

  const payload = {
    notification: {
      title: "New Post!",
      body: "Click to see the post",
    },
  };

  await admin.messaging().sendToDevice(tokens, payload);

  console.log("Push sent successfully!");
}

sendPush();
