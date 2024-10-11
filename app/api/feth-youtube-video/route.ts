import { NextResponse } from 'next/server';

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function POST(req: Request) {
  try {
    const { youtubeURL } = await req.json();
    const videoId = extractVideoId(youtubeURL);

    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', errorText);
      return NextResponse.json(
        { error: `YouTube API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const videoInfo = data.items[0]?.snippet;

    if (!videoInfo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({
      title: videoInfo.title,
      description: videoInfo.description,
    });
  } catch (error) {
    console.error('Error in fetch-video-info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function extractVideoId(url: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export const config = {
  api: {
    bodyParser: true,
  },
};
