import React from 'react';
import { IconCardProps } from '../types';
import './IconCard.css';

const IconCard: React.FC<IconCardProps> = ({ icon, onDoubleClick, transparentBackground }) => {
  const iconPath = `/icons/${icon.category}/${icon.fileName}`;

  return (
    <div 
      className="icon-card"
      onDoubleClick={(e) => onDoubleClick(icon, e)}
      title={`Double-click to download | Right-click and "Copy Image" to copy`}
    >
      <div className={`icon-image-container ${transparentBackground ? 'transparent-bg' : ''}`}>
        <img 
          src={iconPath} 
          alt={icon.name}
          className="icon-image"
          onError={(e) => {
            console.error(`Failed to load icon: ${iconPath}`);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <div className="icon-info">
        <h3 className="icon-name">{icon.name}</h3>
        <p className="icon-category">{icon.category}</p>
      </div>
    </div>
  );
};

export default IconCard;
