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

  async updateRole(id, role) {
    await delay(250);
    const index = this.users.findIndex(user => user.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('User not found');
    }

    const validRoles = ['user', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role specified');
    }

    this.users[index] = {
      ...this.users[index],
      role
    };

    return { ...this.users[index] };
  }

  async acceptInvitation(email, userData) {
    await delay(300);
    const existingUser = this.users.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      // Update existing user with additional data
      const index = this.users.findIndex(user => user.Id === existingUser.Id);
      this.users[index] = {
        ...this.users[index],
        ...userData,
        Id: this.users[index].Id // Prevent ID modification
      };
      return { ...this.users[index] };
    } else {
      // Create new user
      return await this.create({
        email,
        ...userData
      });
}
  }

  async hasPermission(userId, permission) {
    await delay(100);
    const user = this.users.find(user => user.Id === parseInt(userId, 10));
    if (!user) {
      return false;
    }

    // Check if user has explicit permissions
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }

    // Fall back to role-based permissions
    const rolePermissions = this.getRolePermissions(user.role);
    return rolePermissions.includes(permission);
  }

  async canPerformAction(userId, action, resourceId = null) {
    await delay(100);
    const user = this.users.find(user => user.Id === parseInt(userId, 10));
    if (!user) {
      return false;
    }

    // Super admins can do everything
    if (user.role === 'super_admin') {
      return true;
    }

    // Check specific permission requirements
    const permissionMap = {
      'create_listing': 'create_listings',
      'edit_listing': resourceId && user.Id === resourceId ? 'edit_own_listings' : 'edit_listings',
      'delete_listing': resourceId && user.Id === resourceId ? 'delete_own_listings' : 'delete_listings',
      'view_analytics': 'view_analytics',
      'manage_team': 'manage_team',
      'manage_categories': 'manage_categories'
    };

    const requiredPermission = permissionMap[action];
    if (!requiredPermission) {
      return false;
    }

    return await this.hasPermission(userId, requiredPermission);
  }

  getRolePermissions(role) {
    const rolePermissions = {
      user: [
        'view_listings',
        'create_listings',
        'edit_own_listings',
        'delete_own_listings',
        'view_messages',
        'send_messages'
      ],
      admin: [
        'view_listings',
        'create_listings',
        'edit_listings',
        'delete_listings',
        'view_messages',
        'send_messages',
        'manage_categories',
        'manage_users',
        'view_analytics',
        'moderate_content'
      ],
      super_admin: [
        'view_listings',
        'create_listings',
        'edit_listings',
        'delete_listings',
        'view_messages',
        'send_messages',
        'manage_categories',
        'manage_users',
        'view_analytics',
        'moderate_content',
        'manage_team',
        'manage_permissions',
        'manage_branding',
        'manage_system',
        'view_logs',
        'manage_billing'
      ]
    };
    
    return rolePermissions[role] || rolePermissions.user;
  }

  async updateUserPermissions(id, permissions) {
    await delay(250);
    const index = this.users.findIndex(user => user.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('User not found');
    }
    
    this.users[index] = {
      ...this.users[index],
      permissions: [...permissions]
    };
    
    return { ...this.users[index] };
  }
}