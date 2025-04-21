#!/bin/bash

# This script helps safely set up credentials for the project

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  cp .env.example .env 2>/dev/null || echo "# Environment Variables" > .env
fi

# Ask for Google Cloud credentials
read -p "Enter path to Google Cloud Service Account JSON file: " service_account_path

# Validate the file exists
if [ ! -f "$service_account_path" ]; then
  echo "Error: File not found. Please provide a valid file path."
  exit 1
fi

# Create secure directory for credentials if it doesn't exist
mkdir -p .credentials

# Copy the file to the secure directory with a standard name
cp "$service_account_path" .credentials/service-account.json

# Update .env file with the correct path
grep -v "GOOGLE_APPLICATION_CREDENTIALS" .env > .env.tmp
echo "GOOGLE_APPLICATION_CREDENTIALS=.credentials/service-account.json" >> .env.tmp
mv .env.tmp .env

echo "Credentials set up successfully."
echo "Make sure .credentials/ is in your .gitignore file!"

# Check if .credentials is in .gitignore
if ! grep -q "\.credentials/" .gitignore 2>/dev/null; then
  echo "Adding .credentials/ to .gitignore..."
  echo ".credentials/" >> .gitignore
fi

echo "Setup complete! Your Google Cloud credentials are securely configured."
