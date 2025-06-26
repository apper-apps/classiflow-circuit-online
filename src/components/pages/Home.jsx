import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import ListingCard from '@/components/molecules/ListingCard';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import listingService from '@/services/api/listingService';
import categoryService from '@/services/api/categoryService';

const Home = () => {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [featured, cats, stats] = await Promise.all([
        listingService.getFeatured(6),
        categoryService.getByParentId(null),
        listingService.getAnalytics()
      ]);
      
      setFeaturedListings(featured);
      setCategories(cats);
      setAnalytics(stats);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    navigate(`/browse?search=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/browse?category=${category.Id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-accent/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-surface-900">
                Find Everything You Need
              </h1>
              <p className="text-xl text-surface-600 max-w-3xl mx-auto">
                Discover amazing deals on everything from cars and real estate to electronics and services. 
                Join thousands of buyers and sellers in your local marketplace.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar
                placeholder="What are you looking for?"
                onSearch={handleSearch}
                className="shadow-lg"
              />
            </div>

            {/* Quick Stats */}
            {analytics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
              >
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{analytics.totalListings}</div>
                  <div className="text-sm text-surface-600">Total Listings</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-success">{analytics.activeListings}</div>
                  <div className="text-sm text-surface-600">Active Listings</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{analytics.totalViews}</div>
                  <div className="text-sm text-surface-600">Total Views</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-info">{categories.length}</div>
                  <div className="text-sm text-surface-600">Categories</div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-surface-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-surface-600">
              Find exactly what you're looking for in our organized categories
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <SkeletonLoader count={10} height="h-32" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, staggerChildren: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {categories.map((category, index) => (
                <motion.div
                  key={category.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white rounded-xl border border-surface-200 p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3">
                    <ApperIcon name={category.icon} size={24} className="text-primary" />
                  </div>
                  <h3 className="font-medium text-surface-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-surface-500">{category.listingCount} listings</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-bold text-surface-900 mb-2">
                Featured Listings
              </h2>
              <p className="text-surface-600">
                Premium listings from verified sellers
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/browse')}
              icon="ArrowRight"
              iconPosition="right"
            >
              View All
            </Button>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonLoader count={6} height="h-80" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredListings.map((listing, index) => (
                <motion.div
                  key={listing.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white">
              Ready to Start Selling?
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of sellers and reach customers in your area. 
              Create your first listing in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/post')}
                icon="Plus"
                className="shadow-lg"
              >
                Post Your First Listing
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/browse')}
                icon="Search"
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Browse Listings
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;