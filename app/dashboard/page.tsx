'use client';

import { useState } from 'react';

export default function Home() {
  const [youtubeURL, setYoutubeURL] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);
    setError('');
    setOutput('');
    setAnswer('');

    try {
      // First, fetch the video info
      const infoResponse = await fetch('/api/feth-youtube-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeURL }),
      });

      if (!infoResponse.ok) {
        const errorText = await infoResponse.text();
        console.error('Video info fetch error:', errorText);
        throw new Error(
          `Error fetching video information: ${infoResponse.status} ${infoResponse.statusText}`
        );
      }

      const infoData = await infoResponse.json();

      // Then, generate the summary
      const summaryResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: infoData.title, description: infoData.description }),
      });

      if (!summaryResponse.ok) {
        const errorText = await summaryResponse.text();
        console.error('Summary generation error:', errorText);
        throw new Error(
          `Error generating summary: ${summaryResponse.status} ${summaryResponse.statusText}`
        );
      }

      const summaryData = await summaryResponse.json();
      setOutput(summaryData.output);
    } catch (error) {
      console.error('Error in generateSummary:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const askQuestion = async () => {
    setIsAnswering(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch('/api/answear-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: output, question }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Question answering error:', errorText);
        throw new Error(`Error answering question: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Error in askQuestion:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="rounded-xl w-full h-full bg-[#1d1d1d] p-4 border border-[#535353] flex items-center justify-center">
      <div className="flex flex-col w-full max-w-2xl">
        <h1 className="font-bold text-4xl text-[#ffffe3] mb-8 text-center">
          YouTube Video Summarizer
        </h1>
        <div className="flex items-center justify-center">
          <div className="relative w-full">
            <input
              type="text"
              value={youtubeURL}
              onChange={(e) => setYoutubeURL(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="w-full p-3 pr-32 border-2 border-[#535353] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffffe3] focus:border-transparent shadow-sm bg-[#2d2d2d] text-[#ffffe3]"
            />
            <button
              onClick={generateSummary}
              disabled={isLoading || !youtubeURL}
              className="absolute right-1 top-1 bottom-1 px-6 bg-[#535353] text-[#ffffe3] rounded-md hover:bg-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#ffffe3] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Summarizing...' : 'Summarize'}
            </button>
          </div>
        </div>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        {output && (
          <div className="mt-8 p-4 bg-[#2d2d2d] rounded-md">
            <h2 className="text-2xl font-bold text-[#ffffe3] mb-4">Summary:</h2>
            <p className="text-[#ffffe3]">{output}</p>
          </div>
        )}
        {output && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-[#ffffe3] mb-4">Ask a Question:</h2>
            <div className="relative w-full">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the summary..."
                className="w-full p-3 pr-32 border-2 border-[#535353] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffffe3] focus:border-transparent shadow-sm bg-[#2d2d2d] text-[#ffffe3]"
              />
              <button
                onClick={askQuestion}
                disabled={isAnswering || !question}
                className="absolute right-1 top-1 bottom-1 px-6 bg-[#535353] text-[#ffffe3] rounded-md hover:bg-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#ffffe3] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnswering ? 'Answering...' : 'Ask'}
              </button>
            </div>
            {answer && (
              <div className="mt-4 p-4 bg-[#2d2d2d] rounded-md">
                <h3 className="text-xl font-bold text-[#ffffe3] mb-2">Answer:</h3>
                <p className="text-[#ffffe3]">{answer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
