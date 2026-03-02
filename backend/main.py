import os
import json
import asyncio
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import yt_dlp

app = FastAPI(title="YT Grabber Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOWNLOADS_DIR = os.path.join(os.path.dirname(__file__), "downloads")
HISTORY_FILE = os.path.join(os.path.dirname(__file__), "downloads.json")
SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "settings.json")

os.makedirs(DOWNLOADS_DIR, exist_ok=True)

# Default Settings
default_settings = {
    "download_folder": DOWNLOADS_DIR,
    "max_concurrent": 3,
    "auto_convert_mp3": False,
    "filename_template": "%(title)s.%(ext)s",
    "theme": "dark"
}

def load_json(file_path, default_data):
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            pass
    return default_data

def save_json(file_path, data):
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

# In-memory progress tracking
active_downloads = {}

class URLRequest(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    format_id: str
    is_audio: bool = False

class SettingsUpdate(BaseModel):
    download_folder: str
    max_concurrent: int
    auto_convert_mp3: bool
    filename_template: str
    theme: str

@app.post("/api/info")
async def get_video_info(req: URLRequest):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': 'in_playlist',
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(req.url, download=False)
            
            if 'entries' in info:
                # It's a playlist
                return {
                    "type": "playlist",
                    "title": info.get("title", "Unknown Playlist"),
                    "uploader": info.get("uploader", "Unknown"),
                    "entries": [
                        {
                            "id": entry.get("id"),
                            "title": entry.get("title"),
                            "duration": entry.get("duration"),
                            "url": entry.get("url") or f"https://www.youtube.com/watch?v={entry.get('id')}"
                        } for entry in info['entries'] if entry
                    ]
                }
            else:
                # Single video
                formats = []
                for f in info.get('formats', []):
                    if f.get('vcodec') != 'none':
                        formats.append({
                            "format_id": f.get('format_id'),
                            "ext": f.get('ext'),
                            "resolution": f.get('resolution') or f"{f.get('width')}x{f.get('height')}",
                            "filesize": f.get('filesize') or f.get('filesize_approx'),
                            "type": "video"
                        })
                    elif f.get('vcodec') == 'none' and f.get('acodec') != 'none':
                        formats.append({
                            "format_id": f.get('format_id'),
                            "ext": f.get('ext'),
                            "abr": f.get('abr'),
                            "filesize": f.get('filesize') or f.get('filesize_approx'),
                            "type": "audio"
                        })
                
                return {
                    "type": "video",
                    "id": info.get("id"),
                    "title": info.get("title"),
                    "thumbnail": info.get("thumbnail"),
                    "uploader": info.get("uploader"),
                    "duration": info.get("duration"),
                    "view_count": info.get("view_count"),
                    "formats": formats
                }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/download")
async def start_download(req: DownloadRequest):
    import uuid
    download_id = str(uuid.uuid4())
    active_downloads[download_id] = {
        "status": "starting",
        "progress": 0,
        "speed": "",
        "eta": "",
        "filename": ""
    }
    
    settings = load_json(SETTINGS_FILE, default_settings)
    out_tmpl = os.path.join(settings["download_folder"], settings["filename_template"])
    
    def progress_hook(d):
        if d['status'] == 'downloading':
            import re

            def clean_ansi(text):
                return re.sub(r'\x1b\[[0-9;]*m', '', text or '')

            if d['status'] == 'downloading':
                percent_str = clean_ansi(d.get('_percent_str', '0%')).replace('%', '').strip()
    
                try:
                    prog = float(percent_str)
                except:
                     prog = 0.0

                speed = clean_ansi(d.get('_speed_str', ''))
                eta = clean_ansi(d.get('_eta_str', ''))

                active_downloads[download_id].update({
                    "status": "downloading",
                    "progress": prog,
                    "speed": speed,
                    "eta": eta,
                    "filename": d.get('filename', '')
                })
        elif d['status'] == 'finished':
            # Only save history when merging is done
            if d.get('info_dict', {}).get('_filename'):
                filename = d['info_dict']['_filename']
            else:
                filename = d.get('filename', '')

            # Save only once
            if active_downloads[download_id]["status"] != "finished":
                active_downloads[download_id].update({
                    "status": "finished",
                    "progress": 100,
                    "filename": filename
                })

                history = load_json(HISTORY_FILE, [])
                history.insert(0, {
                    "id": download_id,
                    "title": os.path.basename(filename),
                    "path": filename, 
                    "format": req.format_id,
                    "date": __import__('datetime').datetime.now().isoformat(),
                    "filesize": os.path.getsize(filename) if os.path.exists(filename) else 0
                })

                save_json(HISTORY_FILE, history[:20])

    ydl_opts = {
        'format': f"{req.format_id}+bestaudio[ext=m4a]/best",
        'merge_output_format': 'mp4',
        'outtmpl': out_tmpl,
        'progress_hooks': [progress_hook],
        'quiet': True,
        'no_warnings': True,
        'keepvideo': False
    }
    
    if req.is_audio or settings["auto_convert_mp3"]:
        ydl_opts['format'] = 'bestaudio/best'
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]

    def download_task():
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([req.url])
        except Exception as e:
            active_downloads[download_id]["status"] = "error"
            active_downloads[download_id]["error"] = str(e)

    import threading
    threading.Thread(target=download_task).start()
    
    return {"download_id": download_id}

@app.get("/api/progress/{download_id}")
async def get_progress(download_id: str):
    async def event_generator():
        while True:
            if download_id in active_downloads:
                data = active_downloads[download_id]
                yield f"data: {json.dumps(data)}\n\n"
                if data["status"] in ["finished", "error"]:
                    break
            else:
                yield f"data: {json.dumps({'status': 'not_found'})}\n\n"
                break
            await asyncio.sleep(0.5)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/history")
async def get_history():
    return load_json(HISTORY_FILE, [])

@app.delete("/api/history/{download_id}")
async def delete_history(download_id: str):
    history = load_json(HISTORY_FILE, [])
    history = [h for h in history if h["id"] != download_id]
    save_json(HISTORY_FILE, history)
    return {"status": "success"}

@app.get("/api/settings")
async def get_settings():
    return load_json(SETTINGS_FILE, default_settings)

@app.post("/api/settings")
async def update_settings(settings: SettingsUpdate):
    save_json(SETTINGS_FILE, settings.dict())
    return {"status": "success"}

import subprocess

@app.get("/api/open-file")
async def open_file(path: str):
    if os.path.exists(path):
        subprocess.Popen(f'explorer /select,"{path}"')
        return {"status": "opened"}
    return {"status": "not_found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
