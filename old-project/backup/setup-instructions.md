
# PodPlai Studio Setup Instructions

## Initial Setup

1. Clone the repository

2. Create a `.env` file based on the template in `backup/env-template`

3. Create a `.credentials` directory in the project root to store your service account key

4. Place your Firebase service account key in the `.credentials` directory

5. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   cd functions && npm install
   ```

## Firebase Setup

1. Initialize Firebase:
   ```bash
   firebase login
   firebase init
   ```

2. Select Firestore, Functions, and Hosting when prompted

3. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

4. Set up Firestore database:
   ```bash
   firebase firestore:databases:create --project=camera-calibration-beta --database=camera-calibration-db --location=europe-west1
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start the Firebase emulators:
   ```bash
   firebase emulators:start --only functions,firestore,auth --port.auth=9099 --port.functions=5050 --port.firestore=8080 --port.hosting=5002
   ```

3. Access the application at http://localhost:5000

## Important Security Notes

1. Never commit service account keys or .env files to Git
2. Keep reCAPTCHA secret keys secure
3. Rotate service account keys regularly
4. Use environment variables for sensitive configuration
5. Ensure .gitignore includes all credential-related patterns
