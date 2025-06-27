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
}

export default new TeamService();