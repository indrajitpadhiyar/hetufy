const { google } = require("googleapis");
const path = require("path");
const Song = require("../models/Song");
const { delCache } = require("../config/redis");

const KEYFILEPATH = path.join(__dirname, "../song-505517-b0b6ca8c2e22.json");

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive",
  ],
});

const drive = google.drive({ version: "v3", auth });

/**
 * List all audio files from Google Drive (including shared folders)
 */
const listAudioFilesFromDrive = async () => {
  try {
    const res = await drive.files.list({
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: "files(id, name, mimeType, size, parents, createdTime)",
    });

    const items = res.data.files || [];

    const audioFiles = items.filter((file) => {
      if (file.mimeType === "application/vnd.google-apps.folder") return false;
      const isAudioMime =
        file.mimeType.includes("audio") ||
        file.mimeType.includes("octet-stream") ||
        file.mimeType.includes("media");
      const isAudioExt = Boolean(
        file.name && file.name.match(/\.(mp3|wav|m4a|flac|ogg|aac|wma|mp4)$/i),
      );
      const isNonMedia =
        file.mimeType.includes("image") ||
        file.mimeType.includes("pdf") ||
        file.mimeType.includes("json");
      return (isAudioMime || isAudioExt) && !isNonMedia;
    });

    console.log(
      `[Google Drive Service] Successfully discovered ${audioFiles.length} audio tracks in Google Drive!`,
    );
    return audioFiles;
  } catch (error) {
    console.error(
      "[Google Drive Service Error]: List files failed:",
      error.message,
    );
    return [];
  }
};

/**
 * List all cover image files from Google Drive
 */
const listCoverImagesFromDrive = async () => {
  try {
    const res = await drive.files.list({
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: "files(id, name, mimeType, webContentLink, thumbnailLink)",
    });
    const files = res.data.files || [];
    const imageFiles = files.filter(
      (f) =>
        !f.mimeType.includes("folder") &&
        (f.mimeType.includes("image") ||
          Boolean(f.name && f.name.match(/\.(jpg|jpeg|png|webp|svg)$/i))),
    );
    console.log(
      `[Google Drive Service] Found ${imageFiles.length} cover images in Google Drive!`,
    );
    return imageFiles;
  } catch (error) {
    console.error("[Google Drive Cover Error]:", error.message);
    return [];
  }
};

/**
 * Smart matching cover image to song based on filename
 */
const findMatchingCover = (songFileName, coverFiles) => {
  if (!coverFiles || coverFiles.length === 0) return null;

  const normalize = (str) =>
    str
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const songNorm = normalize(songFileName);

  // 1. Exact normalized name match
  let match = coverFiles.find((c) => normalize(c.name) === songNorm);
  if (match) return match;

  // 2. Substring match
  match = coverFiles.find((c) => {
    const coverNorm = normalize(c.name);
    return (
      coverNorm &&
      (songNorm.includes(coverNorm) || coverNorm.includes(songNorm))
    );
  });
  if (match) return match;

  // 3. Word token overlap
  const getTokens = (str) =>
    str
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2);
  const songTokens = getTokens(songFileName);

  match = coverFiles.find((c) => {
    const coverTokens = getTokens(c.name);
    return coverTokens.some((token) => songTokens.includes(token));
  });
  if (match) return match;

  // 4. Return first cover image if available
  return coverFiles[0];
};

/**
 * Clean and format title/artist from file name
 */
const formatTitleAndArtist = (fileName) => {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  let artist = "Google Drive Library";
  let title = baseName;

  if (baseName.includes(" - ")) {
    const parts = baseName.split(" - ");
    artist = parts[0].replace(/[-_]+/g, " ").trim();
    title = parts.slice(1).join(" - ").replace(/[-_]+/g, " ").trim();
  } else {
    title = baseName.replace(/[-_]+/g, " ").trim();
  }

  // Capitalize title
  title = title.replace(/\b\w/g, (l) => l.toUpperCase());
  artist = artist.replace(/\b\w/g, (l) => l.toUpperCase());

  return { title, artist };
};

const accentColors = [
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#3b82f6",
  "#10b981",
  "#f97316",
  "#a855f7",
  "#f43f5e",
];

/**
 * Sync Google Drive audio files directly into MongoDB
 */
const syncGoogleDriveSongs = async (baseUrl = "http://localhost:4000") => {
  try {
    const driveFiles = await listAudioFilesFromDrive();
    const coverFiles = await listCoverImagesFromDrive();

    if (driveFiles.length === 0) {
      console.log(
        "[Google Drive Sync] No audio files found in Google Drive yet.",
      );
      return { count: 0, songs: [] };
    }

    const syncedSongs = [];

    for (let i = 0; i < driveFiles.length; i++) {
      const file = driveFiles[i];
      const { title, artist } = formatTitleAndArtist(file.name);

      const audioUrl = `${baseUrl}/api/drive/stream/${file.id}`;

      // Smart match matching cover image file from Drive cover folder
      let coverUrl = `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600`;
      const matchingCover = findMatchingCover(file.name, coverFiles);

      if (matchingCover) {
        coverUrl = `${baseUrl}/api/drive/cover/${matchingCover.id}`;
        console.log(
          `[Google Drive Cover Match] Matched song '${file.name}' with cover image '${matchingCover.name}'!`,
        );
      }

      const songData = {
        _id: file.id,
        id: file.id,
        title,
        artist,
        album: "Google Drive Collection",
        genre: "Drive Music",
        duration: file.size ? Math.max(15, Math.min(600, Math.round(parseInt(file.size, 10) / 16000))) : 30,
        audioUrl,
        coverUrl,
        supabasePath: `gdrive:${file.id}`,
        featured: i < 3,
        accentColor: accentColors[i % accentColors.length],
        releaseYear: new Date().getFullYear().toString(),
      };

      const isMongoConnected = require("mongoose").connection.readyState === 1;

      if (isMongoConnected) {
        try {
          const updatedSong = await Song.findOneAndUpdate(
            { supabasePath: `gdrive:${file.id}` },
            songData,
            { upsert: true, new: true, setDefaultsOnInsert: true },
          );
          syncedSongs.push(updatedSong);
        } catch (e) {
          syncedSongs.push(songData);
        }
      } else {
        syncedSongs.push(songData);
      }
    }

    await delCache("songs:*");
    console.log(
      `[Google Drive Sync] Successfully synced ${syncedSongs.length} songs from Google Drive!`,
    );
    return { count: syncedSongs.length, songs: syncedSongs };
  } catch (error) {
    console.error("[Google Drive Sync Error]:", error.message);
    throw error;
  }
};

/**
 * Get Readable Stream from Google Drive for streaming audio
 */
const getFileStream = async (fileId, headers = {}) => {
  return await drive.files.get(
    { fileId: fileId, alt: "media", supportsAllDrives: true },
    { responseType: "stream", headers: headers },
  );
};

/**
 * Get metadata for file
 */
const getFileMetadata = async (fileId) => {
  const res = await drive.files.get({
    fileId: fileId,
    supportsAllDrives: true,
    fields: "id, name, mimeType, size",
  });
  return res.data;
};

module.exports = {
  drive,
  listAudioFilesFromDrive,
  listCoverImagesFromDrive,
  syncGoogleDriveSongs,
  getFileStream,
  getFileMetadata,
};
