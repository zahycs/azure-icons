const fs = require('fs');
const path = require('path');

function generateIconIndex() {
  const iconsDir = './Azure_Public_Service_Icons/Icons';
  const outputFile = './icon-viewer/src/iconIndex.json';
  
  const icons = [];
  
  function scanDirectory(dirPath, category = '') {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Use the directory name as category
        scanDirectory(fullPath, item);
      } else if (item.endsWith('.svg')) {
        // Extract icon name from filename
        const fileName = path.basename(item, '.svg');
        const iconName = fileName
          .replace(/^\d+-icon-service-/, '') // Remove number prefix and icon-service-
          .replace(/-/g, ' ') // Replace hyphens with spaces
          .replace(/\b\w/g, l => l.toUpperCase()); // Title case
        
        icons.push({
          id: fileName,
          name: iconName,
          category: category,
          fileName: item,
          path: fullPath,
          relativePath: `icons/${category}/${item}`
        });
      }
    }
  }
  
  console.log('Scanning icons directory...');
  scanDirectory(iconsDir);
  
  console.log(`Found ${icons.length} icons`);
  
  // Sort by name
  icons.sort((a, b) => a.name.localeCompare(b.name));
  
  // Write to JSON file
  fs.writeFileSync(outputFile, JSON.stringify(icons, null, 2));
  console.log(`Icon index written to ${outputFile}`);
  
  // Also create a categories list
  const categories = [...new Set(icons.map(icon => icon.category))].sort();
  fs.writeFileSync('./icon-viewer/src/categories.json', JSON.stringify(categories, null, 2));
  console.log(`Categories written to ./icon-viewer/src/categories.json`);
}

generateIconIndex();
