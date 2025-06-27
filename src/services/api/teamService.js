import teamsData from '../mockData/teams.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class TeamService {
  constructor() {
    this.teamMembers = [...teamsData];
  }

  async getTeamMembers() {
    await delay(200);
    return [...this.teamMembers];
  }

  async getTeamMemberById(id) {
    await delay(150);
    const member = this.teamMembers.find(member => member.Id === parseInt(id, 10));
    if (!member) {
      throw new Error('Team member not found');
    }
    return { ...member };
  }

  async inviteMember(memberData) {
    await delay(300);
    const existingMember = this.teamMembers.find(member => 
      member.email.toLowerCase() === memberData.email.toLowerCase()
    );
    
    if (existingMember) {
      throw new Error('User is already a team member');
    }

    const maxId = Math.max(...this.teamMembers.map(member => member.Id), 0);
    const newMember = {
      Id: maxId + 1,
      email: memberData.email,
      name: memberData.name || memberData.email.split('@')[0],
      role: memberData.role || 'user',
      status: 'pending',
      invitedBy: memberData.invitedBy,
      invitedAt: new Date().toISOString(),
      joinedAt: null
    };

    this.teamMembers.push(newMember);
    return { ...newMember };
  }

  async updateMemberRole(id, role) {
    await delay(250);
    const index = this.teamMembers.findIndex(member => member.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Team member not found');
    }

    this.teamMembers[index] = {
      ...this.teamMembers[index],
      role
    };

    return { ...this.teamMembers[index] };
  }

  async removeMember(id) {
    await delay(200);
    const index = this.teamMembers.findIndex(member => member.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Team member not found');
    }

    const deletedMember = this.teamMembers.splice(index, 1)[0];
    return { ...deletedMember };
  }

  async acceptInvitation(id) {
    await delay(250);
    const index = this.teamMembers.findIndex(member => member.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Team member not found');
    }

    if (this.teamMembers[index].status !== 'pending') {
      throw new Error('Invitation is not pending');
    }

    this.teamMembers[index] = {
      ...this.teamMembers[index],
      status: 'active',
      joinedAt: new Date().toISOString()
    };

    return { ...this.teamMembers[index] };
  }

  async resendInvitation(id) {
    await delay(200);
    const index = this.teamMembers.findIndex(member => member.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Team member not found');
    }

    this.teamMembers[index] = {
      ...this.teamMembers[index],
      invitedAt: new Date().toISOString()
    };
return { ...this.teamMembers[index] };
  }

  async getActiveMembers() {
    await delay(200);
    return this.teamMembers
      .filter(member => member.status === 'active')
      .map(member => ({ ...member }));
  }

  async getPermissions(id) {
    await delay(150);
    const member = this.teamMembers.find(member => member.Id === parseInt(id, 10));
    if (!member) {
      throw new Error('Team member not found');
    }
    return member.permissions || this.getDefaultPermissions(member.role);
  }

  async updatePermissions(id, permissions) {
    await delay(250);
    const index = this.teamMembers.findIndex(member => member.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Team member not found');
    }

    this.teamMembers[index] = {
      ...this.teamMembers[index],
      permissions: [...permissions]
    };

    return { ...this.teamMembers[index] };
  }

  async validatePermission(id, permission) {
    await delay(100);
    const member = this.teamMembers.find(member => member.Id === parseInt(id, 10));
    if (!member) {
      return false;
    }
    
    const memberPermissions = member.permissions || this.getDefaultPermissions(member.role);
    return memberPermissions.includes(permission);
  }

  async bulkUpdatePermissions(updates) {
    await delay(300);
    const results = [];
    
    for (const update of updates) {
      const index = this.teamMembers.findIndex(member => member.Id === parseInt(update.id, 10));
      if (index !== -1) {
        this.teamMembers[index] = {
          ...this.teamMembers[index],
          permissions: [...update.permissions]
        };
        results.push({ ...this.teamMembers[index] });
      }
    }
    
    return results;
  }

  getDefaultPermissions(role) {
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

  getAvailablePermissions() {
    return [
      { id: 'view_listings', label: 'View Listings', category: 'Listings' },
      { id: 'create_listings', label: 'Create Listings', category: 'Listings' },
      { id: 'edit_listings', label: 'Edit All Listings', category: 'Listings' },
      { id: 'edit_own_listings', label: 'Edit Own Listings', category: 'Listings' },
      { id: 'delete_listings', label: 'Delete All Listings', category: 'Listings' },
      { id: 'delete_own_listings', label: 'Delete Own Listings', category: 'Listings' },
      { id: 'view_messages', label: 'View Messages', category: 'Communication' },
      { id: 'send_messages', label: 'Send Messages', category: 'Communication' },
      { id: 'manage_categories', label: 'Manage Categories', category: 'Administration' },
      { id: 'manage_users', label: 'Manage Users', category: 'Administration' },
      { id: 'view_analytics', label: 'View Analytics', category: 'Analytics' },
      { id: 'moderate_content', label: 'Moderate Content', category: 'Administration' },
      { id: 'manage_team', label: 'Manage Team', category: 'Team Management' },
      { id: 'manage_permissions', label: 'Manage Permissions', category: 'Team Management' },
      { id: 'manage_branding', label: 'Manage Branding', category: 'System' },
      { id: 'manage_system', label: 'Manage System', category: 'System' },
      { id: 'view_logs', label: 'View System Logs', category: 'System' },
      { id: 'manage_billing', label: 'Manage Billing', category: 'System' }
    ];
  }

  async applyRoleTemplate(id, role) {
    await delay(250);
    const permissions = this.getDefaultPermissions(role);
    return await this.updatePermissions(id, permissions);
  }
}

export default new TeamService();