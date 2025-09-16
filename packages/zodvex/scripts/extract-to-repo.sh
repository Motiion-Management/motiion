#!/bin/bash

# Script to extract zodvex to its own repository while preserving history
# Usage: ./scripts/extract-to-repo.sh [target-directory]

set -e

TARGET_DIR=${1:-"../zodvex-standalone"}
PACKAGE_PATH="packages/zodvex"

echo "🔄 Extracting zodvex to standalone repository..."
echo "Target directory: $TARGET_DIR"

# Check if target directory exists
if [ -d "$TARGET_DIR" ]; then
    echo "❌ Target directory already exists. Please remove it or choose a different location."
    exit 1
fi

# Go to the root of the monorepo
cd "$(git rev-parse --show-toplevel)"

echo "📦 Creating new repository with preserved history..."

# Use git filter-repo (install with: pip install git-filter-repo)
# This preserves the history of just the zodvex package
git clone . "$TARGET_DIR"
cd "$TARGET_DIR"

# Filter to keep only zodvex package history
git filter-repo --path "$PACKAGE_PATH/" --path-rename "$PACKAGE_PATH/:"

echo "✨ Setting up standalone repository structure..."

# Remove monorepo-specific files if they exist
rm -f turbo.json pnpm-workspace.yaml

# Initialize as a new git repo (optional - keeps history)
git remote remove origin 2>/dev/null || true

echo "📝 Updating package.json..."
# Update any monorepo-specific references in package.json
if [ -f "package.json" ]; then
    # This will need manual review for any workspace: references
    echo "Please review package.json for any workspace: protocol references"
fi

echo "✅ Extraction complete!"
echo ""
echo "Next steps:"
echo "1. cd $TARGET_DIR"
echo "2. Review package.json for any remaining monorepo references"
echo "3. Update GitHub URLs in package.json to your new repository"
echo "4. Run 'pnpm install' to set up dependencies"
echo "5. Run 'pnpm test' to verify everything works"
echo "6. Create a new GitHub repository and push:"
echo "   git remote add origin https://github.com/yourusername/zodvex.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "7. Set up NPM publishing:"
echo "   - Create NPM account if needed"
echo "   - Run 'npm login'"
echo "   - Add NPM_TOKEN secret to GitHub repository settings"
echo "   - Publish: 'pnpm publish --access public'"