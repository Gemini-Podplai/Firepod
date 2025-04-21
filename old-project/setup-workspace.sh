#!/bin/bash

# Create secure credentials directory
mkdir -p .credentials

# Check if service account key exists in functions directory
if [ -f "functions/service-account-key.json" ]; then
  echo "Moving service account key from functions directory to .credentials folder..."
  cp functions/service-account-key.json .credentials/
  echo "Service account key copied to secure location"
fi

# Check for any other service account files
find . -name "*service-account*.json" -not -path "./.credentials/*" | while read file; do
  echo "Found service account file: $file"
  echo "Copying to .credentials folder..."
  cp "$file" .credentials/
  echo "Please delete the original file after verifying the copy works"
done

echo "Credential files organized in .credentials directory"
