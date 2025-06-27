import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/atoms/ErrorState';
import FormField from '@/components/molecules/FormField';
import MapDisplay from '@/components/molecules/MapDisplay';
import listingService from '@/services/api/listingService';
import categoryService from '@/services/api/categoryService';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    setLoading(true);
    setError(null);
    try {
      const listingData = await listingService.getById(parseInt(id, 10));
      setListing(listingData);
      
      if (listingData.categoryId) {
        const categoryData = await categoryService.getById(listingData.categoryId);
        setCategory(categoryData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Contact for Price';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // In real app, send contact form to backend
    toast.success('Message sent successfully!');
    setShowContactForm(false);
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  const nextImage = () => {
    if (listing?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing?.images?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Button variant="outline" icon="ArrowLeft" onClick={() => navigate(-1)}>
          Back
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonLoader count={1} height="h-96" />
          <div className="space-y-4">
            <SkeletonLoader count={1} height="h-8" />
            <SkeletonLoader count={1} height="h-6" />
            <SkeletonLoader count={3} height="h-4" />
            <SkeletonLoader count={1} height="h-12" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Button variant="outline" icon="ArrowLeft" onClick={() => navigate(-1)} className="mb-6">
          Back
        </Button>
        <ErrorState
          message={error}
          onRetry={loadListing}
        />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Button variant="outline" icon="ArrowLeft" onClick={() => navigate(-1)} className="mb-6">
          Back
        </Button>
        <ErrorState
          title="Listing not found"
          message="The listing you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  const packageVariants = {
    basic: 'default',
    featured: 'featured',
    premium: 'premium'
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button variant="outline" icon="ArrowLeft" onClick={() => navigate(-1)}>
        Back to Listings
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Main Image */}
          <div className="relative h-96 bg-surface-100 rounded-lg overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <>
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ApperIcon name="ChevronLeft" size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ApperIcon name="ChevronRight" size={20} />
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ApperIcon name="Image" size={64} className="text-surface-400" />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {listing.images && listing.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`
                    h-16 rounded-lg overflow-hidden border-2 transition-colors
                    ${index === currentImageIndex 
                      ? 'border-primary' 
                      : 'border-surface-200 hover:border-surface-300'
                    }
                  `}
                >
                  <img
                    src={image}
                    alt={`${listing.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Listing Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge variant={packageVariants[listing.package]} size="sm">
                  {listing.package}
                </Badge>
                {category && (
                  <div className="flex items-center gap-1 text-sm text-surface-600">
                    <ApperIcon name={category.icon} size={16} />
                    <span>{category.name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-surface-500">
                <ApperIcon name="Eye" size={16} />
                <span>{listing.views} views</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-surface-900">
              {listing.title}
            </h1>
            
            <p className="text-2xl font-bold text-primary">
              {formatPrice(listing.price)}
            </p>
          </div>

{/* Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-surface-600">
              <ApperIcon name="MapPin" size={18} />
              <span>
                {listing.location?.address && `${listing.location.address}, `}
                {listing.location?.city}, {listing.location?.state} {listing.location?.zipCode}
              </span>
            </div>
            
            {/* Map Display */}
            {listing.location?.address && listing.location?.city && listing.location?.state && (
              <MapDisplay
                address={listing.location.address}
                city={listing.location.city}
                state={listing.location.state}
                zipCode={listing.location.zipCode}
                title={listing.title}
                className="mt-3"
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-surface-900">Description</h2>
            <p className="text-surface-700 leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>
          {/* Custom Fields */}
          {listing.customData && Object.keys(listing.customData).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-surface-900">Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(listing.customData).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <span className="text-sm text-surface-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <p className="font-medium text-surface-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="bg-surface-50 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-surface-900">
              Interested? Contact the Seller
            </h2>
            
            <div className="space-y-3">
              <Button
                onClick={() => setShowContactForm(!showContactForm)}
                icon="MessageCircle"
                size="lg"
                className="w-full"
              >
                Send Message
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  icon="Phone"
                  onClick={() => toast.info('Phone number: (555) 123-4567')}
                >
                  Call
                </Button>
                <Button
                  variant="outline"
                  icon="Mail"
                  onClick={() => toast.info('Email: seller@example.com')}
                >
                  Email
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            {showContactForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleContactSubmit}
                className="space-y-4 pt-4 border-t border-surface-200"
              >
                <FormField
                  label="Your Name"
                  name="name"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <FormField
                    label="Phone"
                    name="phone"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Hi, I'm interested in your listing..."
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </motion.form>
            )}
          </div>

          {/* Safety Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ApperIcon name="Shield" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900 mb-1">Safety Tips</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Meet in a public place for transactions</li>
                  <li>• Inspect items before purchasing</li>
                  <li>• Be cautious of deals that seem too good to be true</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ListingDetail;