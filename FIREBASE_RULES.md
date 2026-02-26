# Firebase Firestore Security Rules

To allow the visitor counter to work properly, you need to update your Firestore security rules.

## How to Update Rules:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: **sxlentswebsite-80464**
3. Go to **Firestore Database**
4. Click on the **Rules** tab
5. Replace the entire content with the rules below
6. Click **Publish**

## Security Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read visitor count
    match /visitors/{document=**} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if false;
    }
    
    // Allow Firebase messaging for notifications (existing)
    match /tokens/{document=**} {
      allow read: if false;
      allow create: if true;
      allow update: if true;
      allow delete: if true;
    }
  }
}
```

## What This Does:

- ✅ Allows anyone to **read** the visitors collection (display counter)
- ✅ Allows anyone to **create/update** visitor documents
- ❌ Prevents **deleting** visitor data (for security)
- ✅ Keeps existing messaging token rules intact

## After Updating:

Refresh your website and the visitor counter should work! Check the browser console (F12) for confirmation.
