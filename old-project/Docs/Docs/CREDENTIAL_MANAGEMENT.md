# Secure Credential Management Guide

## Best Practices for Managing Credentials

1. **Never commit credentials to Git repositories**
   - Use environment variables
   - Use secret management services

2. **Use a proper .gitignore file**
   - Add patterns for common credential files
   - Review changes before committing

3. **Use environment-specific configuration**
   - Development: .env files (not committed)
   - Production: environment variables or secret management

4. **Rotate credentials regularly**
   - Set up automated rotation when possible
   - Document the rotation process

## Setting Up Local Credentials

### Option 1: Using .env Files

1. Create a `.env` file in the project root
2. Add your credentials:
   ```
   GOOGLE_API_KEY=your_key_here
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json
   ```
3. Make sure `.env` is in your `.gitignore`

### Option 2: Using Environment Variables

**Windows PowerShell:**
```powershell
$env:GOOGLE_API_KEY="your_key_here"
$env:GOOGLE_APPLICATION_CREDENTIALS="./path/to/service-account.json"
```

**Linux/Mac:**
```bash
export GOOGLE_API_KEY="your_key_here"
export GOOGLE_APPLICATION_CREDENTIALS="./path/to/service-account.json"
```

## Using Service Account Files

1. Download the service account JSON file from Google Cloud Console
2. Save it outside your project directory or in a directory listed in `.gitignore`
3. Reference it using environment variables
4. Never commit the file to your repository

## Pre-Commit Hooks

Consider setting up pre-commit hooks to prevent accidental commits of sensitive information:

1. Install pre-commit: `pip install pre-commit`
2. Create a `.pre-commit-config.yaml` file with rules to check for secrets
3. Install the hooks: `pre-commit install`

Example hook configuration:
```yaml
repos:
-   repo: https://github.com/gitleaks/gitleaks
    rev: v8.16.1
    hooks:
    -   id: gitleaks
```

## Emergency: If You've Pushed Credentials

1. Rotate the credentials immediately
2. Remove the credentials from Git history
3. Force push the clean history
4. Notify any collaborators to re-clone the repository
