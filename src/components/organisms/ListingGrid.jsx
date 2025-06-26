import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import ListingCard from '@/components/molecules/ListingCard';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/atoms/ErrorState';
import EmptyState from '@/components/atoms/EmptyState';
import Button from '@/components/atoms/Button';
import listingService from '@/services/api/listingService';

const ListingGrid = ({ 
  categoryId, 
  searchQuery,
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true 
}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadListings();
  }, [categoryId, searchQuery]);

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        status: 'active'
      };
      
      if (categoryId) {
        filters.categoryId = categoryId;
      }
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      const result = await listingService.getAll(filters);
      setListings(result);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {showViewToggle && (
          <div className="flex items-center justify-between">
            <div className="h-8 bg-surface-200 rounded w-48 animate-pulse" />
            <div className="h-10 bg-surface-200 rounded w-24 animate-pulse" />
          </div>
        )}
        <div className={`
          grid gap-6
          ${viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
          }
        `}>
          <SkeletonLoader count={6} height="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadListings}
        className="py-12"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-900">
            {categoryId ? 'Category Listings' : 'All Listings'}
          </h2>
          <p className="text-surface-600">
            {listings.length} listing{listings.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {showViewToggle && (
          <div className="flex items-center gap-2 bg-surface-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={`
                p-2 rounded transition-colors
                ${viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-surface-600 hover:text-surface-900'
                }
              `}
            >
              <ApperIcon name="Grid3X3" size={16} />
            </button>
            <button
              onClick={() => onViewModeChange?.('list')}
              className={`
                p-2 rounded transition-colors
                ${viewMode === 'list' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-surface-600 hover:text-surface-900'
                }
              `}
            >
              <ApperIcon name="List" size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <EmptyState
          title="No listings found"
          description={searchQuery 
            ? "Try adjusting your search terms or browse different categories" 
            : "Be the first to post a listing in this category"
          }
          actionLabel="Post Your Listing"
          onAction={() => window.location.href = '/post'}
          icon="Package"
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`
            grid gap-6
            ${viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
            }
          `}
        >
          {listings.map((listing) => (
            <motion.div key={listing.Id} variants={itemVariants}>
              <ListingCard 
                listing={listing}
                className={viewMode === 'list' ? 'max-w-none' : ''}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ListingGrid;