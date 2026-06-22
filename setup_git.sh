#!/bin/bash

# Exit on error
set -e

echo "Initializing local Git repository..."
git init

# Add all files (respecting .gitignore)
echo "Adding files to git staging..."
git add .

# Commit files
echo "Creating initial commit..."
git commit -m "Initial commit"
git branch -M main

echo ""
echo "=========================================================="
echo "🎉 Local repository initialized and initial commit created!"
echo "=========================================================="
echo ""
echo "To create the GitHub repository and push your code, choose one of these options:"
echo ""
echo "👉 Option A: If you have GitHub CLI ('gh') installed and logged in:"
echo "   Run the following command:"
echo "   gh repo create \"CS50P-Project\" --public --source=. --remote=origin --push"
echo ""
echo "👉 Option B: Via the GitHub Website:"
echo "   1. Go to https://github.com/new and create a repository named 'CS50P-Project'"
echo "      (Make sure NOT to check 'Add a README file', 'Add .gitignore', or 'Choose a license')"
echo "   2. Copy the repository URL and run:"
echo "      git remote add origin <YOUR_GITHUB_REPO_URL>"
echo "      git push -u origin main"
echo ""
