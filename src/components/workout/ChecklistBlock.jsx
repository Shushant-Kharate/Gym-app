// ChecklistBlock.jsx — warmup and stretch checklist with optional exercise video embeds
import { useState } from 'react';
import { Check, PlayCircle, X } from 'lucide-react';
import { getExerciseVideos } from '../../db/storage';
import { findMatchingExerciseVideo, extractYouTubeId, buildEmbedUrl } from '../../utils/videoUtils';

export default function ChecklistBlock({ items, checks, onToggle, title }) {
  const allDone = checks.every(Boolean);
  const videoMap = getExerciseVideos();
  const [activeVideo, setActiveVideo] = useState(null); // { name, url, id }

  function handlePlayVideo(e, item) {
    e.stopPropagation(); // Don't trigger checklist check toggle
    const match = findMatchingExerciseVideo(item, videoMap);
    if (match && match.url) {
      const id = extractYouTubeId(match.url);
      if (id) {
        setActiveVideo(activeVideo?.id === id ? null : { name: match.name, url: match.url, id });
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-sm">
        <h3 className="display-xs">{title}</h3>
        {allDone && (
          <span className="badge badge-success">All Done</span>
        )}
      </div>

      {/* Active inline video modal/player */}
      {activeVideo && (
        <div
          style={{
            marginBottom: 16,
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--border-active)',
            overflow: 'hidden',
            background: 'var(--panel-alt)',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-xs">
              <PlayCircle size={14} color="var(--accent-iron)" />
              <span className="text-xs" style={{ fontWeight: 600 }}>{activeVideo.name}</span>
            </div>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setActiveVideo(null)}
              aria-label="Close video"
            >
              <X size={14} />
            </button>
          </div>
          <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
            <video
              src={`/videos/${activeVideo.id}.mp4`}
              controls
              autoPlay
              loop
              muted
              playsInline
              onError={(e) => {
                // If local mp4 fails, replace element with YouTube iframe
                const parent = e.target.parentElement;
                if (parent) {
                  parent.innerHTML = `<iframe src="${buildEmbedUrl(activeVideo.id)}" title="${activeVideo.name}" style="position:absolute;inset:0;width:100%;height:100%;border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                }
              }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-sm">
        {items.map((item, i) => {
          const videoMatch = findMatchingExerciseVideo(item, videoMap);
          return (
            <div
              key={i}
              id={`checklist-${title.replace(/\s/g,'')}-${i}`}
              className={`check-row ${checks[i] ? 'checked' : ''}`}
              onClick={() => onToggle(i)}
              role="checkbox"
              aria-checked={checks[i]}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onToggle(i)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div className="flex items-center gap-sm" style={{ flex: 1, minWidth: 0 }}>
                <div className="check-box" style={{ flexShrink: 0 }}>
                  {checks[i] && <Check size={13} color="white" strokeWidth={3} />}
                </div>
                <span
                  className="text-sm"
                  style={{
                    textDecoration: checks[i] ? 'line-through' : 'none',
                    color: checks[i] ? 'var(--text-muted)' : 'var(--text-primary)',
                    wordBreak: 'break-word',
                  }}
                >
                  {item}
                </span>
              </div>

              {videoMatch && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    height: 'auto',
                    color: 'var(--accent-iron)',
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                  onClick={e => handlePlayVideo(e, item)}
                  title={`Watch form video for ${videoMatch.name}`}
                  aria-label={`Watch form video for ${videoMatch.name}`}
                >
                  <PlayCircle size={13} style={{ marginRight: 4 }} /> Form
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

