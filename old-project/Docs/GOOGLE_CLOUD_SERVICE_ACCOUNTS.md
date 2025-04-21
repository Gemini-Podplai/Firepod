# Google Cloud Service Account Management Guide

## Understanding Service Accounts in Your Project

Service accounts in Google Cloud are special types of accounts that represent non-human users that need to authenticate and be authorized to access data in Google APIs. For your `camera-calibration-beta` project, service accounts are particularly important for Firebase Admin SDK integration.

## Current Service Account Structure

Currently, your project uses multiple service accounts for different purposes:

### Key Service Accounts

| Service Account Email | Purpose | Key Roles |
|----------------------|---------|-----------|
| `firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com` | Firebase Admin SDK | Firebase Admin SDK Administrator, Cloud Functions Admin, Storage Admin |
| `github-action-962225178@camera-calibration-beta.iam.gserviceaccount.com` | GitHub Actions | Firebase Authentication Admin, Firebase Hosting Admin |
| `dartopia@camera-calibration-beta.iam.gserviceaccount.com` | Dartopia App | Vertex AI administrator, Vertex AI user |
| `dartopiaapi@camera-calibration-beta.iam.gserviceaccount.com` | Dartopia API | Editor |
| `vertex-ai-sa@camera-calibration-beta.iam.gserviceaccount.com` | Vertex AI Service | Compute Instance Admin, Vertex AI user |

### Complete Service Account Inventory

| Service Account | Roles |
|----------------|-------|
| `515204322079-compute@developer.gserviceaccount.com` (Compute Engine default) | Editor |
| `calibration-service@camera-calibration-beta.iam.gserviceaccount.com` | Cloud Functions Invoker, Environment and Storage Object Viewer |
| `camera-calibration-beta@appspot.gserviceaccount.com` (App Engine default) | Editor |
| `dartopia@camera-calibration-beta.iam.gserviceaccount.com` | Vertex AI administrator, Vertex AI user, Viewer |
| `dartopiaapi@camera-calibration-beta.iam.gserviceaccount.com` | Editor |
| `ext-firestore-genai-chatbot@camera-calibration-beta.iam.gserviceaccount.com` | Cloud Datastore User, Vertex AI user |
| `ext-firestore-multimodal--biss@camera-calibration-beta.iam.gserviceaccount.com` | Cloud Datastore User, Storage Object Admin, Vertex AI user |
| `ext-firestore-multimodal-genai@camera-calibration-beta.iam.gserviceaccount.com` | Cloud Datastore User, Storage Object Admin, Vertex AI user |
| `ext-gemini-api@camera-calibration-beta.iam.gserviceaccount.com` | Cloud Datastore User, Vertex AI user |
| `ext-speech-to-text@camera-calibration-beta.iam.gserviceaccount.com` | Cloud Datastore User, Storage Object Admin |
| `ext-storage-detect-objects@camera-calibration-beta.iam.gserviceaccount.com` | Cloud Datastore User, Storage Object Admin |
| `ext-storage-googledrive-export@camera-calibration-beta.iam.gserviceaccount.com` | Eventarc Publisher, Storage Admin |
| `ext-storage-reverse-image-h326@camera-calibration-beta.iam.gserviceaccount.com` | Cloud Datastore User, Storage Admin, Vertex AI user |
| `firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com` | Cloud Functions Admin, Firebase Admin SDK Administrator Service Agent, Firebase App Check Admin, Service Account Token Creator, Storage Admin |
| `github-action-962225178@camera-calibration-beta.iam.gserviceaccount.com` | API Keys Viewer, Cloud Functions Developer, Cloud Run Viewer, Firebase Authentication Admin, Firebase Hosting Admin, Service Usage Consumer |
| `goog-sc-cloud-client-api-552@camera-calibration-beta.iam.gserviceaccount.com` | Cloud Infrastructure Manager agent, Cloud Run Admin, Project IAM Admin, Role Administrator, Service Account Admin, Service Account User, Service Usage Admin, Storage Admin |
| `read-cloud-client-api-cd77@camera-calibration-beta.iam.gserviceaccount.com` | Logs Writer |
| `vertex-ai-sa@camera-calibration-beta.iam.gserviceaccount.com` | Compute Instance Admin (v1), Vertex AI user |
| `write-cloud-client-api-cd77@camera-calibration-beta.iam.gserviceaccount.com` | Logs Writer |

## Best Practices for Service Account Management

### 1. Principle of Least Privilege

Each service account should have only the permissions it needs to function:

```bash
# Example: Grant specific roles to your service account
gcloud projects add-iam-policy-binding camera-calibration-beta \
    --member="serviceAccount:firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"
```

### 2. Regular Key Rotation

Rotate service account keys regularly (every 90 days recommended):

```bash
# Create new key
gcloud iam service-accounts keys create new-key.json \
    --iam-account=firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com

# After confirming the new key works, delete the old key
# First, list the keys to find the key ID
gcloud iam service-accounts keys list \
    --iam-account=firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com

# Then delete the old key using its ID
gcloud iam service-accounts keys delete KEY_ID \
    --iam-account=firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com
```

### 3. Secure Storage of Key Files

- **Never commit key files to source control**
- Store key files in a secure location with restricted access
- Use environment variables to reference the key file location

## Service Account Role Strategy

### 1. Using Predefined Roles

Google Cloud provides many predefined roles suitable for common use cases:

| Service | Common Roles | Description |
|---------|-------------|-------------|
| Firebase | `roles/firebase.admin` | Full access to all Firebase resources |
| Storage | `roles/storage.objectAdmin` | Manage objects in Storage buckets |
| Firestore | `roles/datastore.user` | Read/write access to Firestore databases |

### 2. Creating Custom Roles

If predefined roles don't meet your requirements, create custom roles:

```bash
# Create a custom role from a YAML file
gcloud iam roles create customFirebaseRole \
    --project=camera-calibration-beta \
    --file=custom-role-definition.yaml
```

Example `custom-role-definition.yaml`:
```yaml
title: "Custom Firebase Role"
description: "Custom role for specific Firebase operations"
stage: "GA"
includedPermissions:
- firebase.projects.get
- firestore.documents.create
- firestore.documents.get
- storage.objects.get
```

## Rotating Service Account Keys

Follow these steps when rotating your service account keys:

1. **Create a new key**
   ```bash
   gcloud iam service-accounts keys create new-service-account-key.json \
       --iam-account=firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com
   ```

2. **Update your application configuration**
   - Move the new key file to your secure credentials directory
   - Update your `.env` file:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=.credentials/new-service-account-key.json
   ```

3. **Test your application** with the new key

4. **Delete the old key**
   ```bash
   gcloud iam service-accounts keys delete KEY_ID \
       --iam-account=firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com
   ```

## Monitoring Service Account Usage

Set up monitoring and alerts for your service accounts:

1. **Enable audit logging** for service account actions
2. **Create custom alerts** for suspicious activities
3. **Review service account access** periodically

Remember, service account keys should be treated with the same (or higher) level of security as passwords to your production systems.

## Service Account Categories and Purposes

Based on your project structure, your service accounts can be categorized as follows:

### 1. Core Application Service Accounts
- **Firebase Admin SDK** (`firebase-adminsdk-fbsvc@...`): Primary account for Firebase server operations
- **Dartopia** (`dartopia@...`): Main application service account
- **Dartopia API** (`dartopiaapi@...`): API-specific service account

### 2. Firebase Extensions Service Accounts
Multiple accounts prefixed with `ext-` handle specific Firebase extension functionalities:
- Firestore GenAI Chatbot
- Multimodal GenAI
- Gemini API
- Speech-to-Text
- Storage and object detection

### 3. Default Platform Accounts
- Compute Engine default service account
- App Engine default service account

### 4. CI/CD and Development Accounts
- GitHub Actions account for automated deployments

### 5. Specialized AI Service Accounts
- Vertex AI service account for machine learning operations

## Consolidation Recommendations

While you can't combine service account files, you can optimize your service account structure:

1. **Audit Unused Service Accounts**: Review the list and identify any that aren't actively used

2. **Consolidate Similar Functions**: For example, if you have multiple accounts accessing Firestore, consider using a single account with appropriate permissions

3. **Use the Principle of Least Privilege**: For each service account, review its roles and remove any unnecessary permissions

4. **Document Service Account Purposes**: Create clear documentation for each account:

```bash
# Example documentation template
# Service Account: firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com
# Purpose: Server-side Firebase authentication and administration
# Used by: Backend API server
# Key location: .credentials/firebase-admin-key.json
# Rotation schedule: Every 90 days (Next rotation: YYYY-MM-DD)
```

## Role Management Commands

To view all roles assigned to a specific service account:

```bash
gcloud projects get-iam-policy camera-calibration-beta \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com"
```

To add roles to an existing service account:

```bash
gcloud projects add-iam-policy-binding camera-calibration-beta \
    --member="serviceAccount:firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"
```

## Rotating Service Account Keys

Follow these steps when rotating your service account keys:

1. **Create a new key**
   ```bash
   gcloud iam service-accounts keys create new-service-account-key.json \
       --iam-account=firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com
   ```

2. **Update your application configuration**
   - Move the new key file to your secure credentials directory
   - Update your `.env` file:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=.credentials/new-service-account-key.json
   ```

3. **Test your application** with the new key

4. **Delete the old key**
   ```bash
   gcloud iam service-accounts keys delete KEY_ID \
       --iam-account=firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com
   ```

## Monitoring Service Account Usage

Set up monitoring and alerts for your service accounts:

1. **Enable audit logging** for service account actions
2. **Create custom alerts** for suspicious activities
3. **Review service account access** periodically

Remember, service account keys should be treated with the same (or higher) level of security as passwords to your production systems.
