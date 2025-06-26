import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';

const ListingCard = ({ listing, showActions = false, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/listing/${listing.Id}`);
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

  const packageVariants = {
    basic: 'default',
    featured: 'featured',
    premium: 'premium'
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
      className={`
        bg-white rounded-lg border border-surface-200 overflow-hidden cursor-pointer
        transition-all duration-200 hover:border-primary/30
        ${listing.package === 'featured' || listing.package === 'premium' ? 'featured-ribbon' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-surface-100 flex items-center justify-center">
            <ApperIcon name="Image" size={40} className="text-surface-400" />
          </div>
        )}
        
        {/* Package Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={packageVariants[listing.package]} size="sm">
            {listing.package}
          </Badge>
        </div>

        {/* Image Count */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
            <ApperIcon name="Camera" size={14} />
            {listing.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-surface-900 line-clamp-2 mb-1">
            {listing.title}
          </h3>
          <p className="text-lg font-bold text-primary">
            {formatPrice(listing.price)}
          </p>
        </div>

        <p className="text-sm text-surface-600 line-clamp-2">
          {listing.description}
        </p>

        {/* Location & Stats */}
        <div className="flex items-center justify-between text-sm text-surface-500">
          <div className="flex items-center gap-1">
            <ApperIcon name="MapPin" size={14} />
            <span>{listing.location?.city}, {listing.location?.state}</span>
          </div>
          <div className="flex items-center gap-1">
            <ApperIcon name="Eye" size={14} />
            <span>{listing.views}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t border-surface-200" onClick={e => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              icon="Edit"
              onClick={() => onEdit?.(listing)}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon="Trash2"
              onClick={() => onDelete?.(listing)}
              className="text-error hover:bg-error hover:text-white"
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ListingCard;