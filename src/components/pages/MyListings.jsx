import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import ListingCard from '@/components/molecules/ListingCard';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/atoms/ErrorState';
import EmptyState from '@/components/atoms/EmptyState';
import Badge from '@/components/atoms/Badge';
import listingService from '@/services/api/listingService';

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      // In real app, filter by current user ID
      const result = await listingService.getAll({ userId: 'current-user' });
      setListings(result);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing) => {
    // In real app, navigate to edit form with listing data
    toast.info('Edit functionality coming soon!');
  };

  const handleDelete = (listing) => {
    setSelectedListing(listing);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedListing) return;
    
    try {
      await listingService.delete(selectedListing.Id);
      setListings(prev => prev.filter(item => item.Id !== selectedListing.Id));
      toast.success('Listing deleted successfully');
    } catch (error) {
      toast.error('Failed to delete listing');
    } finally {
      setShowDeleteModal(false);
      setSelectedListing(null);
    }
  };

  const getFilteredListings = () => {
    switch (filter) {
      case 'active':
        return listings.filter(listing => listing.status === 'active');
      case 'pending':
        return listings.filter(listing => listing.status === 'pending');
      case 'expired':
        return listings.filter(listing => new Date(listing.expiresAt) < new Date());
      default:
        return listings;
    }
  };

  const getStatusBadge = (listing) => {
    const isExpired = new Date(listing.expiresAt) < new Date();
    
    if (isExpired) {
      return <Badge variant="error" size="sm">Expired</Badge>;
    }
    
    switch (listing.status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      default:
        return <Badge variant="default" size="sm">{listing.status}</Badge>;
    }
  };

  const filteredListings = getFilteredListings();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-surface-200 rounded w-48 animate-pulse" />
          <div className="h-10 bg-surface-200 rounded w-32 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        className="p-6"
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Listings</h1>
          <p className="text-surface-600">
            Manage and track your marketplace listings
          </p>
        </div>
        <Button
          onClick={() => navigate('/post')}
          icon="Plus"
          size="lg"
        >
          Create New Listing
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Listings', count: listings.length },
          { key: 'active', label: 'Active', count: listings.filter(l => l.status === 'active').length },
          { key: 'pending', label: 'Pending', count: listings.filter(l => l.status === 'pending').length },
          { key: 'expired', label: 'Expired', count: listings.filter(l => new Date(l.expiresAt) < new Date()).length }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors
              ${filter === filterOption.key
                ? 'bg-primary text-white'
                : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
              }
            `}
          >
            {filterOption.label}
            <span className={`
              px-1.5 py-0.5 rounded-full text-xs
              ${filter === filterOption.key
                ? 'bg-white/20 text-white'
                : 'bg-surface-200 text-surface-600'
              }
            `}>
              {filterOption.count}
            </span>
          </button>
        ))}
      </div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <EmptyState
          title={filter === 'all' ? "No listings yet" : `No ${filter} listings`}
          description={filter === 'all' 
            ? "Start by creating your first listing to reach potential buyers"
            : `You don't have any ${filter} listings at the moment`
          }
          actionLabel="Create Your First Listing"
          onAction={() => navigate('/post')}
          icon="FileText"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredListings.map((listing) => (
            <motion.div
              key={listing.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                {getStatusBadge(listing)}
              </div>
              
              <ListingCard
                listing={listing}
                showActions={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              
              {/* Analytics Preview */}
              <div className="mt-3 p-3 bg-surface-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-surface-600">
                    <ApperIcon name="Eye" size={14} />
                    <span>{listing.views} views</span>
                  </div>
                  <div className="flex items-center gap-1 text-surface-600">
                    <ApperIcon name="Calendar" size={14} />
                    <span>
                      {Math.ceil((new Date(listing.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))} days left
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <ApperIcon name="Trash2" size={20} className="text-error" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Delete Listing</h3>
                <p className="text-sm text-surface-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-surface-700 mb-6">
              Are you sure you want to delete "{selectedListing?.title}"?
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyListings;