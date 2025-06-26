import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PackageCard from '@/components/molecules/PackageCard';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/atoms/ErrorState';
import packageService from '@/services/api/packageService';

const PackageSelector = ({ onPackageSelect, selectedPackageId }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await packageService.getAll();
      setPackages(result);
    } catch (err) {
      setError(err.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg) => {
    onPackageSelect?.(pkg);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Choose Your Package</h2>
          <p className="text-surface-600">Select the package that best fits your needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader count={3} height="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadPackages}
        className="py-12"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-surface-900 mb-2">
          Choose Your Package
        </h2>
        <p className="text-surface-600">
          Select the package that best fits your needs and budget
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.Id}
            package={pkg}
            isSelected={selectedPackageId === pkg.Id}
            onSelect={handlePackageSelect}
          />
        ))}
      </motion.div>

      {/* Additional Info */}
      <div className="bg-surface-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-surface-900">Package Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-surface-700">
          <div className="space-y-2">
            <p><strong>Featured Listings:</strong> Appear at the top of search results</p>
            <p><strong>Premium Placement:</strong> Homepage carousel inclusion</p>
          </div>
          <div className="space-y-2">
            <p><strong>Extended Duration:</strong> Longer visibility periods</p>
            <p><strong>Rich Media:</strong> Video uploads and image galleries</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageSelector;