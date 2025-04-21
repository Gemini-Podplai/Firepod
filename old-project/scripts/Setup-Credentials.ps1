# HOW TO RUN THIS SCRIPT:
# 1. Right-click this file in Windows Explorer
# 2. Select "Run with PowerShell"
# 
# If that doesn't work, follow these alternative steps:
# 1. Press Windows+X and select "Windows PowerShell" or "Terminal"
# 2. Navigate to your project folder by typing:
#    cd "c:\Users\woody\podplai-studio"
# 3. Run the script by typing:
#    .\scripts\Setup-Credentials.ps1
#
# If you get an error about execution policy, run this command first:
#    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# This script helps safely set up credentials for the project

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" -Destination ".env"
    } else {
        "# Environment Variables" | Out-File -FilePath ".env"
    }
}

# Ask for Google Cloud credentials
$serviceAccountPath = Read-Host "Enter path to Google Cloud Service Account JSON file"

# Validate the file exists
if (-not (Test-Path $serviceAccountPath)) {
    Write-Host "Error: File not found. Please provide a valid file path." -ForegroundColor Red
    exit 1
}

# Create secure directory for credentials if it doesn't exist
if (-not (Test-Path ".credentials")) {
    New-Item -ItemType Directory -Path ".credentials" | Out-Null
}

# Copy the file to the secure directory with a standard name
Copy-Item $serviceAccountPath -Destination ".credentials\service-account.json"

# Update .env file with the correct path
$envContent = Get-Content -Path ".env" | Where-Object { $_ -notmatch "GOOGLE_APPLICATION_CREDENTIALS" }
$envContent += "GOOGLE_APPLICATION_CREDENTIALS=.credentials/service-account.json"
$envContent | Out-File -FilePath ".env"

Write-Host "Credentials set up successfully." -ForegroundColor Green
Write-Host "Make sure .credentials/ is in your .gitignore file!" -ForegroundColor Yellow

# Check if .credentials is in .gitignore
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content -Path ".gitignore"
    if (-not ($gitignoreContent -match "\.credentials/")) {
        Write-Host "Adding .credentials/ to .gitignore..." -ForegroundColor Yellow
        ".credentials/" | Out-File -FilePath ".gitignore" -Append
    }
} else {
    Write-Host "Creating .gitignore file with .credentials/ entry..." -ForegroundColor Yellow
    ".credentials/" | Out-File -FilePath ".gitignore"
}

Write-Host "Setup complete! Your Google Cloud credentials are securely configured." -ForegroundColor Green
