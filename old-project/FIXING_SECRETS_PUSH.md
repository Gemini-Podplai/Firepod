# How to Fix GitHub Push Protection Rejection

GitHub has blocked your push because it detected sensitive credentials in your repository. Follow these steps to resolve the issue:

## Option 1: Using GitHub's Unblock Link

1. Visit the link provided in the error message:
   ```
   https://github.com/daddyholnes/podplai-studio/security/secret-scanning/unblock-secret/2vSE0onfgX1gvZbzfVMWa9NSGkF
   ```

2. Select a reason for unblocking (e.g., "This is a test credential")

3. Click "Unblock secret"

4. Try pushing again

## Option 2: Remove the Secret from Git History

### For Windows:

1. Open PowerShell
2. Navigate to your repository directory
3. Run the removal script:
   ```powershell
   .\scripts\Remove-Secrets.ps1
   ```
4. Force push your changes:
   ```
   git push origin main --force
   ```

### For Mac/Linux:

1. Open Terminal
2. Navigate to your repository directory
3. Make the script executable:
   ```bash
   chmod +x ./scripts/remove-secrets.sh
   ```
4. Run the script:
   ```bash
   ./scripts/remove-secrets.sh
   ```
5. Force push your changes:
   ```
   git push origin main --force
   ```

## Option 3: Manual Removal

1. Remove the file from your current working directory:
   ```
   rm attached_assets/Pasted--type-service-account-project-id-camera-calibration-beta-private-key-id-91-1744072004461.txt
   ```

2. Remove it from Git history:
   ```
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch attached_assets/Pasted--type-service-account-project-id-camera-calibration-beta-private-key-id-91-1744072004461.txt" --prune-empty --tag-name-filter cat -- --all
   ```

3. Clean up references:
   ```
   git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

4. Force push:
   ```
   git push origin main --force
   ```

## Important Security Note

Since these credentials have been committed to a repository, they should be considered compromised:

1. **Immediately rotate your Google Cloud Service Account credentials**
2. Create a new service account or new key for existing service account
3. Update your application to use the new credentials
4. Revoke the old credentials

## Preventing Future Issues

- Never commit credentials or secrets to Git
- Use environment variables or secure secret management solutions
- Add sensitive file patterns to your .gitignore file
- Consider using git-secrets or pre-commit hooks to prevent accidental commits
