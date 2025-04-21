# Service Account Roles Reference

This document provides guidance on common roles that might be needed for the `camera-calibration-beta` project and how to assign them.

## Common Firebase Roles

| Role | Description | Use Case |
|------|-------------|----------|
| `roles/firebase.admin` | Full access to all Firebase resources | Admin applications that need access to all Firebase services |
| `roles/firebase.developAdmin` | Develop and manage Firebase resources | Development environments |
| `roles/firebase.viewer` | View-only access to Firebase resources | Read-only applications |
| `roles/firestore.user` | Read/write access to all Firestore documents | Applications that need full Firestore access |
| `roles/storage.objectAdmin` | Full control of Storage objects | Applications that manage files |

## Common Google Cloud Roles

| Role | Description | Use Case |
|------|-------------|----------|
| `roles/compute.admin` | Full control of Compute Engine resources | Applications managing VM instances |
| `roles/logging.viewer` | View logs | Monitoring applications |
| `roles/serviceusage.serviceUsageConsumer` | Use services | Applications consuming APIs |

## Viewing Current Role Assignments

To see what roles are currently assigned to your service account:

```bash
gcloud projects get-iam-policy camera-calibration-beta \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com"
```

## Adding a Role to Your Service Account

To add a role to your service account:

```bash
gcloud projects add-iam-policy-binding camera-calibration-beta \
    --member="serviceAccount:firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"
```

## Removing a Role from Your Service Account

To remove a role:

```bash
gcloud projects remove-iam-policy-binding camera-calibration-beta \
    --member="serviceAccount:firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"
```

## Creating a Custom Role

If you need a specific set of permissions not covered by predefined roles:

1. Create a YAML file with the permissions (e.g., `custom-firebase-role.yaml`):

```yaml
title: "Custom Firebase Role"
description: "Role for specific Firebase operations needed by our application"
stage: "GA"
includedPermissions:
- firebase.projects.get
- firestore.documents.create
- firestore.documents.get
- firestore.documents.list
- firestore.documents.update
```

2. Create the custom role:

```bash
gcloud iam roles create customFirebaseRole \
    --project=camera-calibration-beta \
    --file=custom-firebase-role.yaml
```

3. Assign the custom role:

```bash
gcloud projects add-iam-policy-binding camera-calibration-beta \
    --member="serviceAccount:firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com" \
    --role="projects/camera-calibration-beta/roles/customFirebaseRole"
```

## Recommended Role Combinations for Common Use Cases

### For a Backend API Server
- `roles/firebase.admin`
- `roles/firestore.user`
- `roles/storage.objectAdmin`

### For a Read-Only Data Analysis Tool
- `roles/firebase.viewer`
- `roles/firestore.viewer`

### For a User Management System
- Custom role with:
  - `firebase.projects.get`
  - `firebaseauth.users.*` permissions
  - `firebaseauth.configs.get`

Always follow the principle of least privilege when assigning roles to service accounts.
