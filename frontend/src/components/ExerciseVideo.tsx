import { useState } from 'react';
import { Play, EyeOff, Youtube, ExternalLink, HelpCircle, Sparkles } from 'lucide-react';

interface ExerciseVideoProps {
  url: string;
  title: string;
}

export const ExerciseVideo = ({ url, title }: ExerciseVideoProps) => {
  const [loaded, setLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Helper method matching the spec to resolve normal youtube watch urls into embed URLs securely
  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const id = match?.[2]?.length === 11 ? match[2] : null;
      if (!id) return url;
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        autoplay: '0',
        playsinline: '1',
        enablejsapi: '1',
        origin,
      });
      return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
    } catch (e) {
      return url;
    }
  };

  const embedUrl = getYoutubeEmbedUrl(url);

  // Generate a premium search URL fallback in case of blocklists or generic errors
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " exercise form demo")}`;

  return (
    <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-800 transition-all duration-350">
      
      {/* Loading state indicator visual */}
      {!loaded && !iframeError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <Play className="w-5 h-5 text-indigo-400 animate-pulse fill-indigo-400/30" />
          </div>
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono font-black tracking-widest text-indigo-400 block">RESOLVING ANABOLIC STREAM...</span>
            <span className="text-[9px] text-slate-500 font-semibold block">{title} execution guide</span>
          </div>
        </div>
      )}

      {/* Frame view */}
      {!iframeError && (
        <iframe
          src={embedUrl}
          title={title}
          className={`w-full h-full relative z-20 ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 border-0`}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onLoad={() => setLoaded(true)}
          onError={() => setIframeError(true)}
        />
      )}

      {/* Absolute Header Overlay for Video */}
      <div className="absolute top-3 left-3 right-3 z-30 flex justify-between items-center pointer-events-none">
        <span className="pointer-events-auto shadow-md backdrop-blur-md bg-slate-950/80 border border-slate-850/60 px-2.5 py-1 rounded-xl text-[9px] font-mono font-bold text-slate-300 flex items-center gap-1">
          <Youtube className="w-3 h-3 text-rose-500" />
          <span>YouTube Embed Resolve</span>
        </span>

        <div className="flex gap-1.5 pointer-events-auto">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="shadow-md backdrop-blur-md bg-slate-950/80 hover:bg-slate-900 border border-slate-850/60 p-2 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Open original video directly on YouTube"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shadow-md backdrop-blur-md bg-slate-950/80 hover:bg-indigo-900 border border-slate-850/80 p-2 rounded-xl text-indigo-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Search alternative movement guides"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded watermark branding label */}
      <div className="absolute bottom-3 right-3 z-30 pointer-events-none select-none">
        <span className="backdrop-blur-md bg-slate-950/70 border border-slate-850/50 px-2.5 py-1 rounded-xl text-[8px] font-mono font-extrabold text-indigo-400 tracking-wider">
          COACH SPHERE MULTIVERSE
        </span>
      </div>
    </div>
  );
};

