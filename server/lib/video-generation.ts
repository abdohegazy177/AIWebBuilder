import fetch from 'node-fetch';

export interface VideoGenerationRequest {
  prompt: string;
  model?: 'runway-gen4' | 'replicate-video';
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
  model: string;
  jobId?: string;
}

export async function generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
  const { prompt, model = 'runway-gen4', duration = 4, aspectRatio = '16:9' } = request;
  
  try {
    if (model === 'runway-gen4') {
      return await generateWithRunway(prompt, duration, aspectRatio);
    } else {
      return await generateWithReplicate(prompt, duration);
    }
  } catch (error) {
    console.error('Video generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في إنشاء الفيديو',
      model,
    };
  }
}

async function generateWithRunway(
  prompt: string, 
  duration: number,
  aspectRatio: string
): Promise<VideoGenerationResponse> {
  try {
    const response = await fetch('https://api.runwayml.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gen4_turbo',
        prompt: `Create a high-quality video: ${prompt}`,
        duration: duration,
        aspect_ratio: aspectRatio,
        motion_strength: 'medium',
      }),
    });

    if (!response.ok) {
      throw new Error(`Runway API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (data.status === 'processing') {
      return {
        success: true,
        model: 'RunwayML Gen-4',
        jobId: data.id,
      };
    }

    return {
      success: true,
      videoUrl: data.output?.url,
      model: 'RunwayML Gen-4',
    };
  } catch (error) {
    console.error('Runway generation error:', error);
    throw error;
  }
}

async function generateWithReplicate(prompt: string, duration: number): Promise<VideoGenerationResponse> {
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
        input: {
          prompt: `${prompt}, high quality, cinematic, detailed`,
          fps: 24,
          width: 1024,
          height: 576,
          num_frames: duration * 24, // 24 fps
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const data = await response.json() as any;

    return {
      success: true,
      model: 'Replicate Video',
      jobId: data.id,
    };
  } catch (error) {
    console.error('Replicate video generation error:', error);
    throw error;
  }
}

// Helper function to detect if user wants to generate a video
export function detectVideoRequest(message: string): boolean {
  const videoKeywords = [
    'فيديو', 'اعمل فيديو', 'عاوز فيديو', 'إنشاء فيديو', 'اطلع فيديو',
    'generate video', 'create video', 'make video', 'video generation',
    'حرك', 'متحرك', 'animation', 'animate', 'فيلم قصير'
  ];
  
  const lowerMessage = message.toLowerCase();
  return videoKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Extract video prompt from user message
export function extractVideoPrompt(message: string): string {
  // Remove common video request phrases to get the core prompt
  const cleanPrompt = message
    .replace(/اعمل فيديو|اعمل لي فيديو|عاوز فيديو|إنشاء فيديو|generate video|create video|make video/gi, '')
    .replace(/عن|of|for|من|بـ|ل|للـ/gi, '')
    .trim();
    
  return cleanPrompt || message;
}

// Check video generation status (for async jobs)
export async function checkVideoStatus(jobId: string, model: string): Promise<VideoGenerationResponse> {
  try {
    if (model === 'runway-gen4') {
      return await checkRunwayStatus(jobId);
    } else {
      return await checkReplicateStatus(jobId);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في التحقق من حالة الفيديو',
      model,
    };
  }
}

async function checkRunwayStatus(jobId: string): Promise<VideoGenerationResponse> {
  const response = await fetch(`https://api.runwayml.com/v1/generate/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Runway status check error: ${response.statusText}`);
  }

  const data = await response.json() as any;
  
  return {
    success: data.status === 'completed',
    videoUrl: data.output?.url,
    model: 'RunwayML Gen-4',
    jobId,
  };
}

async function checkReplicateStatus(jobId: string): Promise<VideoGenerationResponse> {
  const response = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Replicate status check error: ${response.statusText}`);
  }

  const data = await response.json() as any;
  
  return {
    success: data.status === 'succeeded',
    videoUrl: data.output?.[0],
    model: 'Replicate Video',
    jobId,
  };
}