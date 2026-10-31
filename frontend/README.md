# IDRMUSIC — Web, Desktop & Android Client 🎵

The core frontend client for IDRMUSIC, supporting Web, Windows Desktop (Electron), and Android Mobile (Capacitor).

## 🚀 Supported Platforms

- **🌐 Web**: React 19 + Vite 8 + Tailwind CSS v4.
- **🪟 Windows Desktop**: Electron 45 with NSIS installer and Portable single-file builds.
- **📱 Android**: Capacitor 8 with native Android foreground audio service and lockscreen controls.

## 📦 Scripts

```bash
# Run web app in browser
npm run dev

# Run desktop app locally in Electron
npm run electron:dev

# Build web production bundle
npm run build

# Build Windows desktop installer and portable .exe
npm run build:installer

# Sync web build to native Android project
npm run android:build

# Open native Android project in Android Studio
npm run android:open
```

## 🛠️ Environment Configuration

Create a `.env` file in `frontend/`:
```ini
VITE_API_BASE_URL=https://idrmusicbackend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_web_google_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID_DESKTOP=your_desktop_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_ID_DESKTOP=your_desktop_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET_DESKTOP=your_desktop_google_client_secret
```
