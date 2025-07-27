export interface Icon {
  id: string;
  name: string;
  category: string;
  fileName: string;
  relativePath: string;
}

export interface IconGridProps {
  icons: Icon[];
  onIconDoubleClick: (icon: Icon, event?: React.MouseEvent) => void;
  transparentBackground: boolean;
  iconsBaseUrl: string;
}

export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export interface IconCardProps {
  icon: Icon;
  onDoubleClick: (icon: Icon, event?: React.MouseEvent) => void;
  transparentBackground: boolean;
  iconsBaseUrl: string;
}
