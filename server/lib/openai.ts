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
    
    // Fallback smart responses when API fails
    return generateSmartFallbackResponse(message);
  }
}

// Smart fallback responses in Arabic
function generateSmartFallbackResponse(message: string): ChatResponse {
  const lowerMessage = message.toLowerCase();
  
  // Greetings
  if (lowerMessage.includes('مرحبا') || lowerMessage.includes('أهلا') || lowerMessage.includes('السلام')) {
    return { message: "مرحباً بك! أهلاً وسهلاً، كيف يمكنني مساعدتك اليوم؟" };
  }
  
  // Questions about time
  if (lowerMessage.includes('الوقت') || lowerMessage.includes('الساعة') || lowerMessage.includes('التاريخ')) {
    const now = new Date();
    const arabicDate = now.toLocaleDateString('ar-SA');
    const arabicTime = now.toLocaleTimeString('ar-SA');
    return { message: `الوقت الحالي هو ${arabicTime} والتاريخ هو ${arabicDate}` };
  }
  
  // Questions about weather
  if (lowerMessage.includes('الطقس') || lowerMessage.includes('الجو') || lowerMessage.includes('المطر')) {
    return { message: "آسف، لا أستطيع الوصول لمعلومات الطقس حالياً، ولكن يمكنك مراجعة تطبيق الطقس في هاتفك أو موقع الأرصاد الجوية." };
  }
  
  // Help questions
  if (lowerMessage.includes('ساعد') || lowerMessage.includes('مساعدة') || lowerMessage.includes('كيف')) {
    return { message: "أنا هنا لمساعدتك! يمكنني الإجابة على أسئلتك، إجراء محادثات، وتقديم المعلومات. ما الذي تحتاج مساعدة فيه تحديداً؟" };
  }
  
  // Thanks
  if (lowerMessage.includes('شكر') || lowerMessage.includes('أشكرك') || lowerMessage.includes('متشكر')) {
    return { message: "عفواً! أسعدني أن أساعدك. هل تحتاج أي شيء آخر؟" };
  }
  
  // Math questions
  if (lowerMessage.includes('+') || lowerMessage.includes('-') || lowerMessage.includes('×') || lowerMessage.includes('÷') || lowerMessage.includes('حساب')) {
    return { message: "يمكنني مساعدتك في العمليات الحسابية البسيطة. اكتب المسألة الرياضية بوضوح وسأحاول حلها لك." };
  }
  
  // Programming questions
  if (lowerMessage.includes('برمجة') || lowerMessage.includes('كود') || lowerMessage.includes('python') || lowerMessage.includes('javascript')) {
    return { message: "أحب مساعدتك في البرمجة! يمكنني شرح المفاهيم، مراجعة الكود، واقتراح حلول للمشاكل البرمجية. ما السؤال تحديداً؟" };
  }
  
  // Goodbye
  if (lowerMessage.includes('وداع') || lowerMessage.includes('إلى اللقاء') || lowerMessage.includes('باي')) {
    return { message: "إلى اللقاء! كان من دواعي سروري التحدث معك. أتمنى لك يوماً سعيداً!" };
  }
  
  // Default intelligent response
  const responses = [
    "هذا سؤال مثير للاهتمام! بحكم أنني أعمل حالياً في وضع محدود، قد تكون إجابتي بسيطة. يمكنك إعادة صياغة السؤال أو طرح شيء آخر؟",
    "أقدر سؤالك! أعمل حالياً بإمكانيات محدودة، لكنني سأبذل قصارى جهدي لمساعدتك. هل يمكنك توضيح المطلوب أكثر؟",
    "سؤال رائع! أحاول فهم ما تقصده بشكل أفضل. هل يمكنك إعطائي تفاصيل أكثر أو إعادة صياغة السؤال؟",
    "شكراً لك على سؤالك! أعمل حالياً في وضع أساسي، لكنني موجود لمساعدتك قدر الإمكان. ما الذي تحتاج المساعدة فيه تحديداً؟"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  return { message: randomResponse };
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
