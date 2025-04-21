#!/bin/bash

# This script removes sensitive files from Git history

echo "Removing sensitive credentials from Git history..."

# Create a backup branch
git branch backup-before-removal

# Remove the sensitive file from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch attached_assets/Pasted--type-service-account-project-id-camera-calibration-beta-private-key-id-91-1744072004461.txt" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up the refs
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Sensitive file removed from Git history."
echo "To push changes forcefully to your remote repository:"
echo "git push origin main --force"
echo ""
echo "IMPORTANT: If you've shared this repository, other collaborators will need to re-clone it."
