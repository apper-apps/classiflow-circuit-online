import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ErrorState = ({ 
  message = 'Something went wrong', 
  onRetry,
  icon = 'AlertCircle',
  title = 'Oops!',
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-12 ${className}`}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-4"
      >
        <ApperIcon 
          name={icon} 
          size={48} 
          className="text-error mx-auto" 
        />
      </motion.div>
      
      <h3 className="text-lg font-medium text-surface-900 mb-2">
        {title}
      </h3>
      
      <p className="text-surface-600 mb-6 max-w-md mx-auto">
        {message}
      </p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          icon="RefreshCw"
          variant="outline"
        >
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;