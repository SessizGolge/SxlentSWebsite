const admin = require("firebase-admin");
const fs = require("fs");

// Service account yükle
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function sendPush() {
  try {
    console.log("Fetching tokens...");

    const snapshot = await db.collection("tokens").get();

    if (snapshot.empty) {
      console.log("No tokens found.");
      return;
    }

    const tokens = snapshot.docs.map(doc => doc.id);

    console.log(`Found ${tokens.length} tokens`);

    const message = {
      notification: {
        title: "New Post 🚀",
        body: "A new update has been published!",
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log("Push response:");
    console.log(response);

  } catch (error) {
    console.error("Push error:", error);
    process.exit(1);
  }
}

sendPush();
