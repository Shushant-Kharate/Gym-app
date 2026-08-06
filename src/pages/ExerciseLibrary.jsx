// ExerciseLibrary.jsx — Exercise Library Manager
// Deduplicated list of all 86 exercises across Main, Warmup, and Stretch routines
import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Link, Check, X, Trash2, PlayCircle, ExternalLink, ChevronRight, AlertCircle, Dumbbell, Flame, Heart } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PROGRAM_DAYS } from '../data/program';
import { getExerciseVideos, saveVideoForExercise, clearVideoForExercise } from '../db/storage';
import { isValidYouTubeUrl, extractYouTubeId, buildThumbnailUrl, buildEmbedUrl } from '../utils/videoUtils';
import exerciseLinks from '../../exercise_links.json';

// ─── Build deduplicated master exercise list of all 86 exercises ─────────────
function buildExerciseList() {
  const result = [];
  const exerciseMetaMap = new Map();

  // Extract metadata (muscleGroups, program days) from PROGRAM_DAYS
  for (const day of PROGRAM_DAYS) {
    if (day.isRest) continue;
    for (const ex of (day.exercises ?? [])) {
      if (!exerciseMetaMap.has(ex.name)) {
        exerciseMetaMap.set(ex.name, {
          muscleGroups: ex.muscleGroups ?? [],
          days: [day.name],
        });
      } else {
        const meta = exerciseMetaMap.get(ex.name);
        if (!meta.days.includes(day.name)) {
          meta.days.push(day.name);
        }
      }
    }
  }

  // Iterate over exerciseLinks JSON categories (Main: 51, Warmup: 14, Stretch: 21)
  for (const [category, items] of Object.entries(exerciseLinks)) {
    for (const exName of Object.keys(items)) {
      const meta = exerciseMetaMap.get(exName) ?? { muscleGroups: [], days: [] };
      result.push({
        name: exName,
        category: category, // 'Main' | 'Warmup' | 'Stretch'
        muscleGroups: meta.muscleGroups.length > 0 ? meta.muscleGroups : [category.toLowerCase()],
        days: meta.days,
      });
    }
  }

  return result;
}

const ALL_EXERCISES = buildExerciseList();

// ─── Individual Exercise Row ──────────────────────────────────────────────────
function ExerciseRow({ exercise, savedUrl, onSave, onClear, isFocused }) {
  const [inputUrl, setInputUrl] = useState(savedUrl ?? '');
  const [testMode, setTestMode] = useState(false);
  const [saved, setSaved] = useState(!!savedUrl);
  const [error, setError] = useState('');
  const rowRef = useRef(null);

  // Scroll into view when focused from query param
  useEffect(() => {
    if (isFocused && rowRef.current) {
      setTimeout(() => rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
    }
  }, [isFocused]);

  // Sync if external clear happens
  useEffect(() => {
    setInputUrl(savedUrl ?? '');
    setSaved(!!savedUrl);
    setTestMode(false);
  }, [savedUrl]);

  const videoId = extractYouTubeId(inputUrl);
  const isValid = isValidYouTubeUrl(inputUrl);
  const hasInput = inputUrl.trim().length > 0;

  function handleSave() {
    if (!isValid) {
      setError('Paste a valid YouTube URL (youtube.com/watch?v=..., youtu.be/..., or youtube.com/shorts/...)');
      return;
    }
    setError('');
    onSave(exercise.name, inputUrl.trim());
    setSaved(true);
    setTestMode(false);
  }

  function handleClear() {
    setInputUrl('');
    setSaved(false);
    setTestMode(false);
    setError('');
    onClear(exercise.name);
  }

  function handleTest() {
    if (!isValid) {
      setError('Paste a valid YouTube URL first');
      return;
    }
    setError('');
    setTestMode(v => !v);
  }

  function handleInputChange(e) {
    setInputUrl(e.target.value);
    setSaved(false);
    setError('');
    setTestMode(false);
  }

  return (
    <div
      ref={rowRef}
      id={`exercise-row-${exercise.name.replace(/[\s/]/g, '-')}`}
      className="card"
      style={{
        marginBottom: 12,
        border: isFocused
          ? '1px solid var(--accent-iron)'
          : saved
            ? '1px solid rgba(74, 222, 128, 0.2)'
            : '1px solid var(--border-subtle)',
        boxShadow: isFocused ? 'var(--shadow-glow-iron)' : undefined,
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Exercise header */}
      <div className="flex items-start justify-between mb-sm">
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-xs flex-wrap">
            <h3 className="display-xs" style={{ fontSize: 15 }}>{exercise.name}</h3>
            <span
              className={`badge ${
                exercise.category === 'Warmup'
                  ? 'badge-warning'
                  : exercise.category === 'Stretch'
                    ? 'badge-info'
                    : 'badge-iron'
              }`}
              style={{ fontSize: 8 }}
            >
              {exercise.category}
            </span>
            {saved && (
              <span className="badge badge-success" style={{ fontSize: 8 }}>
                <Check size={8} strokeWidth={3} /> Linked
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-xs mt-xs">
            {exercise.muscleGroups.slice(0, 3).map(mg => (
              <span key={mg} className="badge badge-muted" style={{ fontSize: 9 }}>{mg}</span>
            ))}
            {exercise.days.length > 0 && (
              <span className="text-xs text-dim" style={{ alignSelf: 'center' }}>
                · {exercise.days.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Saved thumbnail */}
        {saved && videoId && (
          <img
            src={buildThumbnailUrl(videoId)}
            alt={`${exercise.name} video thumbnail`}
            style={{
              width: 64, height: 44,
              objectFit: 'cover',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border)',
              flexShrink: 0,
              marginLeft: 12,
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
      </div>

      {/* URL Input Row */}
      <div className="flex gap-sm mb-xs">
        <div style={{ position: 'relative', flex: 1 }}>
          <Link
            size={14}
            style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: isValid && hasInput ? 'var(--success)' : 'var(--text-dim)',
              pointerEvents: 'none',
              transition: 'color 0.2s',
            }}
          />
          <input
            id={`video-url-input-${exercise.name.replace(/\s/g, '-')}`}
            type="url"
            className="input"
            value={inputUrl}
            onChange={handleInputChange}
            placeholder="Paste YouTube URL (youtube.com/watch?v=... or youtu.be/...)"
            style={{
              paddingLeft: 36,
              fontSize: 12,
              borderColor: error
                ? 'rgba(248, 113, 113, 0.5)'
                : isValid && hasInput
                  ? 'rgba(74, 222, 128, 0.4)'
                  : undefined,
            }}
            aria-label={`YouTube URL for ${exercise.name}`}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-xs">
          {hasInput && (
            <button
              id={`video-test-${exercise.name.replace(/\s/g, '-')}`}
              className="btn btn-secondary btn-sm"
              onClick={handleTest}
              title="Test video inline"
              aria-label={`Test video for ${exercise.name}`}
            >
              {testMode ? <X size={14} /> : <PlayCircle size={14} />}
              {testMode ? 'Close' : 'Watch'}
            </button>
          )}

          {hasInput && (
            <button
              id={`video-save-${exercise.name.replace(/\s/g, '-')}`}
              className={`btn btn-sm ${saved ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleSave}
              aria-label={`Save video for ${exercise.name}`}
            >
              {saved ? <Check size={14} strokeWidth={3} /> : <Check size={14} />}
              {saved ? 'Saved' : 'Save'}
            </button>
          )}

          {saved && (
            <button
              id={`video-clear-${exercise.name.replace(/\s/g, '-')}`}
              className="btn btn-ghost btn-icon btn-sm"
              onClick={handleClear}
              title={`Remove video for ${exercise.name}`}
              aria-label={`Remove video for ${exercise.name}`}
              style={{ color: 'var(--text-dim)' }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Inline validation error */}
      {error && (
        <div className="flex items-center gap-xs mt-xs" style={{ color: 'var(--danger)' }}>
          <AlertCircle size={12} />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* Test/Preview embed */}
      {testMode && videoId && (
        <div style={{ marginTop: 12, borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <p className="text-xs text-muted" style={{ padding: '6px 12px', background: 'var(--panel)', borderBottom: '1px solid var(--border)' }}>
            Form Video Preview — {exercise.name}
          </p>
          <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
            <iframe
              src={buildEmbedUrl(videoId)}
              title={`Preview: ${exercise.name}`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs text-muted">Previewing form demo</span>
            <div className="flex gap-sm">
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => setTestMode(false)}>
                <X size={12} /> Close Preview
              </button>
              {!saved && (
                <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={handleSave}>
                  <Check size={12} /> Save This Video
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved — show open in YouTube link */}
      {saved && videoId && !testMode && (
        <div style={{ marginTop: 6 }}>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-xs text-xs"
            style={{ color: 'var(--accent-iron)', textDecoration: 'none' }}
          >
            <ExternalLink size={11} /> Open in YouTube
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExerciseLibrary() {
  const [searchParams] = useSearchParams();
  const focusName = searchParams.get('focus') ?? '';

  const [videoMap, setVideoMap] = useState(() => getExerciseVideos());
  const [query, setQuery] = useState(focusName);
  const [category, setCategory] = useState('All'); // 'All' | 'Main' | 'Warmup' | 'Stretch'

  // Count exercises with videos
  const linkedCount = Object.keys(videoMap).length;

  const filteredExercises = useMemo(() => {
    return ALL_EXERCISES.filter(ex => {
      const matchesCategory = category === 'All' || ex.category === category;
      if (!matchesCategory) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.muscleGroups.some(mg => mg.toLowerCase().includes(q)) ||
        ex.days.some(d => d.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  function handleSave(name, url) {
    saveVideoForExercise(name, url);
    setVideoMap(getExerciseVideos());
  }

  function handleClear(name) {
    clearVideoForExercise(name);
    setVideoMap(getExerciseVideos());
  }

  const mainCount = ALL_EXERCISES.filter(e => e.category === 'Main').length;
  const warmupCount = ALL_EXERCISES.filter(e => e.category === 'Warmup').length;
  const stretchCount = ALL_EXERCISES.filter(e => e.category === 'Stretch').length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="flex items-center gap-xs mb-xs">
                <PlayCircle size={14} color="var(--accent-iron)" />
                <span className="text-xs text-iron" style={{ fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Exercise Library
                </span>
              </div>
              <h1 className="page-title">Form Videos</h1>
            </div>
            <div className="text-right">
              <span className="badge badge-iron" style={{ fontSize: 11 }}>{linkedCount} / {ALL_EXERCISES.length} linked</span>
              <p className="text-xs text-muted mt-xs">86 form videos bundled</p>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search
              size={15}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }}
            />
            <input
              id="exercise-library-search"
              type="text"
              className="input"
              placeholder="Search by exercise name, muscle group, or day..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: 36 }}
              autoFocus={!!focusName}
            />
            {query && (
              <button
                className="btn btn-ghost btn-icon"
                style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', padding: 8 }}
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-xs" style={{ overflowX: 'auto', paddingBottom: 4 }}>
            <button
              id="cat-tab-all"
              className={`btn btn-sm ${category === 'All' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory('All')}
            >
              All ({ALL_EXERCISES.length})
            </button>
            <button
              id="cat-tab-main"
              className={`btn btn-sm ${category === 'Main' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory('Main')}
            >
              <Dumbbell size={13} style={{ marginRight: 4 }} /> Main ({mainCount})
            </button>
            <button
              id="cat-tab-warmup"
              className={`btn btn-sm ${category === 'Warmup' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory('Warmup')}
            >
              <Flame size={13} style={{ marginRight: 4 }} /> Warmup ({warmupCount})
            </button>
            <button
              id="cat-tab-stretch"
              className={`btn btn-sm ${category === 'Stretch' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory('Stretch')}
            >
              <Heart size={13} style={{ marginRight: 4 }} /> Stretch ({stretchCount})
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        {/* Progress */}
        {linkedCount > 0 && (
          <div className="card-alt mb-md">
            <div className="flex justify-between mb-xs">
              <span className="text-xs text-muted">Form videos active in app</span>
              <span className="text-xs text-iron mono">{linkedCount} / {ALL_EXERCISES.length}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(linkedCount / ALL_EXERCISES.length) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Exercise rows */}
        {filteredExercises.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p className="text-muted">No exercises match "{query}" in {category}</p>
          </div>
        ) : (
          filteredExercises.map(ex => (
            <ExerciseRow
              key={ex.name}
              exercise={ex}
              savedUrl={videoMap[ex.name] ?? null}
              onSave={handleSave}
              onClear={handleClear}
              isFocused={focusName && ex.name.toLowerCase() === focusName.toLowerCase()}
            />
          ))
        )}
      </div>
    </div>
  );
}

