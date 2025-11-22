import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { exerciseName, language } = await request.json();

    if (!exerciseName) {
      throw new Error('種目名が必要です。');
    }

    // Geminiへの指示書（プロンプト）
    const langMap: { [key: string]: string } = { ja: "Japanese", it: "Italian", en: "English" };
    const targetLang = langMap[language] || "Japanese";

    const prompt = `
      Propose 3 alternative exercises for "${exerciseName}".
      Output ONLY a JSON array of strings in **${targetLang}**.
      Example: ["Alt 1", "Alt 2", "Alt 3"]
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