

# This script removes a sensitive file from Git history

# The file you want to remove from history
FILE_TO_REMOVE="camera-calibration-beta-51a46d9d1055.json"

echo "Removing $FILE_TO_REMOVE from Git history..."

# Check if git-filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
    echo "git-filter-repo is not installed. Please install it with:"
    echo "pip3 install git-filter-repo"
    exit 1
fi

# Create a backup branch
git branch backup-before-filter

# Use git-filter-repo to remove the file from history
git filter-repo --path "$FILE_TO_REMOVE" --invert-paths

echo "File removed from history. A backup branch 'backup-before-filter' was created."
echo "To push changes forcefully to your remote repository:"
echo "git push origin --force"
echo ""
echo "IMPORTANT: Any collaborators will need to re-clone the repository or follow special steps."
echo "See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository"
