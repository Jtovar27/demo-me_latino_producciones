'use client';

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/\s]{11})/);
  return m ? m[1] : null;
}

function getVimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export default function VideoPlayer({ src, className = '', autoPlay = false, muted = true, loop = false, controls = true }: VideoPlayerProps) {
  if (!src) return null;

  const ytId = getYouTubeId(src);
  if (ytId) {
    const params = new URLSearchParams({ rel: '0', modestbranding: '1', ...(autoPlay ? { autoplay: '1', mute: '1' } : {}) });
    return (
      <div className={`relative w-full aspect-video ${className}`}>
        <iframe src={`https://www.youtube.com/embed/${ytId}?${params}`}
          title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen className="absolute inset-0 w-full h-full" />
      </div>
    );
  }

  const vimeoId = getVimeoId(src);
  if (vimeoId) {
    const params = new URLSearchParams({ badge: '0', autopause: '0', ...(autoPlay ? { autoplay: '1', muted: '1' } : {}) });
    return (
      <div className={`relative w-full aspect-video ${className}`}>
        <iframe src={`https://player.vimeo.com/video/${vimeoId}?${params}`}
          title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen className="absolute inset-0 w-full h-full" />
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-video ${className}`}>
      <video src={src} controls={controls} autoPlay={autoPlay} muted={muted} loop={loop} playsInline
        className="absolute inset-0 w-full h-full object-cover">
        Tu navegador no soporta reproducción de video.
      </video>
    </div>
  );
}
