import packagesData from '../mockData/packages.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class PackageService {
  constructor() {
    this.packages = [...packagesData];
  }

  async getAll() {
    await delay(150);
    return [...this.packages];
  }

  async getById(id) {
    await delay(100);
    const packageItem = this.packages.find(pkg => pkg.Id === parseInt(id, 10));
    if (!packageItem) {
      throw new Error('Package not found');
    }
    return { ...packageItem };
  }

  async create(packageData) {
    await delay(250);
    const maxId = Math.max(...this.packages.map(pkg => pkg.Id), 0);
    const newPackage = {
      Id: maxId + 1,
      ...packageData
    };
    this.packages.push(newPackage);
    return { ...newPackage };
  }

  async update(id, packageData) {
    await delay(200);
    const index = this.packages.findIndex(pkg => pkg.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Package not found');
    }
    
    const updatedPackage = {
      ...this.packages[index],
      ...packageData,
      Id: this.packages[index].Id // Prevent ID modification
    };
    
    this.packages[index] = updatedPackage;
    return { ...updatedPackage };
  }

  async delete(id) {
    await delay(200);
    const index = this.packages.findIndex(pkg => pkg.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Package not found');
    }
    
    const deletedPackage = this.packages.splice(index, 1)[0];
    return { ...deletedPackage };
  }
}

export default new PackageService();