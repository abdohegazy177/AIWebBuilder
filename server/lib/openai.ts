import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  message: string;
  error?: string;
}

export async function generateChatResponse(message: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<ChatResponse> {
  try {
    const messages = [
      {
        role: "system" as const,
        content: "أنت مساعد ذكي مفيد ومتعاون. تجيب باللغة العربية بشكل واضح ومفصل. كن مهذباً ومساعداً في جميع الأوقات."
      },
      ...conversationHistory.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      {
        role: "user" as const,
        content: message
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0]?.message?.content;
    
    if (!assistantMessage) {
      throw new Error("No response from OpenAI");
    }

    return {
      message: assistantMessage
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return {
      message: "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "أنشئ عنواناً قصيراً (لا يزيد عن 5 كلمات) للمحادثة بناءً على الرسالة الأولى. العنوان يجب أن يكون باللغة العربية ووصفياً."
        },
        {
          role: "user",
          content: firstMessage
        }
      ],
      max_tokens: 20,
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || "محادثة جديدة";
  } catch (error) {
    console.error("Error generating chat title:", error);
    return "محادثة جديدة";
  }
}
