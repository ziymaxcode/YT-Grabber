# YT Grabber Pro

A professional full-stack YouTube Downloader web application that runs locally on your machine.

## 🏗️ Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Backend**: Python + FastAPI + yt-dlp
- **Communication**: REST API (axios)

## 📋 Prerequisites
- **Python 3.8+** (Make sure to check "Add to PATH" during installation)
- **Node.js 18+**
- **FFmpeg** (Optional but recommended for audio conversion and merging video/audio)

## 🚀 Installation & Launch

### Windows
1. Clone or download this repository.
2. Double-click `start.bat`.
3. The script will automatically install dependencies, start the backend and frontend, and open your browser to `http://localhost:3000`.

### Mac / Linux
1. Clone or download this repository.
2. Open a terminal in the folder.
3. Run `chmod +x start.sh` to make the script executable.
4. Run `./start.sh`.
5. The script will automatically install dependencies, start the servers, and open your browser.

## ⚙️ How to Change Download Folder
1. Open the app in your browser.
2. Click the **Settings** (gear) icon in the top right.
3. Change the "Download Folder Path" to your preferred directory.
4. Click Save.

## 🔗 Supported URL Formats
- Standard YouTube Video (`https://www.youtube.com/watch?v=...`)
- YouTube Shorts (`https://www.youtube.com/shorts/...`)
- YouTube Playlists (`https://www.youtube.com/playlist?list=...`)
- Mobile URLs (`https://youtu.be/...`)

## 🛠️ Troubleshooting Common Errors
- **"Python/Node is not installed"**: Ensure you have installed them and added them to your system PATH.
- **"yt-dlp error: Sign in to confirm you're not a bot"**: Some videos require authentication. You can pass cookies to yt-dlp by modifying the `ydl_opts` in `backend/main.py`.
- **Audio/Video not merging**: Install FFmpeg and add it to your system PATH.
- **Port 8000 or 3000 already in use**: Close other applications using these ports or modify the start scripts to use different ports.

## 🔒 Privacy
This app runs 100% locally. No data is sent to any external server (except YouTube to fetch the video). No API keys are required.
