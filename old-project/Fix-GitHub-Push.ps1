# HOW TO RUN THIS SCRIPT:
# 1. Right-click this file in Windows Explorer
# 2. Select "Run with PowerShell"
# 
# If that doesn't work, follow these steps:
# 1. Press Windows+X and select "Windows PowerShell" or "Terminal"
# 2. Navigate to your project folder by typing:
#    cd "c:\Users\woody\podplai-studio"
# 3. Run the script by typing:
#    .\Fix-GitHub-Push.ps1

Write-Host "This script will help fix your GitHub push protection issue" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------" -ForegroundColor Cyan

# Step 1: Make sure the sensitive file is deleted
$filePath = "attached_assets/Pasted--type-service-account-project-id-camera-calibration-beta-private-key-id-91-1744072004461.txt"
if (Test-Path $filePath) {
    Write-Host "Removing sensitive file..." -ForegroundColor Yellow
    Remove-Item -Path $filePath -Force
    Write-Host "File removed." -ForegroundColor Green
} else {
    Write-Host "Sensitive file not found in working directory. Good!" -ForegroundColor Green
}

# Step 2: Add the file path to .gitignore
Write-Host "Updating .gitignore file..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content -Path ".gitignore"
    if (-not ($gitignoreContent -match [regex]::Escape($filePath))) {
        $filePath | Out-File -FilePath ".gitignore" -Append
        Write-Host "Added file to .gitignore." -ForegroundColor Green
    } else {
        Write-Host "File already in .gitignore. Good!" -ForegroundColor Green
    }
} else {
    $filePath | Out-File -FilePath ".gitignore"
    Write-Host "Created .gitignore file with sensitive file excluded." -ForegroundColor Green
}

# Step 3: Add all changes and commit
Write-Host "Would you like to commit these changes? (Y/N)" -ForegroundColor Cyan
$commitAnswer = Read-Host
if ($commitAnswer -eq "Y" -or $commitAnswer -eq "y") {
    Write-Host "Adding and committing changes..." -ForegroundColor Yellow
    git add .gitignore
    git commit -m "Remove sensitive files and update gitignore"
    Write-Host "Changes committed." -ForegroundColor Green
}

# Step 4: Offer to use GitHub's unblock option
Write-Host "`nSince GitHub has detected the secret, you have two options:" -ForegroundColor Cyan
Write-Host "1. Go to this URL to unblock the secret:" -ForegroundColor Yellow
Write-Host "   https://github.com/daddyholnes/podplai-studio/security/secret-scanning/unblock-secret/2vSE0onfgX1gvZbzfVMWa9NSGkF" -ForegroundColor White
Write-Host "2. Or we can try to remove it from Git history (more complex)" -ForegroundColor Yellow

Write-Host "`nWhich option would you like to try? (1 or 2)" -ForegroundColor Cyan
$option = Read-Host

if ($option -eq "1") {
    Write-Host "`nPlease follow these steps:" -ForegroundColor Cyan
    Write-Host "1. Open this URL in your browser:" -ForegroundColor Yellow
    Write-Host "   https://github.com/daddyholnes/podplai-studio/security/secret-scanning/unblock-secret/2vSE0onfgX1gvZbzfVMWa9NSGkF" -ForegroundColor White
    Write-Host "2. Select a reason (like 'Test credential')" -ForegroundColor Yellow
    Write-Host "3. Click 'Unblock secret'" -ForegroundColor Yellow
    Write-Host "4. Come back here when done" -ForegroundColor Yellow
    
    Write-Host "`nHave you completed these steps? (Y/N)" -ForegroundColor Cyan
    $completed = Read-Host
    if ($completed -eq "Y" -or $completed -eq "y") {
        Write-Host "Great! Now let's try to push again..." -ForegroundColor Green
        git push origin main
    }
} elseif ($option -eq "2") {
    Write-Host "`nThis will attempt to remove the sensitive file from Git history." -ForegroundColor Yellow
    Write-Host "WARNING: This is a complex operation that will rewrite history." -ForegroundColor Red
    Write-Host "Are you sure you want to continue? (Y/N)" -ForegroundColor Red
    $confirm = Read-Host
    
    if ($confirm -eq "Y" -or $confirm -eq "y") {
        Write-Host "Creating backup branch..." -ForegroundColor Yellow
        git branch backup-before-cleanup
        Write-Host "Backup created as 'backup-before-cleanup'" -ForegroundColor Green
        
        Write-Host "Removing file from Git history (this may take a while)..." -ForegroundColor Yellow
        git filter-branch --force --index-filter "git rm --cached --ignore-unmatch $filePath" --prune-empty --tag-name-filter cat -- --all
        
        Write-Host "Cleaning up..." -ForegroundColor Yellow
        git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
        git reflog expire --expire=now --all
        git gc --prune=now --aggressive
        
        Write-Host "Force pushing changes..." -ForegroundColor Yellow
        git push origin main --force
    }
}

Write-Host "`nScript completed! If you still have issues, you may need to:" -ForegroundColor Cyan
Write-Host "1. Rotate your Google Cloud credentials (create new ones)" -ForegroundColor Yellow
Write-Host "2. Contact GitHub support if the push is still blocked" -ForegroundColor Yellow
