import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import categoryService from '@/services/api/categoryService';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/atoms/ErrorState';

const CategorySidebar = ({ onCategorySelect, selectedCategoryId }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await categoryService.getAll();
      setCategories(result);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getChildCategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  const getTopLevelCategories = () => {
    return categories.filter(cat => cat.parentId === null);
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = getChildCategories(category.Id).length > 0;
    const isExpanded = expandedCategories.has(category.Id);
    const isSelected = selectedCategoryId === category.Id;

    return (
      <div key={category.Id}>
        <motion.div
          whileHover={{ x: 2 }}
          className={`
            flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors
            ${isSelected 
              ? 'bg-primary text-white' 
              : 'text-surface-700 hover:bg-surface-100'
            }
            ${level > 0 ? 'ml-4 border-l border-surface-200' : ''}
          `}
          style={{ paddingLeft: `${12 + (level * 16)}px` }}
          onClick={() => onCategorySelect?.(category)}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <ApperIcon 
              name={category.icon} 
              size={16} 
              className={isSelected ? 'text-white' : 'text-surface-500'} 
            />
            <span className="font-medium truncate">{category.name}</span>
            <span className={`
              text-xs px-1.5 py-0.5 rounded-full
              ${isSelected 
                ? 'bg-white/20 text-white' 
                : 'bg-surface-200 text-surface-600'
              }
            `}>
              {category.listingCount}
            </span>
          </div>
          
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.Id);
              }}
              className={`p-1 rounded hover:bg-black/10 ${isSelected ? 'text-white' : 'text-surface-400'}`}
            >
              <ApperIcon 
                name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                size={14} 
              />
            </button>
          )}
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {getChildCategories(category.Id).map(child => 
                renderCategory(child, level + 1)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <SkeletonLoader count={8} height="h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadCategories}
        className="p-4"
      />
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-surface-900">Categories</h2>
        <button
          onClick={() => onCategorySelect?.(null)}
          className={`
            text-sm px-2 py-1 rounded transition-colors
            ${!selectedCategoryId 
              ? 'bg-primary text-white' 
              : 'text-primary hover:bg-primary/10'
            }
          `}
        >
          All
        </button>
      </div>
      
      {getTopLevelCategories().map(category => renderCategory(category))}
    </div>
  );
};

export default CategorySidebar;