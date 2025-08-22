import OpenAI from 'openai';
import Replicate from 'replicate';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY!,
});

export interface ImageGenerationRequest {
  prompt: string;
  model?: 'dall-e-3' | 'stable-diffusion';
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  style?: 'natural' | 'vivid';
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  model: string;
}

export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  const { prompt, model = 'dall-e-3', size = '1024x1024', style = 'vivid' } = request;
  
  try {
    if (model === 'dall-e-3') {
      return await generateWithDALLE(prompt, size, style);
    } else {
      return await generateWithStableDiffusion(prompt);
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في إنشاء الصورة',
      model,
    };
  }
}

async function generateWithDALLE(
  prompt: string, 
  size: string, 
  style: string
): Promise<ImageGenerationResponse> {
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Create a high-quality image: ${prompt}`,
      size: size as any,
      style: style as any,
      quality: 'hd',
      n: 1,
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('لم يتم إنشاء صورة');
    }

    return {
      success: true,
      imageUrl,
      model: 'DALL-E 3',
    };
  } catch (error) {
    console.error('DALL-E generation error:', error);
    throw error;
  }
}

async function generateWithStableDiffusion(prompt: string): Promise<ImageGenerationResponse> {
  try {
    const output = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt: `${prompt}, high quality, detailed, professional photography`,
          width: 1024,
          height: 1024,
          num_inference_steps: 50,
          guidance_scale: 7.5,
        }
      }
    ) as string[];

    const imageUrl = output[0];
    if (!imageUrl) {
      throw new Error('لم يتم إنشاء صورة من Stable Diffusion');
    }

    return {
      success: true,
      imageUrl,
      model: 'Stable Diffusion',
    };
  } catch (error) {
    console.error('Stable Diffusion generation error:', error);
    throw error;
  }
}

// Helper function to detect if user wants to generate an image
export function detectImageRequest(message: string): boolean {
  const imageKeywords = [
    'صورة', 'اعمل صورة', 'ارسم', 'صمم', 'إنشاء صورة', 'اعمل لي صورة',
    'generate image', 'create image', 'draw', 'make picture', 'design',
    'صور', 'رسمة', 'تصميم', 'اطلع صورة', 'عاوز صورة'
  ];
  
  const lowerMessage = message.toLowerCase();
  return imageKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Extract image prompt from user message
export function extractImagePrompt(message: string): string {
  // Remove common image request phrases to get the core prompt
  const cleanPrompt = message
    .replace(/اعمل صورة|اعمل لي صورة|ارسم|صمم|إنشاء صورة|generate image|create image|draw|make picture/gi, '')
    .replace(/عن|of|for|من|بـ|ل|للـ/gi, '')
    .trim();
    
  return cleanPrompt || message;
}