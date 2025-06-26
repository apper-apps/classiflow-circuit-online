import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-md"
      >
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -5, 5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          <ApperIcon name="Search" size={120} className="text-surface-300 mx-auto" />
        </motion.div>
        
        <div className="space-y-3">
          <h1 className="text-6xl font-bold text-surface-900">404</h1>
          <h2 className="text-2xl font-semibold text-surface-700">
            Page Not Found
          </h2>
          <p className="text-surface-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            icon="ArrowLeft"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            icon="Home"
          >
            Return Home
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-surface-200">
          <p className="text-sm text-surface-600 mb-3">Popular pages:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => navigate('/browse')}
              className="text-sm text-primary hover:underline"
            >
              Browse Listings
            </button>
            <span className="text-surface-400">•</span>
            <button
              onClick={() => navigate('/post')}
              className="text-sm text-primary hover:underline"
            >
              Post an Ad
            </button>
            <span className="text-surface-400">•</span>
            <button
              onClick={() => navigate('/admin')}
              className="text-sm text-primary hover:underline"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;