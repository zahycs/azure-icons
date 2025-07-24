import { Icon } from '../types';

export interface DrawIoItem {
  data: string;
  w: number;
  h: number;
  title: string;
  aspect: "fixed";
}

export interface ExportProgress {
  message: string;
  isComplete: boolean;
  iconCount?: number;
}

export class DrawIoExporter {
  /**
   * Exports all icons to a Draw.io library XML file
   * @param icons Array of icons to export
   * @param onProgress Callback function to report progress
   * @returns Promise that resolves when export is complete
   */
  static async exportToDrawIo(
    icons: Icon[],
    onProgress: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress({ message: 'Preparing Draw.io export...', isComplete: false });
      
      const drawIoItems: DrawIoItem[] = [];
      
      // Process icons in batches to avoid overwhelming the browser
      const batchSize = 50;
      for (let i = 0; i < icons.length; i += batchSize) {
        const batch = icons.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (icon) => {
          try {
            const iconPath = `/icons/${icon.category}/${icon.fileName}`;
            const response = await fetch(iconPath);
            
            if (!response.ok) {
              console.warn(`Failed to fetch ${icon.fileName}: ${response.status}`);
              return null;
            }
            
            const svgContent = await response.text();
            
            // Parse SVG to get dimensions
            const dimensions = this.parseSvgDimensions(svgContent);
            
            // Convert SVG to base64
            const base64 = btoa(unescape(encodeURIComponent(svgContent)));
            
            return {
              data: `data:image/svg+xml;base64,${base64}`,
              w: dimensions.width,
              h: dimensions.height,
              title: icon.name,
              aspect: "fixed" as const
            };
          } catch (error) {
            console.warn(`Error processing ${icon.fileName}:`, error);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        const validItems = batchResults.filter((item): item is DrawIoItem => item !== null);
        drawIoItems.push(...validItems);
        
        // Update progress
        const processed = Math.min(i + batchSize, icons.length);
        onProgress({
          message: `Processing icons... ${processed}/${icons.length}`,
          isComplete: false
        });
        
        // Small delay to prevent UI freezing
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Create the XML content
      const xmlContent = `<mxlibrary>${JSON.stringify(drawIoItems, null, 2)}</mxlibrary>`;
      
      // Download the file
      this.downloadFile(xmlContent, 'azure-icons-drawio.xml', 'application/xml');
      
      onProgress({
        message: `Draw.io library exported! (${drawIoItems.length} icons)`,
        isComplete: true,
        iconCount: drawIoItems.length
      });
      
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Export failed - please try again');
    }
  }

  /**
   * Parses SVG content to extract width and height dimensions
   * @param svgContent The SVG content as string
   * @returns Object with width and height
   */
  private static parseSvgDimensions(svgContent: string): { width: number; height: number } {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    
    let width = 18;
    let height = 18;
    
    if (svgElement) {
      // Try to get width and height from attributes
      const widthAttr = svgElement.getAttribute('width');
      const heightAttr = svgElement.getAttribute('height');
      
      if (widthAttr && heightAttr) {
        width = parseFloat(widthAttr) || 18;
        height = parseFloat(heightAttr) || 18;
      } else {
        // Try to get from viewBox
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
          const values = viewBox.split(' ').map(parseFloat);
          if (values.length === 4) {
            width = values[2] || 18;
            height = values[3] || 18;
          }
        }
      }
    }
    
    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * Downloads a file with the given content
   * @param content File content
   * @param filename Filename for download
   * @param mimeType MIME type of the file
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
