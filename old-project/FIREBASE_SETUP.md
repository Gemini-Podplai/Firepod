# Firebase Setup for PodPlay Pen

This guide details how to set up the Firebase components required for PodPlay Pen.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created in the [Firebase Console](https://console.firebase.google.com/)

## Setup Steps

### 1. Authenticate Firebase CLI

```bash
firebase login
```

### 2. Initialize Firebase in your project

```bash
firebase init
```

When running the initialization command, you'll be presented with several options. Select the ones relevant to your PodPlay Pen implementation: 

- **Firestore**: Set up security rules and indexes for your Firestore database (Recommended)
- **Functions**: Set up the Cloud Functions directory for your backend logic (Recommended)
- **Hosting**: Configure Firebase Hosting for deploying your web application (Recommended)
- **Storage**: Set up security rules for Cloud Storage if you need file storage capabilities
- **Data Connect**: Set up Firebase Data Connect service if you need additional data integration
- **Genkit**: Set up a new Genkit project if you're using Firebase's AI tools alongside Gemini
- **App Hosting**: Configure App Hosting if you're deploying containerized applications

For most PodPlay Pen implementations, you'll need at minimum Firestore, Functions, and Hosting.

### 3. Create Firestore Database

You must create a Firestore database in Native mode before deploying extensions or functions:

```bash
firebase firestore:databases:create --project=your-project-id
```

**Note:** Make sure to create the database in the same region as your functions (e.g., europe-west1).

### 4. Deploy Firebase Resources

```bash
firebase deploy
```

## Troubleshooting

### Error: Firestore database does not exist

If you see an error like:

```
RESOURCE_ERROR: Firestore database 'projects/your-project/databases/(default)' does not exist. Please create a "(default)" Firestore Native database first.
```

Run the command in step 3 to create the database before deploying.

### Region Mismatch

If your functions and database are in different regions, you may encounter errors. Ensure consistent regions across your Firebase resources.
