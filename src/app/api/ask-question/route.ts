import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // language を受け取る
    const { exerciseName, question, language } = await request.json();

    if (!exerciseName || !question) {
      throw new Error('種目名と質問内容が必要です。');
    }

    // Geminiへの指示書（プロンプト）
     const langMap: { [key: string]: string } = { ja: "Japanese", it: "Italian", en: "English" };
    const targetLang = langMap[language] || "Japanese";

    const prompt = `
      You are a knowledgeable AI personal trainer.
      The user is asking about the exercise "${exerciseName}".
      Question: "${question}"
      
      Please answer clearly and concisely in **${targetLang}**.
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