import categoriesData from "../mockData/categories.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
class CategoryService {
  constructor() {
    this.categories = [...categoriesData];
  }

async getAll() {
    await delay(200);
    return [...this.categories];
  }
  async getPublicCategories() {
    await delay(150);
    // Return only top-level categories for embed filtering
    const publicCategories = this.categories
      .filter(cat => cat.parentId === null && cat.listingCount > 0)
      .map(cat => ({
        Id: cat.Id,
        name: cat.name,
        icon: cat.icon,
        listingCount: cat.listingCount
      }));
    return [...publicCategories];
  }

  async getById(id) {
    await delay(150);
    const category = this.categories.find(cat => cat.Id === parseInt(id, 10));
    if (!category) {
      throw new Error('Category not found');
    }
    return { ...category };
  }

  async getByParentId(parentId) {
    await delay(200);
    const filteredCategories = this.categories.filter(cat => 
      cat.parentId === (parentId ? parseInt(parentId, 10) : null)
    );
    return [...filteredCategories];
  }

  async create(categoryData) {
    await delay(300);
    const maxId = Math.max(...this.categories.map(cat => cat.Id), 0);
    const newCategory = {
      Id: maxId + 1,
      ...categoryData,
      listingCount: 0,
      customFields: categoryData.customFields || []
    };
    this.categories.push(newCategory);
    return { ...newCategory };
  }

  async update(id, categoryData) {
    await delay(250);
    const index = this.categories.findIndex(cat => cat.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    const updatedCategory = {
      ...this.categories[index],
      ...categoryData,
      Id: this.categories[index].Id // Prevent ID modification
    };
    
    this.categories[index] = updatedCategory;
    return { ...updatedCategory };
  }

  async delete(id) {
    await delay(200);
    const index = this.categories.findIndex(cat => cat.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    // Check for subcategories
    const hasSubcategories = this.categories.some(cat => cat.parentId === parseInt(id, 10));
    if (hasSubcategories) {
      throw new Error('Cannot delete category with subcategories');
    }
    
    const deletedCategory = this.categories.splice(index, 1)[0];
    return { ...deletedCategory };
  }

async updateListingCount(categoryId, increment = 1) {
    await delay(100);
    const category = this.categories.find(cat => cat.Id === parseInt(categoryId, 10));
    if (category) {
      category.listingCount = Math.max(0, category.listingCount + increment);
    }
  }
  async updateOrder(categoryOrders) {
    await delay(250);
    
    // categoryOrders is an array of { Id, position, parentId }
    categoryOrders.forEach(orderUpdate => {
      const category = this.categories.find(cat => cat.Id === orderUpdate.Id);
      if (category) {
        category.position = orderUpdate.position;
        if (orderUpdate.parentId !== undefined) {
          category.parentId = orderUpdate.parentId;
        }
      }
    });
    
return true;
  }
}

export default new CategoryService();