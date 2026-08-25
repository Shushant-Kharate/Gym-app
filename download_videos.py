import os
import json
import re
from concurrent.futures import ThreadPoolExecutor
import yt_dlp

VIDEOS_DIR = os.path.join(os.path.dirname(__file__), 'public', 'videos')
os.makedirs(VIDEOS_DIR, exist_ok=True)

# Load exercise links
with open(os.path.join(os.path.dirname(__file__), 'exercise_links.json'), 'r') as f:
    data = json.load(f)

# Flatten all links into (name, url)
all_links = []
for category, exercises in data.items():
    for name, url in exercises.items():
        if url:
            all_links.append((name, url))

def extract_yt_id(url):
    m = re.search(r'(?:v=|\/shorts\/|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})', url)
    return m.group(1) if m else None

ydl_opts = {
    # Local players are muted, so prefer a broadly supported H.264 video stream.
    # YouTube often exposes short-form videos as video-only DASH streams; using
    # `best` (combined audio/video) can select an inaccessible HLS URL and 403.
    # Format 134 is YouTube's standard H.264 360p stream. This also avoids
    # treating a vertical Short's 640-pixel long edge as its quality tier.
    'format': '134/18/160',
    'outtmpl': os.path.join(VIDEOS_DIR, '%(id)s.%(ext)s'),
    'quiet': True,
    'no_warnings': True,
    'ignoreerrors': True,
}

print(f"Total exercises to download: {len(all_links)}")

def download_video(item):
    name, url = item
    video_id = extract_yt_id(url)
    if not video_id:
        return
    out_file = os.path.join(VIDEOS_DIR, f"{video_id}.mp4")
    if os.path.exists(out_file) and os.path.getsize(out_file) > 1000:
        print(f"Already exists: {name} ({video_id})")
        return
    
    opts = ydl_opts.copy()
    opts['outtmpl'] = os.path.join(VIDEOS_DIR, f"{video_id}.%(ext)s")
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            result = ydl.download([url])
        if result == 0 and os.path.exists(out_file) and os.path.getsize(out_file) > 1000:
            print(f"Downloaded: {name} ({video_id})")
        else:
            print(f"Failed: {name} ({video_id}) — no MP4 was created")
    except Exception as e:
        print(f"Failed {name} ({video_id}): {e}")

# Run multi-threaded download (5 threads for fast download)
with ThreadPoolExecutor(max_workers=5) as executor:
    executor.map(download_video, all_links)

print("Download process completed.")
