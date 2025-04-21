# Service Account Inventory

This document provides a comprehensive inventory of all service accounts in the `camera-calibration-beta` project, their purposes, and key management status.

## Service Account Inventory Table

| Service Account | Primary Purpose | Key File Location | Last Rotation | Next Rotation |
|----------------|-----------------|-------------------|--------------|--------------|
| `firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com` | Firebase Admin SDK | `.credentials/service-account-key.json` | [DATE] | [DATE + 90 days] |
| `github-action-962225178@camera-calibration-beta.iam.gserviceaccount.com` | GitHub Actions CI/CD | N/A (GitHub managed) | N/A | N/A |
| `dartopia@camera-calibration-beta.iam.gserviceaccount.com` | Dartopia App Vertex AI | TBD | TBD | TBD |
| `dartopiaapi@camera-calibration-beta.iam.gserviceaccount.com` | Dartopia API | TBD | TBD | TBD |

## Service Account Groups

### Core Application Accounts

#### Firebase Admin SDK Account
- **Email**: `firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com`
- **Roles**: 
  - Cloud Functions Admin
  - Firebase Admin SDK Administrator Service Agent
  - Firebase App Check Admin
  - Service Account Token Creator
  - Storage Admin
- **Purpose**: Used for server-side Firebase operations, authentication, and storage management
- **Applications Using**: Backend API, Cloud Functions
- **Key Rotation**: Required every 90 days

#### Dartopia Accounts
- **Dartopia App**: `dartopia@camera-calibration-beta.iam.gserviceaccount.com`
  - **Roles**: Vertex AI administrator, Vertex AI user, Viewer
  - **Purpose**: AI features in the main application
  
- **Dartopia API**: `dartopiaapi@camera-calibration-beta.iam.gserviceaccount.com`
  - **Roles**: Editor
  - **Purpose**: API service access

### Firebase Extension Accounts

Firebase Extensions automatically create service accounts. These are managed by Firebase and generally don't require manual key rotation:

| Extension Service Account | Purpose | Key Managed By |
|--------------------------|---------|---------------|
| `ext-firestore-genai-chatbot@...` | GenAI chatbot functionality | Firebase |
| `ext-firestore-multimodal--biss@...` | Multimodal GenAI processing | Firebase |
| `ext-firestore-multimodal-genai@...` | Multimodal GenAI processing | Firebase |
| `ext-gemini-api@...` | Gemini API access | Firebase |
| `ext-speech-to-text@...` | Speech recognition | Firebase |
| `ext-storage-detect-objects@...` | Object detection in images | Firebase |
| `ext-storage-googledrive-export@...` | Google Drive export | Firebase |
| `ext-storage-reverse-image-h326@...` | Reverse image search | Firebase |

### Platform Default Accounts

These accounts are automatically created by Google Cloud services:

| Default Service Account | Purpose | Management |
|------------------------|---------|------------|
| `515204322079-compute@developer.gserviceaccount.com` | Default Compute Engine account | GCP managed |
| `camera-calibration-beta@appspot.gserviceaccount.com` | Default App Engine account | GCP managed |

### CI/CD Account

- **GitHub Actions**: `github-action-962225178@camera-calibration-beta.iam.gserviceaccount.com`
  - **Roles**: API Keys Viewer, Cloud Functions Developer, Firebase Auth/Hosting Admin
  - **Purpose**: Used by GitHub Actions for CI/CD pipelines
  - **Key Management**: Managed through GitHub repository secrets

## Role Management Best Practices

### Critical Roles to Monitor

1. **Admin Roles**: Any role with "Admin" in the name grants extensive permissions and should be limited
2. **Editor Role**: Grants broad permissions to modify resources
3. **IAM Roles**: Roles that can modify permissions are particularly sensitive

### Recommended Role Assignments

For more secure operations, consider these role adjustments:

1. **Replace Editor roles** with more specific roles matching the actual needs
2. **Audit Firebase Extension accounts** to ensure they have only necessary permissions
3. **Create custom roles** for service accounts with very specific needs

## Key Rotation Schedule

| Service Account | Current Key ID | Creation Date | Next Rotation Date | Responsible Person |
|----------------|---------------|--------------|-------------------|-------------------|
| firebase-adminsdk | [KEY_ID] | [DATE] | [DATE + 90 days] | [NAME] |
| [Add others as needed] | | | | |

## How to Verify Service Account Usage

To check which service accounts are actively being used:

1. Review Cloud Audit Logs
2. Check service account key last used time
3. Monitor API calls in Cloud Monitoring

## Action Plan for Service Account Management

### Current Priority: Getting Back to GitHub
1. **Organize Credentials for Safe GitHub Usage**:
   - Move your service account key to a `.credentials` folder in your project
   - Update your `.env` file to reference this location
   - Ensure `.gitignore` is properly configured (see below)

2. **Verify Your `.gitignore` File**:
   ```
   # Credentials - keep these out of GitHub
   .credentials/
   **/service-account*.json
   **/*credentials*.json
   functions/service-account-key.json
   ```

3. **Safe GitHub Setup**:
   - Your existing keys are secure in a private repository
   - GitHub's push protection will help prevent accidental credential exposure
   - Use environment variables in deployment environments

### For Future Reference
- Your billing alerts provide adequate protection against unauthorized usage
- For personal projects, focus on functionality rather than complex security processes
- Since your repository is private, credential management can be simpler

### For Future Reference
For personal projects, key management can be simpler:
- Rotate keys only when needed (suspected compromise or team changes)
- Use environment variables or config files that stay local
- Keep your GitHub repository private for code containing credentials
- Rely on Google Cloud's built-in monitoring and billing alerts

## Simplified Management for Private Projects
Since this is a personal tool with private access:
- You can keep your existing keys as long as the repository remains private
- Your billing triggers provide adequate protection against unauthorized usage
- Focus on functionality rather than enterprise-level security processes

### Immediate Actions (Next 7 Days)
1. **Rotate the exposed Firebase Admin SDK key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts?project=camera-calibration-beta)
   - Select `firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com`
   - Create a new key and download it
   - Place it in your `.credentials` folder
   - Update your `.env` file to point to the new key
   - Delete the old key with ID starting with `91a80b4...`

2. **Update your `.gitignore` file** to exclude all credential files:
   ```
   # Credentials
   .credentials/
   **/service-account*.json
   **/*credentials*.json
   ```

3. **Document your primary service account keys**:
   - Complete the Key Rotation Schedule table in this document
   - Set reminder dates for 90-day rotation cycles

### Short-term Actions (Next 30 Days)
1. **Audit unnecessary Editor roles**:
   - Review accounts with Editor role: `dartopiaapi@...`, `515204322079-compute@...`, etc.
   - Replace with more specific roles based on actual usage

2. **Set up a key rotation process**:
   - Create a calendar reminder for key rotation
   - Document the key rotation procedure in team documentation
   - Assign responsibility for key rotation to a team member

### Medium-term Actions (Next 90 Days)
1. **Analyze service account usage**:
   - Enable detailed audit logging in Google Cloud
   - After 30 days of data collection, identify unused accounts
   - Document findings in the "Unused Service Account Inventory" section

2. **Consolidate overlapping service accounts**:
   - Look for accounts with similar purposes and permissions
   - Create a plan to consolidate where appropriate
   - Document dependencies before making changes

### Tools to Help
1. **Google Cloud's Policy Analyzer**:
   - Go to IAM > Policy Analyzer in Google Cloud Console
   - Analyze which permissions are actually being used

2. **Service Account Key Metadata**:
   ```bash
   # List service account keys with creation time
   gcloud iam service-accounts keys list \
       --iam-account=firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com \
       --format="table(name.basename(), validAfterTime, validBeforeTime)"
   ```

## Unused Service Account Inventory

Complete this section after conducting a usage audit. Potentially unused accounts to investigate:
- `calibration-service@camera-calibration-beta.iam.gserviceaccount.com`
- `read-cloud-client-api-cd77@camera-calibration-beta.iam.gserviceaccount.com`
- `write-cloud-client-api-cd77@camera-calibration-beta.iam.gserviceaccount.com`
