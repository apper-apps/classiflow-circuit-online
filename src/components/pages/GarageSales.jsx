import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import MapDisplay from '@/components/molecules/MapDisplay';
import ListingCard from '@/components/molecules/ListingCard';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/atoms/ErrorState';
import EmptyState from '@/components/atoms/EmptyState';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import listingService from '@/services/api/listingService';

const GarageSales = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const navigate = useNavigate();

  useEffect(() => {
    loadGarageSales();
  }, []);

  const loadGarageSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listingService.getGarageSales();
      setListings(data);
    } catch (err) {
      setError('Failed to load garage sales');
      toast.error('Failed to load garage sales');
      console.error('Error loading garage sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (listing) => {
    setSelectedListing(listing);
  };

  const handleListingClick = (listing) => {
    navigate(`/listing/${listing.Id}`);
  };

  const formatSaleDate = (listing) => {
    if (!listing.customData?.saleDate) return 'Date TBD';
    
    const saleDate = new Date(listing.customData.saleDate);
    const today = new Date();
    const diffTime = saleDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays === -1) return 'Yesterday';
    return `${Math.abs(diffDays)} days ago`;
  };

  const formatTime = (listing) => {
    if (!listing.customData?.startTime) return '';
    const time = listing.customData.startTime;
    const endTime = listing.customData?.endTime;
    return endTime ? `${time} - ${endTime}` : time;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <SkeletonLoader className="h-8 w-64 mb-2" />
          <SkeletonLoader className="h-4 w-96" />
        </div>
        <div className="flex gap-6 h-[600px]">
          <SkeletonLoader className="flex-1 rounded-lg" />
          <SkeletonLoader className="w-80 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Failed to load garage sales"
          message={error}
          onRetry={loadGarageSales}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-surface-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <ApperIcon name="MapPin" size={24} className="text-primary" />
              Garage Sales
            </h1>
            <p className="text-surface-600 mt-1">
              Discover local garage sales and estate sales in your area
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                <ApperIcon name="Map" size={16} className="mr-2" />
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                <ApperIcon name="List" size={16} className="mr-2" />
                List View
              </button>
            </div>
            
            <Button
              onClick={() => navigate('/post')}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              Post Sale
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <ApperIcon name="Calendar" size={16} className="text-surface-500" />
            <span className="text-sm text-surface-600">
              {listings.length} active sale{listings.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ApperIcon name="Clock" size={16} className="text-surface-500" />
            <span className="text-sm text-surface-600">
              Updated every 5 minutes
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {listings.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon="MapPin"
              title="No garage sales found"
              message="There are currently no active garage sales in your area. Check back soon or post your own sale!"
              action={
                <Button onClick={() => navigate('/post')}>
                  Post Your Sale
                </Button>
              }
            />
          </div>
        ) : viewMode === 'map' ? (
          <div className="flex h-full">
            {/* Map - 2/3 width */}
            <div className="flex-1 min-w-0">
              <MapDisplay
                multipleMarkers={true}
                listings={listings}
                onMarkerClick={handleMarkerClick}
                className="h-full border-0 rounded-none"
              />
            </div>
            
            {/* Listings Sidebar - 1/3 width */}
            <div className="w-80 flex-shrink-0 border-l border-surface-200 bg-white overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-surface-900 mb-4">
                  Upcoming Sales ({listings.length})
                </h3>
                
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div
                      key={listing.Id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedListing?.Id === listing.Id
                          ? 'border-primary bg-primary/5'
                          : 'border-surface-200 hover:border-surface-300'
                      }`}
                      onClick={() => handleListingClick(listing)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-surface-900 text-sm leading-tight">
                          {listing.title}
                        </h4>
                        <Badge variant={listing.package}>
                          {listing.package}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-surface-600">
                          <ApperIcon name="MapPin" size={12} />
                          <span>
                            {listing.location.city}, {listing.location.state}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-surface-600">
                          <ApperIcon name="Calendar" size={12} />
                          <span>{formatSaleDate(listing)}</span>
                        </div>
                        
                        {formatTime(listing) && (
                          <div className="flex items-center gap-2 text-xs text-surface-600">
                            <ApperIcon name="Clock" size={12} />
                            <span>{formatTime(listing)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-surface-600">
                          <ApperIcon name="Eye" size={12} />
                          <span>{listing.views} views</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-surface-500 mt-2 line-clamp-2">
                        {listing.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.Id} className="relative">
                  <ListingCard
                    listing={listing}
                    onClick={() => handleListingClick(listing)}
                  />
                  
                  {/* Sale date overlay */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-surface-900">
                    {formatSaleDate(listing)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GarageSales;