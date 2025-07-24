import React from 'react';
import './ExportButton.css';
import { Icon } from '../types';
import { DrawIoExporter, ExportProgress } from '../utils/drawioExporter';

interface ExportButtonProps {
  icons: Icon[];
  onProgress: (message: string) => void;
  className?: string;
  iconsBaseUrl: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  icons, 
  onProgress, 
  className = 'export-button',
  iconsBaseUrl
}) => {
  const handleExport = async () => {
    try {
      await DrawIoExporter.exportToDrawIo(icons, iconsBaseUrl, (progress: ExportProgress) => {
        onProgress(progress.message);
      });
    } catch (error) {
      onProgress('Export failed - please try again');
    }
  };

  return (
    <button 
      className={className}
      onClick={handleExport}
      title="Export all icons as a Draw.io library file"
    >
      Export for Draw.io
    </button>
  );
};

export default ExportButton;
