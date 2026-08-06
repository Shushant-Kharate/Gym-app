// ExerciseVideoPlayer.jsx — collapsible video player for Workout Mode (Local MP4 + YouTube fallback)
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, PlayCircle, Settings, ExternalLink, HardDrive } from 'lucide-react';
import { buildEmbedUrl, buildThumbnailUrl, extractYouTubeId } from '../../utils/videoUtils';
import { useNavigate } from 'react-router-dom';

export default function ExerciseVideoPlayer({ exerciseName, videoUrl }) {
  const [expanded, setExpanded] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [useLocal, setUseLocal] = useState(true);
  const navigate = useNavigate();

  const videoId = extractYouTubeId(videoUrl);

  // Reset useLocal when videoId changes
  useEffect(() => {
    setUseLocal(true);
    setIframeLoaded(false);
  }, [videoId]);

  // ─── No video attached ────────────────────────────────────────────────────
  if (!videoId) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 'var(--r-md)',
          border: '1px dashed rgba(255,255,255,0.07)',
          marginBottom: 12,
        }}
      >
        <div className="flex items-center gap-sm">
          <PlayCircle size={16} color="var(--text-dim)" />
          <span className="text-xs text-dim">No form video attached</span>
        </div>
        <button
          id={`video-add-shortcut-${exerciseName.replace(/\s/g, '-')}`}
          className="btn btn-ghost"
          style={{ fontSize: 11, padding: '4px 10px', color: 'var(--accent-iron)' }}
          onClick={() => navigate(`/library?focus=${encodeURIComponent(exerciseName)}`)}
          aria-label={`Add video for ${exerciseName} in Exercise Library`}
        >
          <Settings size={12} /> Add in Library
        </button>
      </div>
    );
  }

  const thumbnailUrl = buildThumbnailUrl(videoId);
  const embedUrl = buildEmbedUrl(videoId);
  const localVideoUrl = `/videos/${videoId}.mp4`;

  // ─── Video attached ───────────────────────────────────────────────────────
  return (
    <div
      style={{
        borderRadius: 'var(--r-lg)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        marginBottom: 14,
        background: 'var(--panel-alt)',
      }}
    >
      {/* Collapse Toggle Header */}
      <button
        id={`video-toggle-${exerciseName.replace(/\s/g, '-')}`}
        className="flex items-center justify-between w-full"
        onClick={() => setExpanded(v => !v)}
        style={{
          padding: '10px 14px',
          background: 'none',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse form video' : 'Expand form video'}
      >
        <div className="flex items-center gap-sm">
          <PlayCircle size={15} color="var(--accent-iron)" />
          <span className="text-xs" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Form Video
          </span>
          {useLocal ? (
            <span className="badge badge-success" style={{ fontSize: 8 }}>Local HD</span>
          ) : (
            <span className="badge badge-iron" style={{ fontSize: 8 }}>YouTube</span>
          )}
        </div>
        <div className="flex items-center gap-sm">
          {!expanded && (
            <img
              src={thumbnailUrl}
              alt="video thumbnail"
              style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 4, opacity: 0.8 }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
          {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </button>

      {/* Expanded Player */}
      {expanded && (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '56.25%',
              background: '#000',
            }}
          >
            {useLocal ? (
              <video
                id={`local-video-${videoId}`}
                src={localVideoUrl}
                controls
                autoPlay
                loop
                muted
                playsInline
                onError={() => setUseLocal(false)} // Fall back to YouTube if local mp4 not found
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'contain', background: '#000',
                }}
              />
            ) : (
              <>
                {!iframeLoaded && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: '#0A0A0F',
                  }}>
                    <div className="spin" style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent-iron)', borderTopColor: 'transparent' }} />
                  </div>
                )}
                <iframe
                  id={`yt-embed-${videoId}`}
                  src={embedUrl}
                  title={`${exerciseName} form video`}
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    border: 'none',
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  onLoad={() => setIframeLoaded(true)}
                />
              </>
            )}
          </div>

          {/* Links */}
          <div style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs text-dim">
              {useLocal ? 'Playing high-performance local MP4' : 'Streaming from YouTube'}
            </span>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-xs text-xs text-muted"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLink size={11} /> Open in YouTube
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
