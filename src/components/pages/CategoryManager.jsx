import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/atoms/ErrorState';
import EmptyState from '@/components/atoms/EmptyState';
import categoryService from '@/services/api/categoryService';

const SortableCategory = ({ category, level = 0, children, onEdit, onDelete, onAddSub }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.Id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`
          flex items-center justify-between p-3 bg-white border border-surface-200 rounded-lg mb-2
          ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}
        `}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-surface-100 rounded cursor-grab active:cursor-grabbing"
          >
            <ApperIcon name="GripVertical" size={16} className="text-surface-400" />
          </div>
          
          <div className="p-2 bg-primary/10 rounded-lg">
            <ApperIcon name={category.icon} size={20} className="text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-surface-900">{category.name}</h3>
            <p className="text-sm text-surface-600">
              {category.listingCount} listings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon="Plus"
            onClick={() => onAddSub(category)}
          >
            Add Sub
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon="Edit"
            onClick={() => onEdit(category)}
          />
          <Button
            size="sm"
            variant="outline"
            icon="Trash2"
            onClick={() => onDelete(category)}
            className="text-error hover:bg-error hover:text-white"
          />
        </div>
      </motion.div>
      {children}
    </div>
  );
};
const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Folder',
    parentId: null
  });

  const iconOptions = [
    'Home', 'Car', 'Smartphone', 'ShoppingCart', 'Wrench', 'Hammer',
    'Building', 'Building2', 'Truck', 'Package', 'Users', 'Briefcase'
  ];

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

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', icon: 'Folder', parentId: null });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      parentId: category.parentId
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const categoryData = {
        ...formData,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-')
      };

      if (editingCategory) {
        const updated = await categoryService.update(editingCategory.Id, categoryData);
        setCategories(prev => 
          prev.map(cat => cat.Id === editingCategory.Id ? updated : cat)
        );
        toast.success('Category updated successfully');
      } else {
        const created = await categoryService.create(categoryData);
        setCategories(prev => [...prev, created]);
        toast.success('Category created successfully');
      }

      setShowModal(false);
      setFormData({ name: '', icon: 'Folder', parentId: null });
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    }
};

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      await categoryService.delete(category.Id);
      setCategories(prev => prev.filter(cat => cat.Id !== category.Id));
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeCategory = categories.find(cat => cat.Id === active.id);
    const overCategory = categories.find(cat => cat.Id === over.id);

    if (!activeCategory || !overCategory) {
      return;
    }

    // Only allow reordering within the same parent level
    if (activeCategory.parentId !== overCategory.parentId) {
      toast.error('Cannot move categories between different levels');
      return;
    }

    const parentId = activeCategory.parentId;
    const siblingCategories = categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    const oldIndex = siblingCategories.findIndex(cat => cat.Id === active.id);
    const newIndex = siblingCategories.findIndex(cat => cat.Id === over.id);

    const reorderedCategories = arrayMove(siblingCategories, oldIndex, newIndex);
    
    // Create update payload with new positions
    const updatePayload = reorderedCategories.map((cat, index) => ({
      Id: cat.Id,
      position: index,
      parentId: cat.parentId
    }));

    try {
      await categoryService.updateOrder(updatePayload);
      
      // Update local state
      setCategories(prev => {
        const updated = [...prev];
        updatePayload.forEach(update => {
          const category = updated.find(cat => cat.Id === update.Id);
          if (category) {
            category.position = update.position;
          }
        });
        return updated;
      });
      
      toast.success('Category order updated successfully');
    } catch (error) {
      toast.error('Failed to update category order');
    }
  };

  const getTopLevelCategories = () => {
    return categories.filter(cat => cat.parentId === null);
  };

  const getChildCategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

const renderCategory = (category, level = 0) => {
    const hasChildren = getChildCategories(category.Id).length > 0;
    const isExpanded = expandedCategories.has(category.Id);
    const childCategories = getChildCategories(category.Id).sort((a, b) => (a.position || 0) - (b.position || 0));

    return (
      <SortableCategory
        key={category.Id}
        category={category}
        level={level}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddSub={(category) => {
          setEditingCategory(null);
          setFormData({ name: '', icon: 'Folder', parentId: category.Id });
          setShowModal(true);
        }}
      >
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="ml-6 border-l border-surface-200 pl-4">
                <button
                  onClick={() => toggleExpanded(category.Id)}
                  className="flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-2"
                >
                  <ApperIcon 
                    name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                    size={14} 
                  />
                  {isExpanded ? 'Collapse' : 'Expand'} subcategories
                </button>
                
                <SortableContext
                  items={childCategories.map(child => child.Id)}
                  strategy={verticalListSortingStrategy}
                >
                  {childCategories.map(child => renderCategory(child, level + 1))}
                </SortableContext>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SortableCategory>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-surface-200 rounded w-48 animate-pulse" />
          <div className="h-10 bg-surface-200 rounded w-32 animate-pulse" />
        </div>
        <div className="space-y-4">
          <SkeletonLoader count={8} height="h-16" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadCategories}
        className="p-6"
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Category Management</h1>
          <p className="text-surface-600">
            Organize and manage your marketplace categories
          </p>
        </div>
        <Button
          onClick={handleCreate}
          icon="Plus"
          size="lg"
        >
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create your first category to start organizing listings"
          actionLabel="Create Category"
          onAction={handleCreate}
          icon="FolderTree"
        />
) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-2">
            <SortableContext
              items={getTopLevelCategories().sort((a, b) => (a.position || 0) - (b.position || 0)).map(cat => cat.Id)}
              strategy={verticalListSortingStrategy}
            >
              {getTopLevelCategories()
                .sort((a, b) => (a.position || 0) - (b.position || 0))
                .map(category => renderCategory(category))}
            </SortableContext>
          </div>
        </DndContext>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-surface-900">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Category Name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                />

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      parentId: e.target.value ? parseInt(e.target.value, 10) : null 
                    }))}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Top Level Category</option>
                    {getTopLevelCategories()
                      .filter(cat => !editingCategory || cat.Id !== editingCategory.Id)
                      .map(cat => (
                        <option key={cat.Id} value={cat.Id}>{cat.name}</option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className={`
                          p-3 border border-surface-300 rounded-lg hover:bg-surface-50 transition-colors
                          ${formData.icon === icon ? 'bg-primary text-white border-primary' : ''}
                        `}
                      >
                        <ApperIcon name={icon} size={20} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryManager;