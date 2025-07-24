import React from 'react';
import { IconGridProps } from '../types';
import IconCard from './IconCard';
import './IconGrid.css';

const IconGrid: React.FC<IconGridProps> = ({ icons, onIconDoubleClick, transparentBackground }) => {
  console.log('IconGrid received icons:', icons.length);
  
  if (icons.length === 0) {
    return (
      <div className="no-results">
        <h3>No icons found</h3>
        <p>Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="icon-grid">
      {icons.map((icon) => (
        <IconCard
          key={icon.id}
          icon={icon}
          onDoubleClick={(icon, event) => onIconDoubleClick(icon, event)}
          transparentBackground={transparentBackground}
        />
      ))}
    </div>
  );
};

export default IconGrid;
