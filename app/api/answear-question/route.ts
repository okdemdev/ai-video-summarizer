import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import axios from 'axios';

async function performWebSearch(query: string): Promise<string> {
  try {
    if (!process.env.SERPER_API_KEY) {
      throw new Error('SERPER_API_KEY is not set');
    }

    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: query,
        num: 5,
      },
      {
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const organicResults = response.data.organic;
    return organicResults
      .map((result: any) => `Title: ${result.title}\nSnippet: ${result.snippet}\n`)
      .join('\n');
  } catch (error) {
    console.error('Error performing web search:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return 'Unable to perform web search.';
  }
}

export async function POST(req: Request) {
  try {
    const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAi.getGenerativeModel({ model: 'gemini-pro' });
    const { summary, question } = await req.json();

    // Perform a web search for additional context
    const searchResults = await performWebSearch(question);

    const prompt = `You have access to two sources of information:

1. A summary of a YouTube video:
${summary}

2. Additional web search results:
${searchResults}

Please answer the following question:
${question}

Provide a comprehensive answer using both the video summary and the web search results. If the information from these sources conflicts, please mention this and explain the discrepancy.`;

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
