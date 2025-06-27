import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/atoms/ErrorState';
import teamService from '@/services/api/teamService';
import userService from '@/services/api/userService';

const TeamManager = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'user'
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadTeamMembers();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const members = await teamService.getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      setError(error.message);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    
    if (!inviteForm.email || !inviteForm.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setInviteLoading(true);
      await teamService.inviteMember({
        ...inviteForm,
        invitedBy: currentUser?.Id
      });
      
      toast.success('Team member invited successfully');
      setShowInviteModal(false);
      setInviteForm({ email: '', name: '', role: 'user' });
      loadTeamMembers();
    } catch (error) {
      toast.error(error.message || 'Failed to invite team member');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await teamService.updateMemberRole(memberId, newRole);
      toast.success('Member role updated successfully');
      loadTeamMembers();
    } catch (error) {
      toast.error(error.message || 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    try {
      await teamService.removeMember(memberId);
      toast.success('Team member removed successfully');
      loadTeamMembers();
    } catch (error) {
      toast.error(error.message || 'Failed to remove team member');
    }
  };

  const handleResendInvitation = async (memberId, memberEmail) => {
    try {
      await teamService.resendInvitation(memberId);
      toast.success(`Invitation resent to ${memberEmail}`);
    } catch (error) {
      toast.error(error.message || 'Failed to resend invitation');
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const canManageRole = (memberRole) => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'admin' && memberRole !== 'super_admin') return true;
    return false;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-surface-200 rounded w-64 animate-pulse" />
        <div className="bg-white rounded-lg border border-surface-200 p-6">
          <SkeletonLoader count={5} height="h-16" />
        </div>
      </div>
    );
  }

  if (error && teamMembers.length === 0) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Failed to load team members"
          message={error}
          actionLabel="Try Again"
          onAction={loadTeamMembers}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Team Management</h1>
          <p className="text-surface-600">
            Manage team members, roles, and permissions
          </p>
        </div>
        <Button 
          icon="UserPlus"
          onClick={() => setShowInviteModal(true)}
        >
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Total Members',
            value: teamMembers.length,
            icon: 'Users',
            color: 'text-primary',
            bgColor: 'bg-primary/10'
          },
          {
            title: 'Active Members',
            value: teamMembers.filter(m => m.status === 'active').length,
            icon: 'UserCheck',
            color: 'text-success',
            bgColor: 'bg-success/10'
          },
          {
            title: 'Pending Invitations',
            value: teamMembers.filter(m => m.status === 'pending').length,
            icon: 'Clock',
            color: 'text-warning',
            bgColor: 'bg-warning/10'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-surface-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <ApperIcon name={stat.icon} size={24} className={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Team Members List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-surface-200"
      >
        <div className="p-6 border-b border-surface-200">
          <h3 className="text-lg font-semibold text-surface-900">Team Members</h3>
        </div>
        
        <div className="divide-y divide-surface-200">
          {teamMembers.map((member) => (
            <div key={member.Id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="User" size={20} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-surface-900">{member.name}</h4>
                    <Badge variant={getRoleBadgeVariant(member.role)} size="sm">
                      {member.role.replace('_', ' ')}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(member.status)} size="sm">
                      {member.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-surface-600">{member.email}</p>
                  {member.joinedAt && (
                    <p className="text-xs text-surface-500">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {member.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon="Send"
                    onClick={() => handleResendInvitation(member.Id, member.email)}
                  >
                    Resend
                  </Button>
                )}
                
                {canManageRole(member.role) && member.Id !== currentUser?.Id && (
                  <>
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.Id, e.target.value)}
                      className="px-3 py-1.5 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      {currentUser?.role === 'super_admin' && (
                        <option value="super_admin">Super Admin</option>
                      )}
                    </select>
                    
                    <Button
                      size="sm"
                      variant="error"
                      icon="Trash2"
                      onClick={() => handleRemoveMember(member.Id, member.name)}
                    >
                      Remove
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg w-full max-w-md"
          >
            <div className="p-6 border-b border-surface-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-surface-900">
                  Invite Team Member
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleInviteMember} className="p-6 space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="member@example.com"
                required
              />

              <Input
                label="Full Name (Optional)"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                placeholder="John Doe"
              />

              <div>
                <label className="block text-sm font-medium text-surface-900 mb-2">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  {currentUser?.role === 'super_admin' && (
                    <option value="super_admin">Super Admin</option>
                  )}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={inviteLoading}
                  icon="Send"
                >
                  Send Invitation
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;