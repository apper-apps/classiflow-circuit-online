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
    
    if (!embedData.name || !embedData.url) {
      throw new Error('Name and URL are required');
    }

    const newEmbed = {
      Id: nextId++,
      name: embedData.name,
      url: embedData.url,
      width: embedData.width || '100%',
      height: embedData.height || '400',
      allowFullscreen: embedData.allowFullscreen !== false,
      sandbox: embedData.sandbox !== false,
      description: embedData.description || '',
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

    if (!embedData.name || !embedData.url) {
      throw new Error('Name and URL are required');
    }

    const updatedEmbed = {
      ...embeds[index],
      name: embedData.name,
      url: embedData.url,
      width: embedData.width || '100%',
      height: embedData.height || '400',
      allowFullscreen: embedData.allowFullscreen !== false,
      sandbox: embedData.sandbox !== false,
      description: embedData.description || '',
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