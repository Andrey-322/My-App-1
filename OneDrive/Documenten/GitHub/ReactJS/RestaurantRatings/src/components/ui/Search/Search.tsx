import { ChangeEvent } from 'react';
import './Search.css';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Search({
  value,
  onChange,
  placeholder = 'Search for restaurants',
  className = '',
}: SearchProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`search-container ${className}`}>
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}

