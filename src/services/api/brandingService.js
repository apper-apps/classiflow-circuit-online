import mockData from '@/services/mockData/branding.json';
import { toast } from 'react-toastify';

// Store data and track last ID
let brandingData = [...mockData];
let lastId = Math.max(...brandingData.map(item => item.Id), 0);

// Generate next ID
const generateId = () => ++lastId;

// Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const brandingService = {
  // Get all branding configurations
  async getAll() {
    try {
      await delay();
      return [...brandingData];
    } catch (error) {
      console.error('Error fetching branding configurations:', error);
      throw new Error('Failed to fetch branding configurations');
    }
  },

  // Get branding configuration by ID
  async getById(id) {
    try {
      const numericId = parseInt(id);
      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new Error('Invalid ID provided');
      }

      await delay();
      const item = brandingData.find(b => b.Id === numericId);
      
      if (!item) {
        throw new Error('Branding configuration not found');
      }

      return { ...item };
    } catch (error) {
      console.error('Error fetching branding configuration:', error);
      throw error;
    }
  },

  // Get active branding configuration
  async getActive() {
    try {
      await delay();
      const active = brandingData.find(b => b.isActive);
      return active ? { ...active } : null;
    } catch (error) {
      console.error('Error fetching active branding:', error);
      throw new Error('Failed to fetch active branding configuration');
    }
  },

  // Create new branding configuration
  async create(brandingData) {
    try {
      await delay();
      
      const newBranding = {
        ...brandingData,
        Id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: brandingData.isActive || false
      };

      // If this is set as active, deactivate others
      if (newBranding.isActive) {
        brandingData.forEach(item => item.isActive = false);
      }

      brandingData.push(newBranding);
      
      return { ...newBranding };
    } catch (error) {
      console.error('Error creating branding configuration:', error);
      throw new Error('Failed to create branding configuration');
    }
  },

  // Update branding configuration
  async update(id, updateData) {
    try {
      const numericId = parseInt(id);
      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new Error('Invalid ID provided');
      }

      await delay();
      
      const index = brandingData.findIndex(b => b.Id === numericId);
      
      if (index === -1) {
        throw new Error('Branding configuration not found');
      }

      // If setting as active, deactivate others
      if (updateData.isActive) {
        brandingData.forEach(item => item.isActive = false);
      }

      brandingData[index] = {
        ...brandingData[index],
        ...updateData,
        Id: numericId, // Prevent ID changes
        updatedAt: new Date().toISOString()
      };

      return { ...brandingData[index] };
    } catch (error) {
      console.error('Error updating branding configuration:', error);
      throw error;
    }
  },

  // Delete branding configuration
  async delete(id) {
    try {
      const numericId = parseInt(id);
      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new Error('Invalid ID provided');
      }

      await delay();
      
      const index = brandingData.findIndex(b => b.Id === numericId);
      
      if (index === -1) {
        throw new Error('Branding configuration not found');
      }

      const deletedItem = brandingData[index];
      
      // Prevent deletion of active branding
      if (deletedItem.isActive) {
        throw new Error('Cannot delete active branding configuration');
      }

      brandingData.splice(index, 1);
      
      return { success: true, deletedId: numericId };
    } catch (error) {
      console.error('Error deleting branding configuration:', error);
      throw error;
    }
  },

  // Set branding configuration as active
  async setActive(id) {
    try {
      const numericId = parseInt(id);
      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new Error('Invalid ID provided');
      }

      await delay();
      
      const targetIndex = brandingData.findIndex(b => b.Id === numericId);
      
      if (targetIndex === -1) {
        throw new Error('Branding configuration not found');
      }

      // Deactivate all others
      brandingData.forEach(item => item.isActive = false);
      
      // Activate target
      brandingData[targetIndex].isActive = true;
      brandingData[targetIndex].updatedAt = new Date().toISOString();

      return { ...brandingData[targetIndex] };
    } catch (error) {
      console.error('Error setting active branding:', error);
      throw error;
    }
  }
};

export default brandingService;