import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { exerciseName } = await request.json();

    if (!exerciseName) {
      throw new Error('種目名が必要です。');
    }

    // Geminiへの指示書（プロンプト）
    const prompt = `
      「${exerciseName}」という筋力トレーニング種目の代替案を3つ提案してください。
      出力は、必ず以下の形式のJSON配列のみとしてください。他のテキストは含めないでください。
      
      ["代替種目A", "代替種目B", "代替種目C"]
    `;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonResponse = response.text();

    return new Response(jsonResponse, {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("=============== AI Change Exercise ERROR ===============");
    console.error(error);
    return new Response(JSON.stringify({ error: '代替種目の生成に失敗しました。' }), {
      status: 500,
    });
  }
}