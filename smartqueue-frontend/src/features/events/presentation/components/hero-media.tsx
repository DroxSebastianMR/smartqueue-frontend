type HeroMediaSource = {
  type: 'video' | 'youtube' | 'image';
  src: string;
  poster?: string;
};

export function HeroMedia({ media, muted = true }: { media: HeroMediaSource; muted?: boolean }) {
  if (media.type === 'youtube') {
    const videoId = getYoutubeVideoId(media.src);
    if (!videoId) return <MediaFallback poster={media.poster} />;

    return (
      <iframe
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1`}
        title="Video destacado de Cinetrux"
        allow="autoplay; encrypted-media; picture-in-picture"
        tabIndex={-1}
      />
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
