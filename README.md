# Hetufy 🎵

Hetufy is an editorial music streaming and download web application featuring a vintage aesthetic and a modern liquid glass audio player.

## 🚀 Features

- **Liquid Glass Audio Player**: Persistent floating music bar with multi-layered specular reflections, caustic shimmering, seekbar, and glassmorphic controls.
- **Audio Streaming & Downloading**: Seamless playback with real-time Seeking, Shuffle, Repeat, and fast MP3 downloads.
- **Google Drive Integration**: Sync audio files directly from Google Drive.
- **Playlist Management**: Create, view, curate, and filter custom playlists.
- **Responsive & Editorial Design**: Fluid layout tailored for mobile, tablet, and desktop screens.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, MongoDB (Mongoose), Redis, Google Drive API

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/indrajitpadhiyar/hetufy.git
cd hetufy
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your database and Google Drive credentials in .env
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

