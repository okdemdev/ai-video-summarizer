// In your api/generate.ts file
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAi.getGenerativeModel({ model: 'gemini-pro' });
    const { title, description, detailed } = await req.json();

    const prompt = detailed
      ? `Provide a detailed summary of the following YouTube video based on its title and description:

Title: ${title}

Description: ${description}

Please include:
1. Main topics covered
2. Key points for each topic
3. Any notable examples or case studies mentioned
4. The overall message or takeaway from the video
5. Potential applications or implications of the content`
      : `Summarize the following YouTube video based on its title and description:

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
