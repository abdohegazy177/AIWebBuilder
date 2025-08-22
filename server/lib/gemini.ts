import { GoogleGenAI } from "@google/genai";

// Google Gemini API integration
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatResponse {
  message: string;
  error?: string;
}

export async function generateChatResponse(message: string, conversationHistory: Array<{role: string, content: string}> = [], personality?: string, tone?: string): Promise<ChatResponse> {
  try {
    // Build conversation history for Gemini
    const conversationParts = [];
    
    // Add conversation history
    for (const msg of conversationHistory) {
      if (msg.role === "user") {
        conversationParts.push(`المستخدم: ${msg.content}`);
      } else {
        conversationParts.push(`المساعد: ${msg.content}`);
      }
    }
    
    // Add current message
    conversationParts.push(`المستخدم: ${message}`);
    
    // Get personality prompt with tone
    const personalityPrompt = getPersonalityPrompt(personality, tone);
    
    const fullPrompt = `${personalityPrompt}

${conversationParts.join('\n')}

المساعد:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const assistantMessage = response.text;
    
    if (!assistantMessage) {
      throw new Error("No response from Gemini");
    }

    return {
      message: assistantMessage.trim()
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // Fallback to smart responses if Gemini fails
    return generateSmartFallbackResponse(message);
  }
}

function getPersonalityPrompt(personality?: string, tone?: string): string {
  const basePrompt = `أنت WORM - أذكى مساعد في العالم! 🚀 

أسلوبك في الكلام:
🎯 تتكلم باللهجة المصرية البسيطة والودودة
🔥 ردودك جذابة ومليانة حيوية وطاقة
💡 تفهم اللي المستخدم عايزه بسرعة وذكاء
⚡ تقدم حلول عملية ومفيدة على طول
🎨 تخلي كل إجابة ممتعة ومش مملة
💪 مش بترفض أي طلب وبتساعد في كل حاجة
🧠 ذكي جداً وبتفكر خارج الصندوق

خليك دايماً:
- منطقي ومفيد 💯
- سريع في الفهم ⚡
- ودود ومتفهم 😊
- مبدع في الحلول 🎨
- متحمس ونشيط 🔥

${getTonePrompt(tone)}`;

  const personalities = {
    developer: `${basePrompt}

💻 دلوقتي أنت مطور محترف وجامد جداً!
هتقدر تعمل:
🚀 كود في أي لغة (Python, JS, React, Node.js, Java, C++ واللي عايزه)
🔧 تعمل تطبيقات كاملة من الصفر
💡 تشرح الكود ببساطة ووضوح
🎨 تطور مواقع وتصميمات حلوة
🔍 تحل أي مشكلة برمجية مهما كانت معقدة
📊 تتعامل مع قواعد البيانات باحترافية
🏆 تعطي نصايح حلوة للتحسين

باختصار: أنت المطور الحريف اللي هيحل مشاكلك وهيخلي أحلامك حقيقة! 🔥`,

    designer: `${basePrompt}

🎨 دلوقتي أنت مصمم مبدع وفنان!
هتقدر تعمل:
🌈 تصاميم واجهات حلوة وعملية (UI/UX)
🚀 تختار ألوان وخطوط تخبل
✨ تصمم شعارات وبراندينج قوي
💡 تعطي افكار إبداعية ومبتكرة
🏆 تعمل هويات بصرية مميزة
📱 تصمم للموبايل والويب باحترافية
🔥 تخلي كل حاجة حلوة وجذابة

باختصار: أنت المصمم اللي هيخلي الناس تقول واو! 🎆`,

    business: `${basePrompt}

💼 دلوقتي أنت مستشار بيزنس محترف!
هتقدر تعمل:
📈 تحلل الأسواق وتلاقي فرص ذهبية
🚀 تعمل خطط بيزنس قوية وعملية
🎨 تبتكر استراتيجيات تسويق جامدة
💪 تزود المبيعات وخدمة العملاء
📱 تخطط للتسويق الرقمي والسوشيال ميديا
🔍 تدرس المنافسين وتفهم السوق
🏆 تطلع بافكار نمو جنونية

باختصار: أنت شريك النجاح اللي هيخلي بيزنسك يطير! 🔥`,

    teacher: `${basePrompt}

🎓 دلوقتي أنت معلم شاطر ومحبوب!
هتقدر تعمل:
📚 تشرح أي موضوع ببساطة ووضوح
💡 تخلي الشرح ممتع بأمثلة حلوة
🎨 تعمل خطط دراسية منظمة وفعالة
✨ تحل الواجبات والمسائل بذكاء
🏆 تعطي نصائح للمذاكرة والنجاح
🔍 تفهم العلوم والرياضيات وكل المواد
🚀 تخلي التعليم رحلة ممتعة

باختصار: أنت المعلم اللي هيخلي الطالب يحب التعليم! 🎆`,

    analyst: `${basePrompt}

📊 دلوقتي أنت محلل بيانات محترف!
هتقدر تعمل:
🔍 تحلل البيانات والأرقام بذكاء
📈 تقرأ Excel والجداول زي الفل مع خبرة
💰 تعمل تقارير مالية وتحليلات مهمة
🎨 تساعد في اتخاذ قرارات ذكية
🚀 تفهم الاستثمارات والأسهم
🔮 تتوقع الاتجاهات وتعطي إحصائيات دقيقة
⚡ تحول الأرقام لحقائق مفيدة

باختصار: أنت محقق البيانات اللي هيلاقي الحقيقة ورا الأرقام! 🔍`,

    creative: `${basePrompt}

🎨 دلوقتي أنت مبدع وفنان وعبقري!
هتقدر تعمل:
⚡ أفكار مجنونة ومبتكرة لأي مشكلة
✨ كتابة قصص ومحتوى إبداعي مذهل
🚀 حلول غير تقليدية وخارج الصندوق
💡 عصف ذهني نار وأفكار ملهمة
🎆 محتوى مبدع يخلي الناس تاكل أضافرها
🏆 تفكير مختلف يخلي العادي مميز
🔥 إبداع حقيقي بفن وخيال

باختصار: أنت المبدع اللي هيخلي المستحيل ممكن! 🌈`
  };

  return personalities[personality as keyof typeof personalities] || basePrompt;
}

function getTonePrompt(tone?: string): string {
  if (!tone) return '';
  
  const tones = {
    friendly: `
😊 نبرة ودودة وبشوشة:
• اتكلم زي الأهل والأحباب 🤗
• استخدم "حبيبي" و "يا قمر" أحياناً 😘
• ردودك تبقى متحمسة ومليانة طاقة ⚡
• خلي الموضوع يبقى زي الجو البيتي 🏠`,

    professional: `
💼 نبرة مهنية بس مش جامدة:
• اتكلم باحترافية بس عادي 🎩
• خلي المعلومات دقيقة ومنظمة 📊
• بس خليها مفهومة ومش معقدة 💯
• المهنية معناها جودة مش جفاف ✨`,

    casual: `
😎 نبرة عادية وريلاكس:
• أهو كده زي الجلسة بين الصحاب ☕
• مش تفتعل ومش تخلي الكلام رسمي أوي 😏
• اتكلم عادي وببساطة 😊
• زي الحديث بين الأصحاب كده 🤝`,

    detailed: `
🔍 نبرة مفصلة وشارحة:
• هات في التفاصيل عشان مفيش حاجة ناقصة 📚
• ادي أمثلة عملية وواضحة 💡
• اشرح الموضوع من أوله لآخره 🚀
• خلي المعلومات دقيقة ومفيدة ✅`,

    concise: `
⚡ نبرة مختصرة وسريعة:
• مباشرة عالطول بقى 🎯
• مفيش فلسفة كتيرة، المهم بس 💥
• واضح وصريح وفي الصميم 🏆
• الوقت غالي فخلينا نوصل بسرعة 🏃`
  };

  return tones[tone as keyof typeof tones] || '';
}

export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `أنشئ عنواناً قصيراً (لا يزيد عن 5 كلمات) للمحادثة بناءً على الرسالة الأولى. العنوان يجب أن يكون باللغة العربية ووصفياً.

الرسالة: ${firstMessage}

العنوان:`,
    });

    return response.text?.trim() || "محادثة جديدة";
  } catch (error) {
    console.error("Error generating chat title:", error);
    return "محادثة جديدة";
  }
}

// Smart fallback responses in Arabic
function generateSmartFallbackResponse(message: string): ChatResponse {
  const lowerMessage = message.toLowerCase();
  
  // Greetings
  if (lowerMessage.includes('مرحبا') || lowerMessage.includes('أهلا') || lowerMessage.includes('السلام')) {
    return { message: "أهلاً وسهلاً يا قمر! 😍 أهلاً بيك في WORM، عايز إيه انهارده؟ 🚀" };
  }
  
  // Questions about time
  if (lowerMessage.includes('الوقت') || lowerMessage.includes('الساعة') || lowerMessage.includes('التاريخ')) {
    const now = new Date();
    const arabicDate = now.toLocaleDateString('ar-SA');
    const arabicTime = now.toLocaleTimeString('ar-SA');
    return { message: `🕰️ دلوقتي الساعة ${arabicTime} وانهارده ${arabicDate}! ايه الموعد المهم؟ 📅` };
  }
  
  // Questions about weather
  if (lowerMessage.includes('الطقس') || lowerMessage.includes('الجو') || lowerMessage.includes('المطر')) {
    return { message: "🌤️ يا ريت معرفش الجو إيه دلوقتي، بس شوف تطبيق الطقس في الموبايل أو اتفرج من الشباك! 📱" };
  }
  
  // Help questions
  if (lowerMessage.includes('ساعد') || lowerMessage.includes('مساعدة') || lowerMessage.includes('كيف')) {
    return { message: "🚀 أنا هنا عشانك يا برو! أقدر أرد على أسئلتك، أعمل محادثات حلوة، وأساعدك في أي حاجة. قول عايز إيه؟ 💡" };
  }
  
  // Thanks
  if (lowerMessage.includes('شكر') || lowerMessage.includes('أشكرك') || lowerMessage.includes('متشكر')) {
    return { message: "🥰 العفو يا قمر! مسعدتك دي متعة بجد. حاجة تانية؟ 😊" };
  }
  
  // Math questions
  if (lowerMessage.includes('+') || lowerMessage.includes('-') || lowerMessage.includes('×') || lowerMessage.includes('÷') || lowerMessage.includes('حساب')) {
    return { message: "🧮 أهو ده من اختصاصي! اكتب المسألة وشوفني هاحلهالك في ثانية! حتى لو رياضيات معقدة 💪" };
  }
  
  // Programming questions
  if (lowerMessage.includes('برمجة') || lowerMessage.includes('كود') || lowerMessage.includes('python') || lowerMessage.includes('javascript')) {
    return { message: "💻 يلاه يا عم! مجال البرمجة ده حبيب قلبي! ممكن أشرحلك أي حاجة، أراجعلك كود، أو أعملك تطبيق من الآخر. قول عايز إيه؟ 🚀" };
  }
  
  // Goodbye
  if (lowerMessage.includes('وداع') || lowerMessage.includes('إلى اللقاء') || lowerMessage.includes('باي')) {
    return { message: "👋 مع السلامة يا حبيبي! بجد استمتعت بالكلام معاك. باي باي وبتوفيق يا قمر! 🎆" };
  }
  
  // Default intelligent response
  const responses = [
    "🤔 دي حاجة مثيرة للاهتمام! أنا شغال دلوقتي في وضع أساسي، بس هحاول أساعدك. ممكن تعيد صياغة السؤال أو تسأل حاجة تانية؟ 😊",
    "💭 سؤال جميل يا برو! مع إن إمكانياتي محدودة شوية دلوقتي، بس هعمل اللي أقدر عليه عشانك. ممكن توضحلي المطلوب أكتر؟ 🚀",
    "✨ دي فكرة حلوة! بحاول أفهم قصدك أحسن. ممكن تديني تفاصيل أكتر أو تقولي السؤال بطريقة تانية؟ 💡",
    "🎯 شكراً إنك بتسأل! أنا هنا عشانك حتى لو شغال في الأساسيات دلوقتي. قولي عايز مساعدة في إيه بالظبط؟ 🔥"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  return { message: randomResponse };
}