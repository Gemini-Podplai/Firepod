# This PowerShell script removes a sensitive file from Git history

# The file you want to remove from history
$fileToRemove = "camera-calibration-beta-51a46d9d1055.json"

Write-Host "Removing $fileToRemove from Git history..."

# Check if the file exists in the current directory
$currentDir = Get-Location
if (Test-Path -Path "$currentDir\$fileToRemove") {
    # Remove the file locally first
    Remove-Item -Path "$fileToRemove" -Force
    Write-Host "Removed the file locally."
}

# Create a backup branch
git branch backup-before-filter

# Check if BFG Repo Cleaner is available (alternative to git-filter-repo)
$bfgPath = "$env:USERPROFILE\Downloads\bfg.jar"
if (Test-Path $bfgPath) {
    # Use BFG to remove the file
    java -jar $bfgPath --delete-files $fileToRemove
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
} else {
    # Alternative approach using git filter-branch
    git filter-branch --force --index-filter "git rm --cached --ignore-unmatch $fileToRemove" --prune-empty --tag-name-filter cat -- --all
    git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
}

Write-Host "File removed from history. A backup branch 'backup-before-filter' was created."
Write-Host "To push changes forcefully to your remote repository:"
Write-Host "git push origin --force"
Write-Host ""
Write-Host "IMPORTANT: Any collaborators will need to re-clone the repository or follow special steps."
Write-Host "See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository"
