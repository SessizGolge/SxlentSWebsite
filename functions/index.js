const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendNewPostNotification = functions.firestore
    .document("posts/{postId}")
    .onCreate(async (snap, context) => {
      const post = snap.data();

      const payload = {
        notification: {
          title: "New Post!",
          body: post.title,
        },
      };

      const tokensSnapshot = await admin.firestore().collection("tokens").get();

      const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

      if (tokens.length > 0) {
        await admin.messaging().sendToDevice(tokens, payload);
      }

      return null;
    });
