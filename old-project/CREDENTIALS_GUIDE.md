# Managing Credentials Securely

This guide explains how to handle credentials securely in this project.

## Service Account Files

Google Cloud service account files (JSON) should NEVER be committed to the repository. These files contain sensitive information that could be used to access your Google Cloud resources.

## How to Use Service Account Files

1. Download the service account JSON file from Google Cloud Console
2. Place it in the project root directory
3. Make sure it's named according to the `.env` file configuration:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./camera-calibration-beta-51a46d9d1055.json
   ```

## If You Accidentally Committed Service Account Files

If you accidentally committed a service account file, follow these steps:

### Option 1: Using the provided scripts

#### For Mac/Linux:
```bash
chmod +x ./scripts/remove-credentials.sh
./scripts/remove-credentials.sh
```

#### For Windows:
```powershell
.\scripts\Remove-Credentials.ps1
```

### Option 2: Manual approach

1. Add the file to `.gitignore`
2. Remove the file from the Git repository (but keep it locally):
   ```bash
   git rm --cached camera-calibration-beta-51a46d9d1055.json
   ```
3. Commit this change:
   ```bash
   git commit -m "Remove service account file from repository"
   ```
4. Push to your repository:
   ```bash
   git push
   ```

### Option 3: For more thorough removal (removing from Git history)

If the file has already been pushed and you need to remove it from the entire history:

1. Install BFG Repo-Cleaner or git-filter-repo
2. Run one of the scripts in the `scripts` directory
3. Force push the changes:
   ```bash
   git push origin --force
   ```

## Important Security Note

If you've accidentally committed and pushed credentials to a public repository:

1. Consider those credentials compromised
2. Immediately rotate/regenerate new credentials in Google Cloud Console
3. Revoke the old credentials
4. Never reuse the compromised credentials

## Environment Variables

For local development, store credentials in a `.env` file and ensure it's in `.gitignore`.
For deployment, use the platform's secure environment variable storage.
