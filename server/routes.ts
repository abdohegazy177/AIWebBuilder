import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSessionSchema, insertMessageSchema, generateImageSchema, generateVideoSchema } from "@shared/schema";
import { generateChatResponse, generateChatTitle } from "./lib/gemini";
import { generateImage, detectImageRequest, extractImagePrompt, type ImageGenerationRequest } from "./lib/image-generation";
import { generateVideo, detectVideoRequest, extractVideoPrompt, checkVideoStatus, type VideoGenerationRequest } from "./lib/video-generation";

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
      const { content, personality, tone } = req.body;
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
        role: "user",
        messageType: 'text'
      });

      // Get conversation history for context
      const messages = await storage.getMessages(chatSessionId);
      const conversationHistory = messages
        .filter(msg => msg.id !== userMessage.id) // Exclude the just-added message
        .map(msg => ({ role: msg.role, content: msg.content }));

      // Check if user wants to generate image or video
      let aiResponse;
      let mediaUrl = null;
      let messageType = 'text';
      let mediaPrompt = null;
      
      if (detectImageRequest(content)) {
        // Handle image generation
        const imagePrompt = extractImagePrompt(content);
        const imageResult = await generateImage({ prompt: imagePrompt });
        
        if (imageResult.success && imageResult.imageUrl) {
          mediaUrl = imageResult.imageUrl;
          messageType = 'image';
          mediaPrompt = imagePrompt;
          aiResponse = {
            message: `🎨 تم! اتفضل الصورة الجميلة دي! استخدمت ${imageResult.model} عشان أطلعهالك حلوة أوي 😍\n\nالوصف: ${imagePrompt}`
          };
        } else {
          aiResponse = {
            message: `😅 آسف يا حبيبي، مقدرتش أعمل الصورة دلوقتي. ${imageResult.error || 'جرب تاني بعد شوية!'}`
          };
        }
      } else if (detectVideoRequest(content)) {
        // Handle video generation
        const videoPrompt = extractVideoPrompt(content);
        const videoResult = await generateVideo({ prompt: videoPrompt });
        
        if (videoResult.success) {
          if (videoResult.videoUrl) {
            mediaUrl = videoResult.videoUrl;
            messageType = 'video';
            mediaPrompt = videoPrompt;
            aiResponse = {
              message: `🎬 يلا! الفيديو جاهز! استخدمت ${videoResult.model} عشان أعملهولك حلو أوي 🔥\n\nالوصف: ${videoPrompt}`
            };
          } else if (videoResult.jobId) {
            aiResponse = {
              message: `⏳ الفيديو بيتعمل دلوقتي يا برو! هياخد دقيقة أو اتنين. استخدمت ${videoResult.model} عشان أطلعهولك جامد 🚀\n\nالوصف: ${videoPrompt}`
            };
          }
        } else {
          aiResponse = {
            message: `😅 آسف يا حبيبي، مقدرتش أعمل الفيديو دلوقتي. ${videoResult.error || 'جرب تاني بعد شوية!'}`
          };
        }
      } else {
        // Generate regular chat response
        aiResponse = await generateChatResponse(content, conversationHistory, personality, tone);
      }
      
      if (!aiResponse) {
        throw new Error("Failed to generate response");
      }
      
      if (aiResponse.error) {
        return res.status(500).json({ 
          message: "Failed to generate AI response",
          error: aiResponse.error 
        });
      }

      // Save AI response with media if present
      const assistantMessage = await storage.createMessage({
        chatSessionId,
        content: aiResponse.message,
        role: "assistant",
        messageType,
        mediaUrl,
        mediaPrompt
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

  // Image generation endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      const data = generateImageSchema.parse(req.body);
      const imageRequest: ImageGenerationRequest = {
        prompt: data.prompt,
        model: data.model === 'firefly' ? 'dall-e-3' : data.model,
        size: data.size,
        style: data.style
      };
      const result = await generateImage(imageRequest);
      
      if (result.success) {
        res.json({ success: true, imageUrl: result.imageUrl, model: result.model });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(400).json({ success: false, error: "Invalid request data" });
    }
  });

  // Video generation endpoint
  app.post("/api/generate-video", async (req, res) => {
    try {
      const data = generateVideoSchema.parse(req.body);
      const videoRequest: VideoGenerationRequest = {
        prompt: data.prompt,
        model: data.model === 'pika-2.2' ? 'replicate-video' : data.model,
        duration: data.duration,
        aspectRatio: data.aspectRatio
      };
      const result = await generateVideo(videoRequest);
      
      if (result.success) {
        res.json({ 
          success: true, 
          videoUrl: result.videoUrl, 
          model: result.model,
          jobId: result.jobId 
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error("Error generating video:", error);
      res.status(400).json({ success: false, error: "Invalid request data" });
    }
  });

  // Check video status endpoint
  app.get("/api/video-status/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const { model } = req.query;
      
      if (!model || typeof model !== 'string') {
        return res.status(400).json({ success: false, error: "Model parameter required" });
      }
      
      const result = await checkVideoStatus(jobId, model);
      
      if (result.success) {
        res.json({ 
          success: true, 
          videoUrl: result.videoUrl, 
          model: result.model 
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error("Error checking video status:", error);
      res.status(500).json({ success: false, error: "Failed to check status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
