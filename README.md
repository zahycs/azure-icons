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

## License

Icons provided by Microsoft Corporation. See [LICENSE](LICENSE) for terms.
