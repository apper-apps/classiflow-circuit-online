import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({ 
  title = 'Nothing here yet',
  description = 'Get started by adding your first item',
  actionLabel = 'Get Started',
  onAction,
  icon = 'Package',
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-12 ${className}`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-6"
      >
        <ApperIcon 
          name={icon} 
          size={64} 
          className="text-surface-300 mx-auto" 
        />
      </motion.div>
      
      <h3 className="text-xl font-medium text-surface-900 mb-2">
        {title}
      </h3>
      
      <p className="text-surface-600 mb-8 max-w-md mx-auto">
        {description}
      </p>
      
      {onAction && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onAction}
            size="lg"
            className="shadow-lg"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;