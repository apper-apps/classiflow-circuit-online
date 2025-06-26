import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import listingService from '@/services/api/listingService';
import categoryService from '@/services/api/categoryService';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, listings, cats] = await Promise.all([
        listingService.getAnalytics(),
        listingService.getAll({ status: 'pending' }),
        categoryService.getAll()
      ]);

      setAnalytics(analyticsData);
      setRecentListings(listings.slice(0, 5));
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const revenueChartOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false }
    },
    colors: ['#2563eb'],
    stroke: { width: 3, curve: 'smooth' },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: {
      labels: { 
        style: { colors: '#64748b' },
        formatter: (value) => `$${value}`
      }
    },
    grid: { borderColor: '#e2e8f0' },
    tooltip: {
      theme: 'light',
      y: { formatter: (value) => `$${value}` }
    }
  };

  const revenueChartSeries = [{
    name: 'Revenue',
    data: [1200, 1800, 2400, 1900, 2800, 3200]
  }];

  const categoryChartOptions = {
    chart: {
      type: 'donut',
      height: 300
    },
    colors: ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
    labels: categories.slice(0, 5).map(cat => cat.name),
    legend: { position: 'bottom' },
    plotOptions: {
      pie: {
        donut: { size: '70%' }
      }
    }
  };

  const categoryChartSeries = categories.slice(0, 5).map(cat => cat.listingCount);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-surface-200 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader count={4} height="h-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader count={2} height="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Admin Dashboard</h1>
          <p className="text-surface-600">
            Monitor your marketplace performance and manage listings
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon="Download">
            Export Data
          </Button>
          <Button icon="Settings">
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Listings',
            value: analytics?.totalListings || 0,
            change: '+12%',
            icon: 'FileText',
            color: 'text-primary',
            bgColor: 'bg-primary/10'
          },
          {
            title: 'Active Listings',
            value: analytics?.activeListings || 0,
            change: '+8%',
            icon: 'TrendingUp',
            color: 'text-success',
            bgColor: 'bg-success/10'
          },
          {
            title: 'Pending Review',
            value: analytics?.pendingListings || 0,
            change: '+3',
            icon: 'Clock',
            color: 'text-warning',
            bgColor: 'bg-warning/10'
          },
          {
            title: 'Total Views',
            value: analytics?.totalViews || 0,
            change: '+15%',
            icon: 'Eye',
            color: 'text-info',
            bgColor: 'bg-info/10'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-surface-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                <p className="text-sm text-success font-medium">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <ApperIcon name={stat.icon} size={24} className={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg border border-surface-200 p-6"
        >
          <h3 className="text-lg font-semibold text-surface-900 mb-4">
            Revenue Overview
          </h3>
          <Chart
            options={revenueChartOptions}
            series={revenueChartSeries}
            type="line"
            height={300}
          />
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg border border-surface-200 p-6"
        >
          <h3 className="text-lg font-semibold text-surface-900 mb-4">
            Listings by Category
          </h3>
          <Chart
            options={categoryChartOptions}
            series={categoryChartSeries}
            type="donut"
            height={300}
          />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-surface-200"
        >
          <div className="p-6 border-b border-surface-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-surface-900">
                Pending Approval
              </h3>
              <Badge variant="warning" size="sm">
                {recentListings.length} pending
              </Badge>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentListings.length === 0 ? (
              <p className="text-surface-500 text-center py-8">
                No pending listings
              </p>
            ) : (
              recentListings.map((listing) => (
                <div
                  key={listing.Id}
                  className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-surface-200 rounded-lg flex items-center justify-center">
                    <ApperIcon name="FileText" size={20} className="text-surface-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 truncate">
                      {listing.title}
                    </p>
                    <p className="text-sm text-surface-600">
                      ${listing.price || 'Contact for price'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" icon="Check">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" icon="X">
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-surface-200"
        >
          <div className="p-6 border-b border-surface-200">
            <h3 className="text-lg font-semibold text-surface-900">
              Quick Actions
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {[
              { label: 'Manage Categories', icon: 'FolderTree', href: '/admin/categories' },
              { label: 'User Management', icon: 'Users', href: '#' },
              { label: 'Payment Settings', icon: 'CreditCard', href: '#' },
              { label: 'Site Settings', icon: 'Settings', href: '#' },
              { label: 'Export Reports', icon: 'Download', href: '#' },
              { label: 'Email Templates', icon: 'Mail', href: '#' }
            ].map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface-50 rounded-lg transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ApperIcon name={action.icon} size={16} className="text-primary" />
                </div>
                <span className="font-medium text-surface-900">{action.label}</span>
                <ApperIcon name="ChevronRight" size={16} className="text-surface-400 ml-auto" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;