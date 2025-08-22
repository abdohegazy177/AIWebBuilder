import { type User, type InsertUser, type ChatSession, type InsertChatSession, type Message, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getChatSessions(userId?: string): Promise<ChatSession[]>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  deleteChatSession(id: string): Promise<boolean>;
  
  getMessages(chatSessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessages(chatSessionId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatSessions: Map<string, ChatSession>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
    this.messages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getChatSessions(userId?: string): Promise<ChatSession[]> {
    const sessions = Array.from(this.chatSessions.values());
    if (userId) {
      return sessions.filter(session => session.userId === userId);
    }
    return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const now = new Date();
    const session: ChatSession = { 
      ...insertSession, 
      userId: insertSession.userId || null,
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { 
      ...session, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteChatSession(id: string): Promise<boolean> {
    const deleted = this.chatSessions.delete(id);
    // Also delete associated messages
    if (deleted) {
      await this.deleteMessages(id);
    }
    return deleted;
  }

  async getMessages(chatSessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatSessionId === chatSessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage,
      messageType: insertMessage.messageType || 'text',
      mediaUrl: insertMessage.mediaUrl || null,
      mediaPrompt: insertMessage.mediaPrompt || null,
      id, 
      createdAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async deleteMessages(chatSessionId: string): Promise<boolean> {
    const messagesToDelete = Array.from(this.messages.entries())
      .filter(([_, message]) => message.chatSessionId === chatSessionId);
    
    messagesToDelete.forEach(([id]) => {
      this.messages.delete(id);
    });
    
    return messagesToDelete.length > 0;
  }
}

export const storage = new MemStorage();
