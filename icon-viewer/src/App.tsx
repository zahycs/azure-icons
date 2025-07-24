import React, { useState, useMemo } from 'react';
import './App.css';
import { Icon } from './types';
import IconGrid from './components/IconGrid';
import SearchBar from './components/SearchBar';
import ExportButton from './components/ExportButton';
import iconIndex from './iconIndex.json';
import categories from './categories.json';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [downloadAsPng, setDownloadAsPng] = useState(false);
  const [transparentBackground, setTransparentBackground] = useState(false);

  const icons: Icon[] = iconIndex;

  const filteredIcons = useMemo(() => {
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();
    
    console.log('=== FILTERING DEBUG ===');
    console.log('Search term:', `"${trimmedSearchTerm}"`);
    console.log('Selected category:', `"${selectedCategory}"`);
    console.log('Total icons:', icons.length);
    
    const filtered = icons.filter(icon => {
      // If no search term, just filter by category
      if (!trimmedSearchTerm) {
        const categoryMatch = selectedCategory === '' || icon.category === selectedCategory;
        return categoryMatch;
      }
      
      // Search in name, category, and file name
      const matchesSearch = 
        icon.name.toLowerCase().includes(trimmedSearchTerm) ||
        icon.category.toLowerCase().includes(trimmedSearchTerm) ||
        icon.fileName.toLowerCase().includes(trimmedSearchTerm);
      
      const matchesCategory = selectedCategory === '' || icon.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    console.log('Filtered icons:', filtered.length);
    console.log('First 3 filtered icons:', filtered.slice(0, 3).map(i => i.name));
    console.log('=======================');
    
    return filtered;
  }, [icons, searchTerm, selectedCategory]);

  const handleIconDoubleClick = async (icon: Icon, event?: React.MouseEvent) => {
    try {
      const iconPath = `/icons/${icon.category}/${icon.fileName}`;
      
      // Fetch the SVG content
      const response = await fetch(iconPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.status}`);
      }
      
      const svgContent = await response.text();
      
      if (downloadAsPng) {
        // Convert to PNG and download
        await downloadAsPngImage(icon, svgContent);
      } else {
        // Download as SVG
        await downloadAsSvg(icon, svgContent);
      }
      
    } catch (err) {
      console.error('Failed to download icon:', err);
      setCopyMessage('Download failed');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  const downloadAsSvg = async (icon: Icon, svgContent: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${icon.name.replace(/[^a-zA-Z0-9]/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setCopyMessage(`Downloaded: ${icon.name}.svg`);
    setTimeout(() => setCopyMessage(''), 3000);
  };

  const downloadAsPngImage = async (icon: Icon, svgContent: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 150; // Fixed size for downloads
    canvas.width = size;
    canvas.height = size;
    
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Set background
      if (!transparentBackground) {
        ctx!.fillStyle = 'white';
        ctx!.fillRect(0, 0, size, size);
      }
      
      // Draw the SVG image
      ctx!.drawImage(img, 0, 0, size, size);
      
      // Download as PNG
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `${icon.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          
          setCopyMessage(`Downloaded: ${icon.name}.png`);
          setTimeout(() => setCopyMessage(''), 3000);
        }
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    
    img.src = url;
  };

  const handleDownloadAsPngChange = (checked: boolean) => {
    setDownloadAsPng(checked);
    if (!checked) {
      setTransparentBackground(false);
    }
  };

  const handleExportProgress = (message: string) => {
    setCopyMessage(message);
    // Auto-clear success messages after 4 seconds, error messages after 3 seconds
    const timeout = message.includes('exported!') ? 4000 : 3000;
    setTimeout(() => setCopyMessage(''), timeout);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Azure Icons Browser</h1>
        <p>Browse and copy Azure service icons</p>
        {copyMessage && (
          <div className="copy-message">
            {copyMessage}
          </div>
        )}
      </header>

      <main className="App-main">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />
        
        <div className="settings-panel">
          <div className="settings-group">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={downloadAsPng}
                onChange={(e) => handleDownloadAsPngChange(e.target.checked)}
              />
              <span>Download as PNG (instead of SVG)</span>
            </label>
            <label className={`setting-item ${!downloadAsPng ? 'disabled' : ''}`}>
              <input
                type="checkbox"
                checked={transparentBackground}
                disabled={!downloadAsPng}
                onChange={(e) => setTransparentBackground(e.target.checked)}
              />
              <span>Transparent background (PNG only)</span>
            </label>
          </div>
          
          <div className="settings-group">
            <ExportButton 
              icons={icons}
              onProgress={handleExportProgress}
            />
          </div>
        </div>
        
        <div className="results-info">
          Showing {filteredIcons.length} of {icons.length} icons
        </div>

        <div className="copy-instructions">
          <strong>Usage:</strong> Double-click to download | Right-click and "Copy Image" to copy to clipboard
        </div>

        <IconGrid
          key={`${searchTerm}-${selectedCategory}-${filteredIcons.length}`}
          icons={filteredIcons}
          onIconDoubleClick={handleIconDoubleClick}
          transparentBackground={transparentBackground}
        />
      </main>
    </div>
  );
}

export default App;
