#!/bin/bash

# Deploy Azure Icons to GitHub Pages
# This script builds and deploys the React app to GitHub Pages

set -e  # Exit on any error

echo "🚀 Deploying Azure Icons to GitHub Pages..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the icon-viewer directory."
    exit 1
fi

# Check if gh-pages is installed
if ! npm list gh-pages --depth=0 &>/dev/null; then
    echo "📦 Installing gh-pages..."
    npm install --save-dev gh-pages
fi

echo "🏗️  Building the application..."
npm run build

echo "📤 Deploying to GitHub Pages..."
npm run deploy

echo "✅ Deployment completed successfully!"
echo "🌐 Your app will be available at: https://zahycs.github.io/azure-icons"
echo "⏳ Note: It may take a few minutes for changes to appear on GitHub Pages."
