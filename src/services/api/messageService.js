import messagesData from '../mockData/messages.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class MessageService {
  constructor() {
    this.messages = [...messagesData];
    this.lastId = Math.max(...this.messages.map(m => m.Id), 0);
  }

  async getAll() {
    await delay(200);
    return [...this.messages];
  }

  async getById(id) {
    await delay(150);
    const message = this.messages.find(msg => msg.Id === parseInt(id, 10));
    if (!message) {
      throw new Error('Message not found');
    }
    return { ...message };
  }

  async getByThreadId(threadId) {
    await delay(200);
    return this.messages
      .filter(msg => msg.threadId === threadId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(msg => ({ ...msg }));
  }

  async getInbox(userId) {
    await delay(250);
    const userMessages = this.messages.filter(msg => 
      msg.recipientId === parseInt(userId, 10) || 
      (msg.type === 'group' && msg.senderId !== parseInt(userId, 10))
    );

    // Group by thread for inbox view
    const threads = {};
    userMessages.forEach(msg => {
      if (!threads[msg.threadId]) {
        threads[msg.threadId] = {
          threadId: msg.threadId,
          messages: [],
          unreadCount: 0,
          lastMessage: null
        };
      }
      threads[msg.threadId].messages.push({ ...msg });
      if (msg.status === 'unread') {
        threads[msg.threadId].unreadCount++;
      }
    });

    // Set last message for each thread
    Object.values(threads).forEach(thread => {
      thread.lastMessage = thread.messages.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
    });

    return Object.values(threads).sort((a, b) => 
      new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );
  }

  async getSentMessages(userId) {
    await delay(200);
    return this.messages
      .filter(msg => msg.senderId === parseInt(userId, 10))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(msg => ({ ...msg }));
  }

  async create(messageData) {
    await delay(300);
    const newMessage = {
      Id: ++this.lastId,
      threadId: messageData.threadId || `thread_${this.lastId}`,
      senderId: parseInt(messageData.senderId, 10),
      recipientId: messageData.recipientId ? parseInt(messageData.recipientId, 10) : null,
      subject: messageData.subject,
      content: messageData.content,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      type: messageData.type || 'direct',
      attachments: messageData.attachments || [],
      isSystemMessage: false
    };

    this.messages.push(newMessage);
    return { ...newMessage };
  }

  async update(id, updateData) {
    await delay(250);
    const index = this.messages.findIndex(msg => msg.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Message not found');
    }

    this.messages[index] = {
      ...this.messages[index],
      ...updateData,
      Id: parseInt(id, 10) // Prevent ID modification
    };

    return { ...this.messages[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.messages.findIndex(msg => msg.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Message not found');
    }

    const deletedMessage = this.messages.splice(index, 1)[0];
    return { ...deletedMessage };
  }

  async markAsRead(id) {
    await delay(150);
    return this.update(id, { status: 'read' });
  }

  async markAsUnread(id) {
    await delay(150);
    return this.update(id, { status: 'unread' });
  }

  async searchMessages(userId, query) {
    await delay(300);
    const userMessages = this.messages.filter(msg => 
      msg.recipientId === parseInt(userId, 10) || 
      msg.senderId === parseInt(userId, 10) ||
      (msg.type === 'group' && msg.senderId !== parseInt(userId, 10))
    );

    const searchTerm = query.toLowerCase();
    return userMessages
      .filter(msg => 
        msg.subject.toLowerCase().includes(searchTerm) ||
        msg.content.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(msg => ({ ...msg }));
  }

  async getUnreadCount(userId) {
    await delay(100);
    return this.messages.filter(msg => 
      (msg.recipientId === parseInt(userId, 10) || 
       (msg.type === 'group' && msg.senderId !== parseInt(userId, 10))) &&
      msg.status === 'unread'
    ).length;
  }

  async createGroupMessage(senderId, subject, content, attachments = []) {
    return this.create({
      threadId: 'group_general',
      senderId,
      recipientId: null,
      subject,
      content,
      type: 'group',
      attachments
    });
  }
}

export default new MessageService();