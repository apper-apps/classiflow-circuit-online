import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';

const PackageCard = ({ 
  package: pkg, 
  isSelected = false, 
  onSelect,
  className = '' 
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const cardVariants = {
    basic: 'border-surface-200 hover:border-surface-300',
    featured: 'border-accent/30 hover:border-accent bg-gradient-to-br from-accent/5 to-transparent',
    premium: 'border-primary/30 hover:border-primary bg-gradient-to-br from-primary/5 to-transparent'
  };

  const buttonVariants = {
    basic: 'primary',
    featured: 'accent',
    premium: 'primary'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-200
        ${cardVariants[pkg.name.toLowerCase()] || cardVariants.basic}
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${pkg.highlighted ? 'shadow-lg' : 'shadow-sm'}
        ${className}
      `}
      onClick={() => onSelect?.(pkg)}
    >
      {pkg.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="accent" size="sm">
            Most Popular
          </Badge>
        </div>
      )}

      <div className="text-center space-y-4">
        {/* Package Name */}
        <h3 className="text-xl font-bold text-surface-900">
          {pkg.name}
        </h3>

        {/* Price */}
        <div className="space-y-1">
          <div className="text-3xl font-bold text-surface-900">
            {formatPrice(pkg.price)}
          </div>
          <p className="text-sm text-surface-600">
            {pkg.duration} days listing
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-3 text-left">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <ApperIcon 
                name="Check" 
                size={16} 
                className="text-success flex-shrink-0 mt-0.5" 
              />
              <span className="text-surface-700">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Select Button */}
        <Button
          variant={buttonVariants[pkg.name.toLowerCase()] || 'primary'}
          className="w-full"
          icon={isSelected ? "Check" : undefined}
        >
          {isSelected ? 'Selected' : 'Choose Plan'}
        </Button>
      </div>
    </motion.div>
  );
};

export default PackageCard;