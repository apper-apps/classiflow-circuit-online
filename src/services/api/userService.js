import usersData from '../mockData/users.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class UserService {
  constructor() {
    this.users = [...usersData];
  }

  async getAll() {
    await delay(200);
    return [...this.users];
  }

  async getById(id) {
    await delay(150);
    const user = this.users.find(user => user.Id === parseInt(id, 10));
    if (!user) {
      throw new Error('User not found');
    }
    return { ...user };
  }

  async create(userData) {
    await delay(300);
    const maxId = Math.max(...this.users.map(user => user.Id), 0);
    const newUser = {
      Id: maxId + 1,
      ...userData,
      listings: [],
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  async update(id, userData) {
    await delay(250);
    const index = this.users.findIndex(user => user.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...this.users[index],
      ...userData,
      Id: this.users[index].Id // Prevent ID modification
    };
    
    this.users[index] = updatedUser;
    return { ...updatedUser };
  }

  async delete(id) {
    await delay(200);
    const index = this.users.findIndex(user => user.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('User not found');
    }
    
    const deletedUser = this.users.splice(index, 1)[0];
    return { ...deletedUser };
  }

  async getCurrentUser() {
    await delay(100);
    // For demo purposes, return the first admin user
    const adminUser = this.users.find(user => user.role === 'admin');
    return adminUser ? { ...adminUser } : null;
  }
}

export default new UserService();