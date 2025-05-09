# Video Downloader & Trimmer Web App

A fullstack JavaScript web app to download, trim, convert, and generate HLS for videos using yt-dlp, ffmpeg, and parallel.

## Requirements
- Node.js (v18+)
- yt-dlp (installed and in PATH)
- ffmpeg (installed and in PATH)
- GNU parallel (installed and in PATH)

## Setup

### Backend
```
cd backend
npm install
npm start
```

### Frontend
```
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000, backend on http://localhost:5000

---

## Features
- Download videos from URL (yt-dlp)
- Choose quality/format
- Download progress bar
- Screenshots every 60s
- Trim video by time or thumbnail
- Convert to different formats (ffmpeg + parallel)
- Generate HLS set (ffmpeg + parallel)
- Multiple dark/light themes

---

## Theming
- UI is styled with a dark fluent style and neon gradients
- Theme selector in settings

---

## Notes
- yt-dlp, ffmpeg, and parallel must be installed separately
- All heavy processing is done server-side (Node.js)
