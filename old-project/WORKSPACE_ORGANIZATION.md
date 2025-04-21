# Workspace Organization Guide

This guide explains how to keep your workspace organized and secure for GitHub commits.

## Credentials Management

### Where to Store Credentials

All sensitive credentials should be stored in the `.credentials` directory:

```
podplai-studio/
├── .credentials/          # Store all credentials here
│   ├── service-account-key.json
│   └── other-credentials.json
├── .env                   # References credentials but doesn't contain them
└── ...
```

### Setting Up Your Workspace

Run the provided script to organize your workspace:

**Windows:**
```powershell
.\Setup-Workspace.ps1
```

**Mac/Linux:**
```bash
chmod +x ./setup-workspace.sh
./setup-workspace.sh
```

### Verifying Security

Before committing, run:
```
git status
```

Make sure no credential files are listed as staged or untracked.

## Environmental Variables

Update your `.env` file to reference credentials in the secure location:

```
GOOGLE_APPLICATION_CREDENTIALS=./.credentials/service-account-key.json
```

## Git Practices

1. **Always check `git status`** before committing
2. **Review changes** with `git diff --staged` before committing
3. **Use the pre-commit hook** to catch credential files

## GitHub Repository Settings

For private repositories:
- Enable GitHub Push Protection
- Enable Secret Scanning

## Before Making Your Project Public

If you ever plan to make your repository public:
1. Rotate all credentials
2. Verify `.gitignore` is up to date
3. Scan git history for any leaked credentials
4. Consider using a fresh repository if needed
