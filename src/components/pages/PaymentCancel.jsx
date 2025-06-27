import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center space-y-6"
        >
          {/* Cancel Icon */}
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
            <ApperIcon name="XCircle" size={32} className="text-warning" />
          </div>

          {/* Cancel Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-surface-900">
              Payment Cancelled
            </h1>
            <p className="text-surface-600">
              Your payment was cancelled and no charges were made. Your listing draft has been saved.
            </p>
          </div>

          {/* Information Box */}
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <ApperIcon name="Info" size={16} className="text-warning mt-0.5 flex-shrink-0" />
              <div className="text-sm text-surface-700">
                <p className="font-medium mb-1">Your listing information is saved</p>
                <p>You can return to complete the payment process anytime within 24 hours.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/post')}
              variant="primary"
              className="w-full"
              icon="CreditCard"
            >
              Try Payment Again
            </Button>
            
            <Button
              onClick={() => navigate('/my-listings')}
              variant="outline"
              className="w-full"
              icon="FileText"
            >
              View My Listings
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full"
              icon="Home"
            >
              Back to Home
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-surface-500 space-y-1">
            <p>Need help? Contact our support team.</p>
            <p>Payment issues are usually resolved quickly.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentCancel;