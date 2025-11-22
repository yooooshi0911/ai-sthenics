import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { createWorkoutPrompt } from '@/lib/ai/prompt';
import type { Workout } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

export async function POST(request: Request) {
  try {
    // ▼▼▼ 修正1: language を受け取る ▼▼▼
    const { trainingTime, history, goal, level, userRequest, personalInfo, language } = (await request.json()) as {
      trainingTime: number;
      history: Workout[];
      goal: string;
      level: string;
      userRequest?: string;
      personalInfo?: string;
      language?: string;
    };

    // ▼▼▼ 修正2: createWorkoutPrompt に language を渡す ▼▼▼
    const prompt = createWorkoutPrompt(trainingTime, history, goal, level, userRequest, personalInfo, language);
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      safetySettings,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonResponse = response.text();

    if (!jsonResponse) {
      throw new Error('AIからの応答が空でした。');
    }

    return new Response(jsonResponse, {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("=============== AI API ERROR START ===============");
    console.error("Error generating content:", JSON.stringify(error, null, 2));
    console.error("=============== AI API ERROR END ===============");
    
    return new Response(JSON.stringify({ error: 'AIによるメニューの生成に失敗しました。' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}