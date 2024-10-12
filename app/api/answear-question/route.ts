import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAi.getGenerativeModel({ model: 'gemini-pro' });
    const { summary, question } = await req.json();

    const prompt = `Based on the following summary of a YouTube video:

${summary}

Please answer the following question:
${question}

Provide a concise and accurate answer based only on the information given in the summary.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const output = await response.text();

    return NextResponse.json({ answer: output });
  } catch (error) {
    console.error('Error in answer-question:', error);
    return NextResponse.json({ error: 'Failed to answer question' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
