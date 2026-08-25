// videoUtils.js — YouTube URL parsing & validation (no API key needed)
// Accepts: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID

/**
 * Extract the YouTube video ID from any valid YouTube URL.
 * Returns null if the URL is not a valid YouTube link.
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Try each pattern in order
  const patterns = [
    // youtu.be/ID
    /^(?:https?:\/\/)?youtu\.be\/([A-Za-z0-9_-]{11})(?:[?&].*)?$/,
    // youtube.com/shorts/ID
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})(?:[?&/].*)?$/,
    // youtube.com/watch?v=ID
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})(?:[&].*)?$/,
    // youtube.com/embed/ID
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([A-Za-z0-9_-]{11})(?:[?/].*)?$/,
    // youtube.com/v/ID
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([A-Za-z0-9_-]{11})(?:[?/].*)?$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Returns true if the string is a valid, parseable YouTube URL.
 */
export function isValidYouTubeUrl(url) {
  return extractYouTubeId(url) !== null;
}

/**
 * Given a video ID, return the embed URL optimised for a Shorts-style vertical embed.
 * - enablejsapi=0 → no JS API needed
 * - rel=0 → don't show related videos from other channels
 * - modestbranding=1 → smaller YouTube logo
 */
export function buildEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=0`;
}

/**
 * Given a video ID, return the thumbnail image URL (hqdefault).
 */
export function buildThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * Match a text line (e.g. warmup/stretch description) to an exercise video in videoMap.
 */
export function findMatchingExerciseVideo(text, videoMap) {
  if (!text || !videoMap) return null;
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  // Program instructions often use natural-language variants or describe a
  // lighter warm-up version of an exercise. Resolve those before fuzzy matching.
  const instructionAliases = [
    ['bar only bench', 'Barbell Bench Press'],
    ['bar only squat', 'Back Squat'],
    ['light squat ramp up', 'Back Squat'],
    ['bar only deadlift', 'Deadlift'],
    ['light dumbbell press', 'Incline Dumbbell Press'],
    ['light band curl', 'Barbell Curl'],
    ['cross body shoulder stretch', 'Shoulder Cross-Body Stretch'],
    ['shoulder cross body stretch', 'Shoulder Cross-Body Stretch'],
    ['triceps overhead stretch', 'Overhead Triceps Stretch'],
    ['wrist flexor stretch', 'Wrist Flexor/Extensor Stretch'],
    ['wrist extensor stretch', 'Wrist Flexor/Extensor Stretch'],
    ['push up', 'Push-Up (bodyweight)'],
  ];

  for (const [phrase, name] of instructionAliases) {
    if (cleanText.includes(phrase) && videoMap[name]) {
      return { name, url: videoMap[name] };
    }
  }
  
  for (const [name, url] of Object.entries(videoMap)) {
    if (!url) continue;
    const cleanName = name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    // 1. Direct match or substring
    if (cleanText.includes(cleanName)) {
      return { name, url };
    }
    // 2. Strip plurals (e.g. arm circles vs arm circle)
    const singularName = cleanName.replace(/s\b/g, '');
    const singularText = cleanText.replace(/s\b/g, '');
    if (singularText.includes(singularName)) {
      return { name, url };
    }
  }
  return null;
}
