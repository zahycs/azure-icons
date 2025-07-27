# Azure Icons

Microsoft Azure service icons with an interactive browser for easy searching and downloading.

## Features

- **Icon Browser**: Interactive React app to browse 683+ Azure service icons
- **Search & Filter**: Find icons by name or category
- **Download**: Double-click to download icons as PNG or SVG
- **Copy**: Right-click to copy images directly from browser

## Usage

### Local Development

1. Open the icon browser: `cd icon-viewer && npm start`
2. Search for icons or browse by category
3. Double-click to download or right-click to copy

### Scripts

The project includes automation scripts in the `scripts/` folder:

- **Update Icons**: `node scripts/update-icons.js` - Downloads latest icons from Microsoft
- **Generate Index**: `node scripts/generate-icon-index.js` - Regenerates icon metadata

See [scripts/README.md](scripts/README.md) for detailed documentation.

### Docker

Run with Docker:

```bash
# Build and run with docker-compose
docker-compose up -d

# Or build and run manually
docker build -t azure-icons .
docker run -p 8456:80 azure-icons
```

Access the app at <http://localhost:8456>

## Live Demo

🌐 **View the live app:** [https://zahycs.github.io/azure-icons](https://zahycs.github.io/azure-icons)

The app is automatically deployed to GitHub Pages whenever changes are made to the icons or the React app.

## Deployment

### Automatic Deployment

The project includes GitHub Actions workflows for automated deployment:

1. **Icon Updates** (`.github/workflows/update-azure-icons.yml`):
   - Runs weekly to check for new Azure icons from Microsoft
   - Downloads and compares with current icons
   - Updates the repository and triggers deployment if changes are detected

2. **GitHub Pages Deployment** (`.github/workflows/deploy-gh-pages.yml`):
   - Automatically deploys to GitHub Pages on pushes to main branch
   - Rebuilds the icon index and React app
   - Serves the app at the GitHub Pages URL

### Manual Deployment

To deploy manually from your local machine:

```bash
cd icon-viewer
npm install
npm run deploy
```

This will build the app and deploy it to the `gh-pages` branch.

## License

Icons provided by Microsoft Corporation. See [LICENSE](LICENSE) for terms.
