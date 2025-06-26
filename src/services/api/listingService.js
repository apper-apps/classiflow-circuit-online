import listingsData from '../mockData/listings.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ListingService {
  constructor() {
    this.listings = [...listingsData];
  }

  async getAll(filters = {}) {
    await delay(300);
    let filteredListings = [...this.listings];

    if (filters.categoryId) {
      filteredListings = filteredListings.filter(listing => 
        listing.categoryId === parseInt(filters.categoryId, 10)
      );
    }

    if (filters.status) {
      filteredListings = filteredListings.filter(listing => 
        listing.status === filters.status
      );
    }

    if (filters.userId) {
      filteredListings = filteredListings.filter(listing => 
        listing.userId === filters.userId
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredListings = filteredListings.filter(listing =>
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.minPrice !== undefined) {
      filteredListings = filteredListings.filter(listing =>
        listing.price === null || listing.price >= filters.minPrice
      );
    }

    if (filters.maxPrice !== undefined) {
      filteredListings = filteredListings.filter(listing =>
        listing.price === null || listing.price <= filters.maxPrice
      );
    }

    // Sort by package priority and creation date
    filteredListings.sort((a, b) => {
      const packagePriority = { premium: 3, featured: 2, basic: 1 };
      const aPriority = packagePriority[a.package] || 0;
      const bPriority = packagePriority[b.package] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.Id - a.Id; // Newer listings first
    });

    return filteredListings;
  }

  async getById(id) {
    await delay(200);
    const listing = this.listings.find(item => item.Id === parseInt(id, 10));
    if (!listing) {
      throw new Error('Listing not found');
    }
    
    // Increment view count
    listing.views += 1;
    
    return { ...listing };
  }

  async create(listingData) {
    await delay(400);
    const maxId = Math.max(...this.listings.map(item => item.Id), 0);
    const newListing = {
      Id: maxId + 1,
      ...listingData,
      views: 0,
      status: 'pending',
      customData: listingData.customData || {}
    };
    
    this.listings.push(newListing);
    return { ...newListing };
  }

  async update(id, listingData) {
    await delay(300);
    const index = this.listings.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Listing not found');
    }
    
    const updatedListing = {
      ...this.listings[index],
      ...listingData,
      Id: this.listings[index].Id // Prevent ID modification
    };
    
    this.listings[index] = updatedListing;
    return { ...updatedListing };
  }

  async delete(id) {
    await delay(250);
    const index = this.listings.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Listing not found');
    }
    
    const deletedListing = this.listings.splice(index, 1)[0];
    return { ...deletedListing };
  }

  async getFeatured(limit = 6) {
    await delay(200);
    const featuredListings = this.listings
      .filter(listing => listing.package === 'featured' || listing.package === 'premium')
      .filter(listing => listing.status === 'active')
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
    
    return [...featuredListings];
  }

  async getAnalytics() {
    await delay(250);
    const totalListings = this.listings.length;
    const activeListings = this.listings.filter(item => item.status === 'active').length;
    const pendingListings = this.listings.filter(item => item.status === 'pending').length;
    const totalViews = this.listings.reduce((sum, item) => sum + item.views, 0);
    
    return {
      totalListings,
      activeListings,
      pendingListings,
      totalViews,
      averageViews: totalListings > 0 ? Math.round(totalViews / totalListings) : 0
    };
  }
}

export default new ListingService();