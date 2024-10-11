import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAi.getGenerativeModel({ model: 'gemini-pro' });
    const { title, description } = await req.json();

    const prompt = `Summarize the following YouTube video based on its title and description:

Title: ${title}

Description: ${description}

Please provide a concise summary of the video's main points and key takeaways.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const output = await response.text();

    return NextResponse.json({ output });
  } catch (error) {
    console.error('Error in generate:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
