import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import CategorySidebar from '@/components/organisms/CategorySidebar';
import ListingGrid from '@/components/organisms/ListingGrid';
import SearchBar from '@/components/molecules/SearchBar';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    // Initialize from URL params
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategoryId(parseInt(categoryParam, 10));
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const handleCategorySelect = (category) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (category) {
      setSelectedCategoryId(category.Id);
      newParams.set('category', category.Id.toString());
    } else {
      setSelectedCategoryId(null);
      newParams.delete('category');
    }
    
    setSearchParams(newParams);
  };

  const handleSearch = (query) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (query.trim()) {
      setSearchQuery(query);
      newParams.set('search', query);
    } else {
      setSearchQuery('');
      newParams.delete('search');
    }
    
    setSearchParams(newParams);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 bg-white border-r border-surface-200 overflow-y-auto flex-shrink-0"
      >
        <div className="p-6">
          <CategorySidebar
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategoryId}
          />
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Search Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <div>
              <h1 className="text-2xl font-bold text-surface-900">
                Browse Listings
              </h1>
              <p className="text-surface-600">
                Find exactly what you're looking for in our marketplace
              </p>
            </div>
            
            <SearchBar
              placeholder="Search listings..."
              onSearch={handleSearch}
              showFilters={true}
              className="max-w-2xl"
            />
          </motion.div>

          {/* Listings Grid */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ListingGrid
              categoryId={selectedCategoryId}
              searchQuery={searchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showViewToggle={true}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Browse;