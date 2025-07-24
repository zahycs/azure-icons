import React from 'react';
import { SearchBarProps } from '../types';
import './SearchBar.css';

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories
}) => {
  return (
    <div className="search-bar">
      <div className="search-controls">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search icons by name or category..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
            autoComplete="off"
          />
        </div>
        
        <div className="category-filter-container">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
