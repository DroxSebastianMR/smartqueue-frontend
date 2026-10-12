import { useEffect, useState } from 'react';

export type HeroMediaSource = {
  type: 'video' | 'youtube' | 'image';
  src: string;
  poster?: string;
};

export function HeroMedia({ media, muted = true }: { media: HeroMediaSource; muted?: boolean }) {
  const [playerMounted, setPlayerMounted] = useState(media.type !== 'youtube');
  const [playerVisible, setPlayerVisible] = useState(media.type !== 'youtube');
  const [playerSession, setPlayerSession] = useState(0);

  useEffect(() => {
    if (media.type !== 'youtube') {
      setPlayerMounted(true);
      setPlayerVisible(true);
      return undefined;
    }

    let mountTimer: ReturnType<typeof setTimeout>;
    let revealTimer: ReturnType<typeof setTimeout>;

    const schedulePlayback = () => {
      clearTimeout(mountTimer);
      clearTimeout(revealTimer);
      setPlayerMounted(false);
      setPlayerVisible(false);

      if (document.visibilityState === 'visible') {
        mountTimer = setTimeout(() => {
          setPlayerSession((current) => current + 1);
          setPlayerMounted(true);
          revealTimer = setTimeout(() => setPlayerVisible(true), 3500);
        }, 3000);
      }
    };

    schedulePlayback();
    document.addEventListener('visibilitychange', schedulePlayback);
    return () => {
      clearTimeout(mountTimer);
      clearTimeout(revealTimer);
      document.removeEventListener('visibilitychange', schedulePlayback);
    };
  }, [media.src, media.type]);

  if (media.type === 'youtube') {
    const videoId = getYoutubeVideoId(media.src);
    if (!videoId) return <MediaFallback poster={media.poster} />;

    return (
      <div className="absolute inset-0 overflow-hidden bg-[#08090c]">
        <MediaFallback poster={media.poster} />
        {playerMounted && (
          <div className={`absolute inset-0 transition-opacity duration-700 [mask-image:linear-gradient(to_right,transparent_0%,transparent_14%,black_48%)] ${playerVisible ? 'opacity-100' : 'opacity-0'}`}>
            <iframe
              key={playerSession}
              aria-hidden="true"
              className="pointer-events-none absolute left-[108%] top-1/2 h-[63vw] min-h-[112%] w-[199vh] min-w-[160%] -translate-x-1/2 -translate-y-1/2 border-0"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0`}
              title="Avance destacado de Cinetrux"
              allow="autoplay; encrypted-media; picture-in-picture"
              tabIndex={-1}
            />
          </div>
        )}
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <video
        aria-hidden="true"
        autoPlay
        className="absolute inset-0 size-full object-cover object-center"
        loop
        muted={muted}
        playsInline
        poster={media.poster}
        style={{ filter: 'saturate(.55) grayscale(.25) contrast(1.08)' }}
      >
        <source src={media.src} />
      </video>
    );
  }

  return <MediaFallback poster={media.src} />;
}

function MediaFallback({ poster }: { poster?: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-cover bg-center"
      style={poster ? { backgroundImage: `url(${poster})` } : undefined}
    />
  );
}

function getYoutubeVideoId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match?.[1];
}
