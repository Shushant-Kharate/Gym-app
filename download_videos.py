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
    'format': 'b[height<=360]/b[height<=480]/b/worst',
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
            ydl.download([url])
        print(f"Downloaded: {name} ({video_id})")
    except Exception as e:
        print(f"Failed {name} ({video_id}): {e}")

# Run multi-threaded download (5 threads for fast download)
with ThreadPoolExecutor(max_workers=5) as executor:
    executor.map(download_video, all_links)

print("Download process completed.")
