import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { exerciseName, question } = await request.json();

    if (!exerciseName || !question) {
      throw new Error('種目名と質問内容が必要です。');
    }

    // Geminiへの指示書（プロンプト）
    const prompt = `
      あなたは知識豊富で親切なパーソナルトレーナーAIです。
      ユーザーは今、「${exerciseName}」というトレーニング種目について質問しています。
      質問内容は以下の通りです。
      「${question}」
      
      この質問に対して、初心者にも分かりやすく、具体的かつ簡潔に回答してください。
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ answer: text }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("=============== AI Ask Question ERROR ===============");
    console.error(error);
    return new Response(JSON.stringify({ error: '回答の生成に失敗しました。' }), {
      status: 500,
    });
  }
}