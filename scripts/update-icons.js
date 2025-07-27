#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const crypto = require('crypto');

class AzureIconsUpdater {
  constructor() {
    this.config = {
      downloadUrl: 'https://arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V21.zip',
      tempDir: path.join(__dirname, '../temp'),
      zipFile: path.join(__dirname, '../temp/Azure_Public_Service_Icons_V21.zip'),
      extractedDir: path.join(__dirname, '../temp/Azure_Public_Service_Icons'),
      targetDir: path.join(__dirname, '../Azure_Public_Service_Icons'),
      backupDir: path.join(__dirname, '../Azure_Public_Service_Icons_backup'),
      iconViewerDir: path.join(__dirname, '../icon-viewer'),
      generateScriptPath: path.join(__dirname, './generate-icon-index.js'),
      minIconCount: 100
    };
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  error(message) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
  }

  async downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destination);
      
      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          return this.downloadFile(response.headers.location, destination)
            .then(resolve)
            .catch(reject);
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve();
        });
        
        file.on('error', reject);
      }).on('error', reject);
    });
  }

  executeCommand(command, options = {}) {
    try {
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options 
      });
      return result;
    } catch (error) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
  }

  createDirectoryIfNotExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  removeDirectoryIfExists(dir) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  countSvgFiles(directory) {
    if (!fs.existsSync(directory)) return 0;
    
    const files = this.executeCommand(`find "${directory}" -name "*.svg" | wc -l`, { silent: true });
    return parseInt(files.trim());
  }

  generateChecksum(directory) {
    if (!fs.existsSync(directory)) return '';
    
    const checksums = this.executeCommand(
      `cd "${directory}" && find . -name "*.svg" -exec md5sum {} \\; | sort`,
      { silent: true }
    );
    return crypto.createHash('md5').update(checksums).digest('hex');
  }

  async downloadIcons() {
    this.log('Creating temp directory...');
    this.createDirectoryIfNotExists(this.config.tempDir);

    this.log('Downloading Azure icons from Microsoft...');
    await this.downloadFile(this.config.downloadUrl, this.config.zipFile);

    // Verify download
    if (!fs.existsSync(this.config.zipFile)) {
      throw new Error('Failed to download Azure icons');
    }

    const stats = fs.statSync(this.config.zipFile);
    if (stats.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    this.log(`Download completed successfully (${Math.round(stats.size / 1024)} KB)`);
  }

  extractIcons() {
    this.log('Extracting Azure icons...');
    
    this.executeCommand(`cd "${this.config.tempDir}" && unzip -q Azure_Public_Service_Icons_V21.zip`);

    // Find extracted folder
    const items = fs.readdirSync(this.config.tempDir);
    const extractedFolder = items.find(item => 
      item.includes('Azure') && 
      fs.statSync(path.join(this.config.tempDir, item)).isDirectory()
    );

    if (!extractedFolder) {
      throw new Error('Could not find extracted Azure icons folder');
    }

    const extractedPath = path.join(this.config.tempDir, extractedFolder);
    const iconCount = this.countSvgFiles(extractedPath);
    
    this.log(`Found ${iconCount} SVG icons in extracted folder`);

    if (iconCount < this.config.minIconCount) {
      throw new Error(`Extracted folder contains too few icons (${iconCount}). Expected at least ${this.config.minIconCount}.`);
    }

    // Rename to standardized name
    if (extractedFolder !== 'Azure_Public_Service_Icons') {
      fs.renameSync(extractedPath, this.config.extractedDir);
    }

    this.log('Extraction completed successfully');
    return iconCount;
  }

  compareIcons() {
    this.log('Comparing with current icons...');

    const currentCount = this.countSvgFiles(this.config.targetDir);
    const newCount = this.countSvgFiles(this.config.extractedDir);

    this.log(`Current icons: ${currentCount}`);
    this.log(`New icons: ${newCount}`);

    let changesDetected = false;

    if (!fs.existsSync(this.config.targetDir)) {
      this.log('No existing Azure_Public_Service_Icons folder found. This will be a new addition.');
      changesDetected = true;
    } else if (currentCount !== newCount) {
      this.log(`Icon count changed: ${currentCount} -> ${newCount}`);
      changesDetected = true;
    } else {
      // Compare checksums
      this.log('Comparing file contents...');
      
      const currentChecksum = this.generateChecksum(this.config.targetDir);
      const newChecksum = this.generateChecksum(this.config.extractedDir);

      if (currentChecksum !== newChecksum) {
        this.log('Icon contents have changed');
        changesDetected = true;
      } else {
        this.log('No changes detected in icon contents');
      }
    }

    return {
      changesDetected,
      currentCount,
      newCount
    };
  }

  updateIcons() {
    this.log('Updating Azure icons in root directory...');

    // Backup current icons if they exist
    if (fs.existsSync(this.config.targetDir)) {
      this.log('Backing up current Azure_Public_Service_Icons...');
      this.removeDirectoryIfExists(this.config.backupDir);
      fs.renameSync(this.config.targetDir, this.config.backupDir);
    }

    // Move new icons to root directory
    fs.renameSync(this.config.extractedDir, this.config.targetDir);
    
    this.log('Azure_Public_Service_Icons updated successfully in root directory');
  }

  regenerateIconIndex() {
    this.log('Regenerating icon index...');

    // Install dependencies
    this.executeCommand('npm ci', { cwd: this.config.iconViewerDir });

    // Run icon index generation script
    this.executeCommand(`node ${this.config.generateScriptPath}`);

    this.log('Icon index regenerated');
  }

  cleanup() {
    this.log('Cleaning up temporary files...');
    this.removeDirectoryIfExists(this.config.tempDir);
    this.removeDirectoryIfExists(this.config.backupDir);
    
    // Remove any checksum files
    ['current_checksums.txt', 'new_checksums.txt'].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    this.log('Cleanup completed');
  }

  async run() {
    try {
      this.log('Starting Azure Icons update process...');

      // Download and extract
      await this.downloadIcons();
      const newIconCount = this.extractIcons();

      // Compare changes
      const comparison = this.compareIcons();

      if (!comparison.changesDetected) {
        this.log('No changes detected - icons are up to date');
        this.cleanup();
        return {
          success: true,
          changesDetected: false,
          currentCount: comparison.currentCount,
          newCount: comparison.newCount
        };
      }

      // Update icons and regenerate index
      this.updateIcons();
      this.regenerateIconIndex();

      // Clean up before returning (but not the updated files)
      this.removeDirectoryIfExists(this.config.tempDir);
      this.removeDirectoryIfExists(this.config.backupDir);

      this.log('Azure Icons update completed successfully!');
      
      return {
        success: true,
        changesDetected: true,
        currentCount: comparison.currentCount,
        newCount: comparison.newCount
      };

    } catch (error) {
      this.error(error.message);
      this.cleanup();
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const updater = new AzureIconsUpdater();
  
  updater.run()
    .then(result => {
      console.log('\n✅ Update process completed:');
      console.log(`   Changes detected: ${result.changesDetected}`);
      console.log(`   Icon count: ${result.currentCount} -> ${result.newCount}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Update process failed:', error.message);
      process.exit(1);
    });
}

module.exports = AzureIconsUpdater;
