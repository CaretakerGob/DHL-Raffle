# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Firebase storage setup

The raffle app now supports Firestore storage for shared data across devices.

1. Copy `.env.local.example` to `.env.local`.
2. Fill in Firebase Web App config values:
	- `NEXT_PUBLIC_FIREBASE_API_KEY`
	- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
	- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
	- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
	- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
	- `NEXT_PUBLIC_FIREBASE_APP_ID`
3. Restart the dev server.

When Firebase is configured, data is stored in Firestore collection `raffleContexts` partitioned by `locationId + shiftId`.
If Firebase is not configured, the app automatically falls back to browser localStorage.

## Firestore security rules and project setup

This repository now includes:
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `.firebaserc.example`

Rules are currently set to allow only authenticated users (`request.auth != null`) to read/write raffle data.
The app signs in users with Firebase Anonymous Auth automatically to satisfy this requirement.

### CLI steps

1. Install Firebase CLI globally (if not installed):
	- `npm install -g firebase-tools`
2. Log in:
	- `firebase login`
3. In this repo, copy `.firebaserc.example` to `.firebaserc` and set your project id.
4. Initialize Firestore if needed:
	- `firebase init firestore`
5. Deploy rules and indexes:
	- `firebase deploy --only firestore:rules,firestore:indexes`

### Important

Enable **Anonymous** sign-in in Firebase Authentication for this project, or Firestore operations will be rejected and the app will fall back to local storage.

## Link GitHub commits to Firebase deploys

This repo now includes a GitHub Actions workflow at `.github/workflows/firebase-deploy.yml`.

### What it does

- On every push to `main`, it deploys:
	- Firestore rules
	- Firestore indexes
- Optionally deploys Firebase App Hosting backend when backend id is provided.

### Required GitHub settings

Add these in GitHub repository settings:

- **Secret**
	- `FIREBASE_SERVICE_ACCOUNT`: full JSON for a service account key with Firebase deploy permissions.

- **Variables**
	- `FIREBASE_PROJECT_ID`: your Firebase project id (for example `studio-48657765-9f203`).
	- `FIREBASE_APP_HOSTING_BACKEND_ID` (optional): app hosting backend id to auto-deploy App Hosting.

After these are set, each commit to `main` is linked to a Firebase deploy through the Actions run.
