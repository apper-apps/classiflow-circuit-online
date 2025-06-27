import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listing_id');

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center space-y-6"
        >
          {/* Success Icon */}
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <ApperIcon name="CheckCircle" size={32} className="text-success" />
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-surface-900">
              Payment Successful!
            </h1>
            <p className="text-surface-600">
              Your listing has been published and is now live on ClassiFlow Pro.
            </p>
          </div>

          {/* Listing Details */}
          <div className="bg-surface-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-surface-600">Listing ID:</span>
              <span className="font-medium">#{listingId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-surface-600">Status:</span>
              <span className="font-medium text-success">Active</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/my-listings')}
              variant="primary"
              className="w-full"
              icon="FileText"
            >
              View My Listings
            </Button>
            
            <Button
              onClick={() => navigate('/post')}
              variant="outline"
              className="w-full"
              icon="Plus"
            >
              Post Another Ad
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-surface-500 space-y-1">
            <p>You will receive a confirmation email shortly.</p>
            <p>Your listing will remain active for the selected duration.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;