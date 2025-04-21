@echo off
echo Removing sensitive files from Git history...

:: Check if there are unstaged changes
git diff --quiet
if %errorlevel% neq 0 (
    echo.
    echo You have unstaged changes in your repository.
    echo You need to either:
    echo   1. Commit your changes: git add . && git commit -m "Save current changes"
    echo   2. Stash your changes: git stash
    echo   3. Discard your changes: git checkout -- .
    echo.
    echo After handling the changes, run this script again.
    echo.
    pause
    exit /b 1
)

:: Set environment variable to squelch the git-filter-branch warning
set FILTER_BRANCH_SQUELCH_WARNING=1

:: Create a backup branch
git branch backup-before-cleanup

echo.
echo Starting to remove service-account-key.json from history...
:: Remove the specific files from Git history
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch functions/service-account-key.json" --prune-empty --tag-name-filter cat -- --all

echo.
echo Starting to remove camera-calibration-beta json file from history...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch camera-calibration-beta-51a46d9d1055.json" --prune-empty --tag-name-filter cat -- --all

echo.
echo Starting to remove pasted credential text file from history...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch attached_assets/Pasted--type-service-account-project-id-camera-calibration-beta-private-key-id-91-1744072004461.txt" --prune-empty --tag-name-filter cat -- --all

echo.
echo Cleaning up refs...
:: Clean up the refs
git for-each-ref --format="delete %%^(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now

echo.
echo Files removed from Git history.
echo.
echo Next steps:
echo 1. Force push your changes: git push origin --force
echo 2. IMPORTANT: Rotate your service account credentials immediately!
echo    - Go to Google Cloud Console
echo    - Navigate to IAM & Admin > Service Accounts
echo    - Find firebase-adminsdk-fbsvc@camera-calibration-beta.iam.gserviceaccount.com
echo    - Create a new key and delete the old one
echo.
pause
