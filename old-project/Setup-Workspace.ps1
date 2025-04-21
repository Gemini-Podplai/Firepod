# Setup workspace for secure GitHub commits

# Create secure credentials directory if it doesn't exist
$credentialsDir = ".credentials"
if (-not (Test-Path $credentialsDir)) {
    Write-Host "Creating secure credentials directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $credentialsDir | Out-Null
    Write-Host "Created $credentialsDir directory" -ForegroundColor Green
}

# Check if service account key exists in functions directory
$serviceAccountPath = "functions\service-account-key.json"
if (Test-Path $serviceAccountPath) {
    Write-Host "Moving service account key to secure location..." -ForegroundColor Yellow
    Copy-Item $serviceAccountPath -Destination "$credentialsDir\service-account-key.json"
    Write-Host "Service account key copied to secure location" -ForegroundColor Green
    Write-Host "After verifying your application works with the new location," -ForegroundColor Yellow
    Write-Host "you should consider removing the original file at $serviceAccountPath" -ForegroundColor Yellow
}

# Check for other credential files
Write-Host "Scanning for other credential files..." -ForegroundColor Yellow
$credentialFiles = Get-ChildItem -Path . -Recurse -File -Include "*service-account*.json","*credentials*.json","camera-calibration-beta-*.json" -Exclude ".credentials\*"
foreach ($file in $credentialFiles) {
    Write-Host "Found credential file: $($file.FullName)" -ForegroundColor Yellow
    $destinationPath = Join-Path $credentialsDir $file.Name
    Copy-Item $file.FullName -Destination $destinationPath
    Write-Host "Copied to $destinationPath" -ForegroundColor Green
}

# Update .env file if it exists
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "Checking .env file for credential paths..." -ForegroundColor Yellow
    $envContent = Get-Content $envFile
    $updatedContent = $envContent -replace "GOOGLE_APPLICATION_CREDENTIALS=\.\/functions\/service-account-key\.json", "GOOGLE_APPLICATION_CREDENTIALS=./.credentials/service-account-key.json"
    
    if ($envContent -ne $updatedContent) {
        Write-Host "Updating credential paths in .env file..." -ForegroundColor Yellow
        Set-Content -Path $envFile -Value $updatedContent
        Write-Host "Updated .env file with new credential paths" -ForegroundColor Green
    }
}

# Verify .gitignore includes credential patterns
$gitignoreFile = ".gitignore"
$requiredEntries = @(
    ".credentials/",
    "**/*service-account*.json",
    "**/*credentials*.json",
    "functions/service-account-key.json"
)

if (Test-Path $gitignoreFile) {
    $gitignoreContent = Get-Content $gitignoreFile
    $missingEntries = @()
    
    foreach ($entry in $requiredEntries) {
        if ($gitignoreContent -notcontains $entry) {
            $missingEntries += $entry
        }
    }
    
    if ($missingEntries.Count -gt 0) {
        Write-Host "Adding missing credential patterns to .gitignore..." -ForegroundColor Yellow
        foreach ($entry in $missingEntries) {
            Add-Content -Path $gitignoreFile -Value $entry
        }
        Write-Host "Updated .gitignore with security patterns" -ForegroundColor Green
    }
}

Write-Host "`nWorkspace setup complete!" -ForegroundColor Green
Write-Host "Your credentials are now organized in the .credentials directory" -ForegroundColor Green
Write-Host "and your .gitignore is configured to exclude them from Git." -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Run 'git status' to verify no credential files will be committed" -ForegroundColor White
Write-Host "2. Update your application code to use the new credential locations" -ForegroundColor White
Write-Host "3. Commit your changes with 'git add . && git commit -m \"Organize workspace\"'" -ForegroundColor White
