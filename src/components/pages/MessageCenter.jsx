import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/atoms/ErrorState';
import EmptyState from '@/components/atoms/EmptyState';
import messageService from '@/services/api/messageService';
import teamService from '@/services/api/teamService';
import userService from '@/services/api/userService';

const MessageCenter = () => {
  const [activeView, setActiveView] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Compose form state
  const [composeForm, setComposeForm] = useState({
    recipientId: '',
    subject: '',
    content: '',
    type: 'direct'
  });
  const [composeLoading, setComposeLoading] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadTeamMembers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadInbox();
      loadUnreadCount();
    }
  }, [currentUser]);

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
      const members = await teamService.getActiveMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const loadInbox = async () => {
    try {
      setLoading(true);
      setError(null);
      const inboxThreads = await messageService.getInbox(currentUser.Id);
      setThreads(inboxThreads);
    } catch (error) {
      setError(error.message);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount(currentUser.Id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadThreadMessages = async (threadId) => {
    try {
      const messages = await messageService.getByThreadId(threadId);
      setThreadMessages(messages);
      setSelectedThread(threadId);

      // Mark messages as read
      const unreadMessages = messages.filter(msg => 
        msg.recipientId === currentUser.Id && msg.status === 'unread'
      );
      
      for (const msg of unreadMessages) {
        await messageService.markAsRead(msg.Id);
      }
      
      if (unreadMessages.length > 0) {
        loadInbox();
        loadUnreadCount();
      }
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!composeForm.content.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (composeForm.type === 'direct' && !composeForm.recipientId) {
      toast.error('Please select a recipient');
      return;
    }

    try {
      setComposeLoading(true);
      
      if (composeForm.type === 'group') {
        await messageService.createGroupMessage(
          currentUser.Id,
          composeForm.subject || 'Group Message',
          composeForm.content
        );
      } else {
        await messageService.create({
          senderId: currentUser.Id,
          recipientId: composeForm.recipientId,
          subject: composeForm.subject || 'Direct Message',
          content: composeForm.content,
          type: composeForm.type
        });
      }

      toast.success('Message sent successfully');
      setShowCompose(false);
      setComposeForm({
        recipientId: '',
        subject: '',
        content: '',
        type: 'direct'
      });
      
      loadInbox();
    } catch (error) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setComposeLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadInbox();
      return;
    }

    try {
      const results = await messageService.searchMessages(currentUser.Id, searchQuery);
      setMessages(results);
      setActiveView('search');
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const getTeamMemberName = (memberId) => {
    const member = teamMembers.find(m => m.Id === memberId);
    return member ? member.name : 'Unknown User';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-surface-200 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
          <div className="bg-white rounded-lg border border-surface-200 p-4">
            <SkeletonLoader count={5} height="h-16" />
          </div>
          <div className="lg:col-span-2 bg-white rounded-lg border border-surface-200 p-4">
            <SkeletonLoader count={8} height="h-12" />
          </div>
        </div>
      </div>
    );
  }

  if (error && threads.length === 0) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Failed to load messages"
          message={error}
          actionLabel="Try Again"
          onAction={loadInbox}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Message Center</h1>
          <p className="text-surface-600">
            Team communication and notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pr-10"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-100 rounded"
            >
              <ApperIcon name="Search" size={16} />
            </button>
          </div>
          <Button 
            icon="PenTool"
            onClick={() => setShowCompose(true)}
          >
            Compose
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Unread Messages',
            value: unreadCount,
            icon: 'Mail',
            color: 'text-primary',
            bgColor: 'bg-primary/10'
          },
          {
            title: 'Total Threads',
            value: threads.length,
            icon: 'MessageCircle',
            color: 'text-success',
            bgColor: 'bg-success/10'
          },
          {
            title: 'Team Members',
            value: teamMembers.length,
            icon: 'Users',
            color: 'text-warning',
            bgColor: 'bg-warning/10'
          },
          {
            title: 'Active Today',
            value: threads.filter(t => {
              const today = new Date().toDateString();
              return new Date(t.lastMessage.timestamp).toDateString() === today;
            }).length,
            icon: 'Clock',
            color: 'text-info',
            bgColor: 'bg-info/10'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-surface-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-600 mb-1">{stat.title}</p>
                <p className="text-xl font-bold text-surface-900">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <ApperIcon name={stat.icon} size={20} className={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Thread List */}
        <div className="bg-white rounded-lg border border-surface-200">
          <div className="p-4 border-b border-surface-200">
            <h3 className="font-semibold text-surface-900">
              {activeView === 'search' ? 'Search Results' : 'Conversations'}
            </h3>
          </div>
          
          <div className="overflow-y-auto h-80">
            {activeView === 'search' ? (
              messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.Id}
                    className="p-4 border-b border-surface-100 hover:bg-surface-50 cursor-pointer"
                    onClick={() => loadThreadMessages(message.threadId)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <ApperIcon name="User" size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-surface-900 truncate">
                            {getTeamMemberName(message.senderId)}
                          </p>
                          <p className="text-xs text-surface-500">
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-surface-700 truncate mb-1">
                          {message.subject}
                        </p>
                        <p className="text-xs text-surface-600 truncate">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No results found"
                  message="Try adjusting your search terms"
                  icon="Search"
                />
              )
            ) : (
              threads.length > 0 ? (
                threads.map((thread) => (
                  <div
                    key={thread.threadId}
                    className={`p-4 border-b border-surface-100 hover:bg-surface-50 cursor-pointer ${
                      selectedThread === thread.threadId ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => loadThreadMessages(thread.threadId)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <ApperIcon 
                          name={thread.lastMessage.type === 'group' ? 'Users' : 'User'} 
                          size={16} 
                          className="text-primary" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-surface-900 truncate">
                            {thread.lastMessage.type === 'group' 
                              ? 'Team Discussion' 
                              : getTeamMemberName(thread.lastMessage.senderId === currentUser.Id 
                                  ? thread.lastMessage.recipientId 
                                  : thread.lastMessage.senderId)
                            }
                          </p>
                          <div className="flex items-center gap-2">
                            {thread.unreadCount > 0 && (
                              <Badge variant="primary" size="sm">
                                {thread.unreadCount}
                              </Badge>
                            )}
                            <p className="text-xs text-surface-500">
                              {formatTimestamp(thread.lastMessage.timestamp)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-surface-700 truncate mb-1">
                          {thread.lastMessage.subject}
                        </p>
                        <p className="text-xs text-surface-600 truncate">
                          {thread.lastMessage.senderId === currentUser.Id ? 'You: ' : ''}
                          {thread.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No conversations yet"
                  message="Start a new conversation with your team"
                  icon="MessageCircle"
                />
              )
            )}
          </div>
        </div>

        {/* Message View */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-surface-200">
          {selectedThread ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-surface-200">
                <h3 className="font-semibold text-surface-900">
                  {threadMessages.length > 0 && threadMessages[0].type === 'group'
                    ? 'Team Discussion'
                    : 'Direct Message'
                  }
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {threadMessages.map((message) => (
                  <div
                    key={message.Id}
                    className={`flex ${
                      message.senderId === currentUser.Id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                        message.senderId === currentUser.Id
                          ? 'bg-primary text-white'
                          : 'bg-surface-100 text-surface-900'
                      }`}
                    >
                      {message.senderId !== currentUser.Id && (
                        <p className="text-xs font-medium mb-1">
                          {getTeamMemberName(message.senderId)}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.senderId === currentUser.Id
                          ? 'text-white/70'
                          : 'text-surface-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-surface-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const content = formData.get('content');
                    if (content.trim()) {
                      messageService.create({
                        threadId: selectedThread,
                        senderId: currentUser.Id,
                        recipientId: threadMessages[0]?.type === 'group' ? null : 
                          threadMessages[0]?.senderId === currentUser.Id ? 
                          threadMessages[0]?.recipientId : threadMessages[0]?.senderId,
                        subject: 'Re: ' + (threadMessages[0]?.subject || 'Message'),
                        content,
                        type: threadMessages[0]?.type || 'direct'
                      }).then(() => {
                        loadThreadMessages(selectedThread);
                        e.target.reset();
                        toast.success('Message sent');
                      }).catch(() => {
                        toast.error('Failed to send message');
                      });
                    }
                  }}
                  className="flex gap-2"
                >
                  <Input
                    name="content"
                    placeholder="Type your message..."
                    className="flex-1"
                    required
                  />
                  <Button type="submit" icon="Send">
                    Send
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <EmptyState
                title="Select a conversation"
                message="Choose a conversation to start messaging"
                icon="MessageCircle"
              />
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-lg w-full max-w-md"
            >
              <div className="p-6 border-b border-surface-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-surface-900">
                    Compose Message
                  </h3>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendMessage} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-900 mb-2">
                    Message Type
                  </label>
                  <select
                    value={composeForm.type}
                    onChange={(e) => setComposeForm({ ...composeForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="direct">Direct Message</option>
                    <option value="group">Group Message</option>
                  </select>
                </div>

                {composeForm.type === 'direct' && (
                  <div>
                    <label className="block text-sm font-medium text-surface-900 mb-2">
                      Recipient
                    </label>
                    <select
                      value={composeForm.recipientId}
                      onChange={(e) => setComposeForm({ ...composeForm, recipientId: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select recipient...</option>
                      {teamMembers
                        .filter(member => member.Id !== currentUser?.Id)
                        .map(member => (
                        <option key={member.Id} value={member.Id}>
                          {member.name} ({member.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Input
                  label="Subject"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  placeholder="Message subject..."
                />

                <div>
                  <label className="block text-sm font-medium text-surface-900 mb-2">
                    Message
                  </label>
                  <textarea
                    value={composeForm.content}
                    onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCompose(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    loading={composeLoading}
                    icon="Send"
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageCenter;