#Requires -Version 5.0

<#
.SYNOPSIS
    Rotates a Google Cloud service account key.
.DESCRIPTION
    This script creates a new service account key, updates the application
    configuration, and optionally deletes the old key after confirmation.
.PARAMETER ServiceAccountEmail
    The email address of the service account.
.PARAMETER ProjectId
    The Google Cloud project ID.
.PARAMETER OutputPath
    The path where the new key file should be saved.
.PARAMETER UpdateEnvFile
    Whether to automatically update the .env file with the new key path.
.EXAMPLE
    .\rotate-service-account-key.ps1 -ServiceAccountEmail "firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com" -ProjectId "camera-calibration-beta"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceAccountEmail = "firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com",
    
    [Parameter(Mandatory=$true)]
    [string]$ProjectId = "camera-calibration-beta",
    
    [string]$OutputPath = ".credentials",
    
    [switch]$UpdateEnvFile = $true
)

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version
    Write-Host "Found gcloud CLI: $($gcloudVersion[0])" -ForegroundColor Green
}
catch {
    Write-Host "Error: Google Cloud CLI (gcloud) is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Check if user is logged in to gcloud
$gcloudAccount = gcloud config get-value account 2>$null
if (-not $gcloudAccount) {
    Write-Host "You are not logged in to gcloud. Please log in first." -ForegroundColor Yellow
    gcloud auth login
}

# Ensure project is set
gcloud config set project $ProjectId

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    Write-Host "Created directory: $OutputPath" -ForegroundColor Green
}

# Generate timestamp for the new key file
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$keyFilename = "service-account-key-$timestamp.json"
$keyFilePath = Join-Path $OutputPath $keyFilename

Write-Host "`nCreating new service account key..." -ForegroundColor Cyan
try {
    gcloud iam service-accounts keys create $keyFilePath --iam-account=$ServiceAccountEmail
    Write-Host "New key created successfully at: $keyFilePath" -ForegroundColor Green
}
catch {
    Write-Host "Error creating new service account key: $_" -ForegroundColor Red
    exit 1
}

# Update .env file if requested
if ($UpdateEnvFile) {
    $envPath = ".env"
    if (Test-Path $envPath) {
        Write-Host "`nUpdating .env file with new key path..." -ForegroundColor Cyan
        
        # Use forward slashes for the path in the .env file
        $envKeyPath = $keyFilePath.Replace("\", "/")
        
        $envContent = Get-Content -Path $envPath -Raw
        $updatedContent = $envContent -replace "GOOGLE_APPLICATION_CREDENTIALS=.*", "GOOGLE_APPLICATION_CREDENTIALS=$envKeyPath"
        
        Set-Content -Path $envPath -Value $updatedContent
        Write-Host "Updated GOOGLE_APPLICATION_CREDENTIALS in .env file." -ForegroundColor Green
    }
    else {
        Write-Host "Warning: .env file not found. Could not update configuration." -ForegroundColor Yellow
    }
}

# List existing keys and offer to delete an old one
Write-Host "`nExisting service account keys:" -ForegroundColor Cyan
$keys = gcloud iam service-accounts keys list --iam-account=$ServiceAccountEmail --format="table(name.basename(), validAfterTime, validBeforeTime)"
Write-Host $keys

$deleteKey = Read-Host "`nDo you want to delete an old key? (y/N)"
if ($deleteKey -eq "y" -or $deleteKey -eq "Y") {
    $keyId = Read-Host "Enter the KEY_ID of the key to delete"
    
    if ($keyId) {
        $confirmDelete = Read-Host "Are you sure you want to delete key $keyId? This cannot be undone. (y/N)"
        if ($confirmDelete -eq "y" -or $confirmDelete -eq "Y") {
            Write-Host "Deleting key $keyId..." -ForegroundColor Yellow
            try {
                gcloud iam service-accounts keys delete $keyId --iam-account=$ServiceAccountEmail --quiet
                Write-Host "Key deleted successfully." -ForegroundColor Green
            }
            catch {
                Write-Host "Error deleting key: $_" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`nKey rotation process completed." -ForegroundColor Green
Write-Host "Don't forget to update any applications using this service account with the new key." -ForegroundColor Cyan
