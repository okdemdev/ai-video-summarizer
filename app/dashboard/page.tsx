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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeURL }),
      });

      if (!infoResponse.ok) {
        throw new Error(
          `Error fetching video information: ${infoResponse.status} ${infoResponse.statusText}`
        );
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
        );
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: output, question }),
      });

      if (!response.ok) {
        throw new Error(`Error answering question: ${response.status} ${response.statusText}`);
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
      {!output && (
        <div className="flex flex-1 flex-col justify-center items-center">
          <div className="relative text-center">
            <h1 className="font-bold text-4xl text-[#ffffe3] p-4">YouTube Video Summarizer</h1>
            <a
              href={'www.bulatadamian.com'}
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

      {output && (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden p-4">
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* New Section: Video Info, Save, and Summarize Another */}
            <div className="p-4 bg-[#2d2d2d] rounded-md flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#ffffe3]">{videoInfo?.title}</h2>
                <a
                  href={youtubeURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#ffffe3]/50 underline"
                >
                  {youtubeURL}
                </a>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setOutput('')} // Reset to summarize another video
                  className="px-4 py-2 bg-[#535353] text-[#ffffe3] rounded-md hover:bg-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#ffffe3] transition-all duration-200"
                >
                  Summarize Another Video
                </button>
                <button
                  onClick={() => console.log('Saving summary and Q&A')} // Add save functionality here
                  className="px-4 py-2 bg-[#535353] text-[#ffffe3] rounded-md hover:bg-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#ffffe3] transition-all duration-200"
                >
                  Save Summary and Q&A
                </button>
              </div>
            </div>

            {/* Summary Section */}
            <div className="p-4 bg-[#2d2d2d] rounded-md overflow-y-auto">
              {formatSummary(output).map((section, index) => (
                <div key={index} className="mb-4">
                  <h3 className="flex items-center text-xl font-bold text-[#ffffe3] mb-2">
                    {section.icon} <span className="ml-2">{section.title}</span>
                  </h3>
                  <ul className="list-disc list-inside text-[#ffffe3]/80">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          {/* Q&A Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col gap-2 mb-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the video..."
                className="w-full p-3 border-2 border-[#535353] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffffe3] focus:border-[#ffffe3] shadow-sm bg-[#2d2d2d] text-[#ffffe3] resize-none transition-all duration-200"
              />
              <button
                onClick={askQuestion}
                disabled={isAnswering || !question.trim()}
                className="px-4 py-2 bg-[#535353] text-[#ffffe3] rounded-md hover:bg-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#ffffe3] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnswering ? 'Answering...' : 'Ask Question'}
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto bg-[#2d2d2d] rounded-md p-4"
              ref={qaContainerRef}
            >
              {questionAnswers.map((qa, index) => (
                <div key={index} className="mb-4">
                  <h4 className="text-lg font-semibold text-[#ffffe3]">{qa.question}</h4>
                  <p className="text-[#ffffe3]/80">{qa.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
