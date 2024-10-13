'use client';

import { useState, useRef, useEffect } from 'react';
import { BookOpen, Key, MessageCircle, Lightbulb, Zap } from 'lucide-react';

type SummarySection = {
  title: string;
  content: string[];
  icon: React.ReactNode;
};

export default function Component() {
  const [youtubeURL, setYoutubeURL] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResummarizing, setIsResummarizing] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState<
    Array<{ question: string; answer: string }>
  >([]);
  const [videoInfo, setVideoInfo] = useState<{ title: string; description: string } | null>(null);
  const qaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qaContainerRef.current) {
      qaContainerRef.current.scrollTop = qaContainerRef.current.scrollHeight;
    }
  }, [questionAnswers]);

  const generateSummary = async () => {
    setIsLoading(true);
    setError('');
    setOutput('');
    setQuestionAnswers([]);
    setVideoInfo(null);

    try {
      const infoResponse = await fetch('/api/feth-youtube-video', {
        // Fixed endpoint name
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeURL }),
      });

      if (!infoResponse.ok) {
        throw new Error(
          `Error fetching video information: ${infoResponse.status} ${infoResponse.statusText}`
        ); // Corrected string interpolation
      }

      const infoData = await infoResponse.json();
      setVideoInfo(infoData);

      const summaryResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: infoData.title, description: infoData.description }),
      });

      if (!summaryResponse.ok) {
        throw new Error(
          `Error generating summary: ${summaryResponse.status} ${summaryResponse.statusText}`
        ); // Corrected string interpolation
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

  const reSummarize = async () => {
    if (!videoInfo) return;

    setIsResummarizing(true);
    setError('');

    try {
      const summaryResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoInfo.title,
          description: videoInfo.description,
          detailed: true,
        }),
      });

      if (!summaryResponse.ok) {
        throw new Error(
          `Error generating detailed summary: ${summaryResponse.status} ${summaryResponse.statusText}`
        ); // Corrected string interpolation
      }

      const summaryData = await summaryResponse.json();
      setOutput(summaryData.output);
    } catch (error) {
      console.error('Error in reSummarize:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsResummarizing(false);
    }
  };

  const askQuestion = async () => {
    setIsAnswering(true);
    setError('');

    try {
      const response = await fetch('/api/answear-question', {
        // Fixed endpoint name
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: output, question }),
      });

      if (!response.ok) {
        throw new Error(`Error answering question: ${response.status} ${response.statusText}`); // Corrected string interpolation
      }

      const data = await response.json();
      setQuestionAnswers((prevQA) => [...prevQA, { question, answer: data.answer }]);
      setQuestion('');
    } catch (error) {
      console.error('Error in askQuestion:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsAnswering(false);
    }
  };

  const formatSummary = (summaryText: string): SummarySection[] => {
    const sections = summaryText.split('**').filter((s) => s.trim());
    const formattedSections: SummarySection[] = [];

    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i].trim();
      const content = sections[i + 1]?.split('*').filter((s) => s.trim()) || [];

      let icon;
      switch (title.toLowerCase()) {
        case 'main topics covered:':
          icon = <BookOpen className="w-6 h-6" />;
          break;
        case 'key points:':
          icon = <Key className="w-6 h-6" />;
          break;
        case 'overall message:':
          icon = <MessageCircle className="w-6 h-6" />;
          break;
        case 'potential applications or implications:':
          icon = <Lightbulb className="w-6 h-6" />;
          break;
        default:
          icon = <Zap className="w-6 h-6" />;
      }

      formattedSections.push({ title, content, icon });
    }

    return formattedSections;
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.4)-64px)] bg-[#1d1d1d] rounded-xl border border-[#535353] flex flex-col overflow-hidden p-6">
      {/* Center content only before the summary is generated */}
      {!output && (
        <div className="flex flex-1 flex-col justify-center items-center">
          <div className="relative text-center">
            <h1 className="font-bold text-4xl text-[#ffffe3] p-4">YouTube Video Summarizer</h1>
            <a
              href={'https://www.bulatadamian.com'} // Added HTTPS to the URL
              className="absolute right-0 bottom-0 text-[#ffffe3]/50 underline text-sm font-regular mr-3"
            >
              by Damian Bulata
            </a>
          </div>

          <div className="w-full max-w-md mt-6">
            <div className="relative">
              <input
                type="text"
                value={youtubeURL}
                onChange={(e) => setYoutubeURL(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="w-full p-3 pr-28 border-2 border-[#535353] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffffe3] focus:border-[#ffffe3] shadow-sm bg-[#2d2d2d] text-[#ffffe3] transition-all duration-200"
              />
              <button
                onClick={generateSummary}
                disabled={isLoading || !youtubeURL}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-[#535353] text-[#ffffe3] rounded-md hover:bg-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#ffffe3] focus:ring-offset-2 focus:ring-offset-[#1d1d1d] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Summarizing...' : 'Summarize'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display summary and Q&A after output is generated */}
      {output && (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Summary section */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="p-4 bg-[#2d2d2d] rounded-md overflow-y-auto flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#ffffe3]">Summary:</h2>
                <button
                  onClick={reSummarize}
                  disabled={isResummarizing || !videoInfo}
                  className="px-4 py-2 bg-[#535353] text-[#ffffe3] rounded-md hover:bg-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#ffffe3] focus:ring-offset-2 focus:ring-offset-[#1d1d1d] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isResummarizing ? 'Resummarizing...' : 'Get Detailed Summary'}
                </button>
              </div>
              {error && <div className="text-red-500">{error}</div>}
              <div className="flex flex-col gap-4">
                {formatSummary(output).map((section, index) => (
                  <div key={index} className="bg-[#3b3b3b] p-4 rounded-md">
                    <div className="flex items-center">
                      {section.icon}
                      <h3 className="text-lg font-bold text-[#ffffe3] ml-2">{section.title}</h3>
                    </div>
                    <ul className="list-disc pl-5 mt-2 text-[#ffffe3]">
                      {section.content.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Q&A section */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="p-4 bg-[#2d2d2d] rounded-md flex flex-col h-full">
              <h2 className="text-2xl font-bold text-[#ffffe3] mb-4">Questions & Answers:</h2>

              {/* Input for asking questions */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full p-3 border-2 border-[#535353] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffffe3] focus:border-[#ffffe3] shadow-sm bg-[#2d2d2d] text-[#ffffe3] transition-all duration-200"
                  />
                  <button
                    onClick={askQuestion}
                    disabled={isAnswering || !question}
                    className="px-4 py-2 bg-[#535353] text-[#ffffe3] rounded-md hover:bg-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#ffffe3] focus:ring-offset-2 focus:ring-offset-[#1d1d1d] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isAnswering ? 'Answering...' : 'Ask'}
                  </button>
                </div>
              </div>

              {/* Scrollable container for questions and answers */}
              <div ref={qaContainerRef} className="flex-1 overflow-y-auto">
                {questionAnswers.map((qa, index) => (
                  <div key={index} className="bg-[#3b3b3b] p-4 rounded-md mb-2">
                    <h3 className="text-md font-semibold text-[#ffffe3]">Q: {qa.question}</h3>
                    <p className="text-[#ffffe3]">A: {qa.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
