import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSessionSchema, insertMessageSchema } from "@shared/schema";
import { generateChatResponse, generateChatTitle } from "./lib/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all chat sessions
  app.get("/api/chat-sessions", async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  // Create new chat session
  app.post("/api/chat-sessions", async (req, res) => {
    try {
      const data = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(data);
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(400).json({ message: "Invalid chat session data" });
    }
  });

  // Get specific chat session
  app.get("/api/chat-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ message: "Failed to fetch chat session" });
    }
  });

  // Delete chat session
  app.delete("/api/chat-sessions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChatSession(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      res.json({ message: "Chat session deleted successfully" });
    } catch (error) {
      console.error("Error deleting chat session:", error);
      res.status(500).json({ message: "Failed to delete chat session" });
    }
  });

  // Get messages for a chat session
  app.get("/api/chat-sessions/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
  app.post("/api/chat-sessions/:id/messages", async (req, res) => {
    try {
      const { content } = req.body;
      const chatSessionId = req.params.id;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Verify chat session exists
      const session = await storage.getChatSession(chatSessionId);
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        chatSessionId,
        content,
        role: "user"
      });

      // Get conversation history for context
      const messages = await storage.getMessages(chatSessionId);
      const conversationHistory = messages
        .filter(msg => msg.id !== userMessage.id) // Exclude the just-added message
        .map(msg => ({ role: msg.role, content: msg.content }));

      // Generate AI response
      const aiResponse = await generateChatResponse(content, conversationHistory);
      
      if (aiResponse.error) {
        return res.status(500).json({ 
          message: "Failed to generate AI response",
          error: aiResponse.error 
        });
      }

      // Save AI response
      const assistantMessage = await storage.createMessage({
        chatSessionId,
        content: aiResponse.message,
        role: "assistant"
      });

      // If this is the first message, update chat session title
      if (messages.length === 0) {
        const title = await generateChatTitle(content);
        await storage.updateChatSession(chatSessionId, { title });
      }

      // Update session's updatedAt timestamp
      await storage.updateChatSession(chatSessionId, { updatedAt: new Date() });

      res.json({
        userMessage,
        assistantMessage
      });

    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
