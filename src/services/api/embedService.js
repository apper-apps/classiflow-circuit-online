import embedsData from '@/services/mockData/embeds.json';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for development
let embeds = [...embedsData];
let nextId = Math.max(...embeds.map(e => e.Id)) + 1;

const embedService = {
  async getAll() {
    await delay(500);
    return [...embeds];
  },

  async getById(id) {
    await delay(300);
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error('Invalid embed ID');
    }
    
    const embed = embeds.find(e => e.Id === parsedId);
    if (!embed) {
      throw new Error('Embed configuration not found');
    }
    
    return { ...embed };
  },

async create(embedData) {
    await delay(500);
    
    if (!embedData.name) {
      throw new Error('Name is required');
    }

    if (embedData.type === 'external' && !embedData.url) {
      throw new Error('URL is required for external embeds');
    }

    const newEmbed = {
      Id: nextId++,
      name: embedData.name,
      type: embedData.type || 'external',
      url: embedData.url || '',
      width: embedData.width || '100%',
      height: embedData.height || '400',
      allowFullscreen: embedData.allowFullscreen !== false,
      sandbox: embedData.sandbox !== false,
      description: embedData.description || '',
      categories: embedData.categories || [],
      showSearch: embedData.showSearch !== false,
      maxListings: embedData.maxListings || 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    embeds.push(newEmbed);
    return { ...newEmbed };
  },

async update(id, embedData) {
    await delay(500);
    
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error('Invalid embed ID');
    }

    const index = embeds.findIndex(e => e.Id === parsedId);
    if (index === -1) {
      throw new Error('Embed configuration not found');
    }

    if (!embedData.name) {
      throw new Error('Name is required');
    }

    if (embedData.type === 'external' && !embedData.url) {
      throw new Error('URL is required for external embeds');
    }

    const updatedEmbed = {
      ...embeds[index],
      name: embedData.name,
      type: embedData.type || embeds[index].type || 'external',
      url: embedData.url || '',
      width: embedData.width || '100%',
      height: embedData.height || '400',
      allowFullscreen: embedData.allowFullscreen !== false,
      sandbox: embedData.sandbox !== false,
      description: embedData.description || '',
      categories: embedData.categories || [],
      showSearch: embedData.showSearch !== false,
      maxListings: embedData.maxListings || 12,
      updatedAt: new Date().toISOString()
    };

    embeds[index] = updatedEmbed;
    return { ...updatedEmbed };
  },

  async delete(id) {
    await delay(300);
    
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error('Invalid embed ID');
    }

    const index = embeds.findIndex(e => e.Id === parsedId);
    if (index === -1) {
      throw new Error('Embed configuration not found');
    }

    const deleted = embeds.splice(index, 1)[0];
    return { ...deleted };
  }
};

export default embedService;