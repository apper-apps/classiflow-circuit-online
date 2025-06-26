import { useState } from 'react';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

const SearchBar = ({ 
  placeholder = "Search listings...",
  onSearch,
  className = '',
  showFilters = false
}) => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon="Search"
            iconPosition="left"
          />
        </div>
        <Button type="submit" icon="Search">
          Search
        </Button>
        {showFilters && (
          <Button
            type="button"
            variant="outline"
            icon="Filter"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Filters
          </Button>
        )}
      </form>

      {showAdvanced && showFilters && (
        <div className="p-4 bg-surface-50 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Min Price"
              type="number"
              placeholder="0"
              icon="DollarSign"
            />
            <Input
              label="Max Price"
              type="number"
              placeholder="Any"
              icon="DollarSign"
            />
            <Input
              label="Location"
              placeholder="City, State"
              icon="MapPin"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Apply Filters
            </Button>
            <Button size="sm" variant="ghost">
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;