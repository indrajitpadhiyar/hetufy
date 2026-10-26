const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const Song = require("../models/Song");
const { delCache } = require("../config/redis");

/**
 * Searches and validates Google Service Account Credentials in the following priority:
 * 1. GOOGLE_APPLICATION_CREDENTIALS environment variable (Standard GCP environment variable)
 * 2. Render Secret File fallback path (/etc/secrets/google-service-account.json)
 * 3. GOOGLE_KEY_FILE environment variable (Relative to backend folder or project root)
 * 4. Local development fallbacks:
 *    - google-service-account.json (backend folder or project root)
 *    - google-credentials.json (backend folder or project root)
 *    - Dynamically discovered song-*.json file in local folders
 * 5. GOOGLE_CREDENTIALS_JSON or GOOGLE_SERVICE_ACCOUNT_JSON (Raw JSON string)
 */
function resolveGoogleCredentials() {
  // Helper to validate and verify credentials file exists and has valid JSON
  const validateCredentialsFile = (filePath, source) => {
    try {
      if (!filePath || typeof filePath !== "string") return null;
      const resolvedPath = path.resolve(filePath);
      if (!fs.existsSync(resolvedPath)) return null;

      const stats = fs.statSync(resolvedPath);
      if (!stats.isFile() || stats.size === 0) return null;

      const raw = fs.readFileSync(resolvedPath, "utf8");
      const parsed = JSON.parse(raw);

      if (parsed.client_email && (parsed.private_key || parsed.private_key_id)) {
        return {
          type: "file",
          filePath: resolvedPath,
          source,
          clientEmail: parsed.client_email,
          projectId: parsed.project_id || "unknown",
        };
      }
    } catch (err) {
      // Invalid JSON or unreadable file - continue fallback
    }
    return null;
  };

  // 1. Priority 1: GOOGLE_APPLICATION_CREDENTIALS environment variable
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const envCredPath = process.env.GOOGLE_APPLICATION_CREDENTIALS.trim();
    if (envCredPath && envCredPath !== "undefined" && envCredPath !== "null") {
      // Direct resolution
      const directMatch = validateCredentialsFile(
        envCredPath,
        "GOOGLE_APPLICATION_CREDENTIALS environment variable"
      );
      if (directMatch) return directMatch;

      // Check relative to backend folder
      const backendRel = path.resolve(__dirname, "..", envCredPath);
      const backendMatch = validateCredentialsFile(
        backendRel,
        "GOOGLE_APPLICATION_CREDENTIALS (relative to backend folder)"
      );
      if (backendMatch) return backendMatch;

      // Check relative to cwd
      const cwdRel = path.resolve(process.cwd(), envCredPath);
      const cwdMatch = validateCredentialsFile(
        cwdRel,
        "GOOGLE_APPLICATION_CREDENTIALS (relative to working directory)"
      );
      if (cwdMatch) return cwdMatch;

      console.warn(
        `[Google Drive Service Warning]: GOOGLE_APPLICATION_CREDENTIALS is set to "${envCredPath}", but the file does not exist. Checking fallback paths...`
      );
    }
  }

  // 2. Priority 2: Render Secret Files mount paths (/etc/secrets/...)
  const renderCandidates = [
    {
      path: "/etc/secrets/google-service-account.json",
      source: "Render Secret File (/etc/secrets/google-service-account.json)",
    },
    {
      path: "/etc/secrets/google-credentials.json",
      source: "Render Secret File (/etc/secrets/google-credentials.json)",
    },
  ];

  for (const candidate of renderCandidates) {
    const validated = validateCredentialsFile(candidate.path, candidate.source);
    if (validated) return validated;
  }

  // 3. Priority 3: GOOGLE_KEY_FILE environment variable (local/custom key path)
  if (process.env.GOOGLE_KEY_FILE) {
    const keyFile = process.env.GOOGLE_KEY_FILE.trim();
    if (keyFile && keyFile !== "undefined" && keyFile !== "null") {
      const candidates = [
        {
          path: path.resolve(__dirname, "..", keyFile),
          source: `GOOGLE_KEY_FILE in backend folder (${path.basename(keyFile)})`,
        },
        {
          path: path.resolve(process.cwd(), keyFile),
          source: `GOOGLE_KEY_FILE in working directory (${path.basename(keyFile)})`,
        },
        {
          path: path.resolve(keyFile),
          source: `GOOGLE_KEY_FILE absolute path (${path.basename(keyFile)})`,
        },
      ];

      for (const cand of candidates) {
        const validated = validateCredentialsFile(cand.path, cand.source);
        if (validated) return validated;
      }
    }
  }

  // 4. Priority 4: Standard local development file locations
  const standardLocalFiles = [
    "google-service-account.json",
    "google-credentials.json",
  ];

  const searchDirs = [
    { dir: path.resolve(__dirname, ".."), label: "Local backend directory" },
    { dir: path.resolve(process.cwd()), label: "Project root directory" },
  ];

  for (const loc of searchDirs) {
    for (const filename of standardLocalFiles) {
      const fullPath = path.join(loc.dir, filename);
      const validated = validateCredentialsFile(
        fullPath,
        `${loc.label} (${filename})`
      );
      if (validated) return validated;
    }
  }

  // Dynamically detect any existing song-*.json in local directories (preserving local setups without hardcoded names)
  for (const loc of searchDirs) {
    try {
      if (fs.existsSync(loc.dir)) {
        const files = fs.readdirSync(loc.dir);
        for (const f of files) {
          if (f.startsWith("song-") && f.endsWith(".json")) {
            const fullPath = path.join(loc.dir, f);
            const validated = validateCredentialsFile(
              fullPath,
              `${loc.label} (${f})`
            );
            if (validated) return validated;
          }
        }
      }
    } catch (e) {
      // Ignore read errors
    }
  }

  // 5. Priority 5: Raw JSON string from environment variable (alternative Render/Cloud configuration)
  const rawJson =
    process.env.GOOGLE_CREDENTIALS_JSON ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (rawJson && rawJson.trim()) {
    try {
      const parsed = JSON.parse(rawJson.trim());
      if (parsed.client_email && (parsed.private_key || parsed.private_key_id)) {
        return {
          type: "inline_json",
          credentials: {
            client_email: parsed.client_email,
            private_key: parsed.private_key,
            projectId: parsed.project_id,
          },
          source: "GOOGLE_CREDENTIALS_JSON environment variable",
          clientEmail: parsed.client_email,
          projectId: parsed.project_id || "unknown",
        };
      }
    } catch (e) {
      console.error(
        "[Google Drive Auth Error] Failed to parse GOOGLE_CREDENTIALS_JSON environment variable."
      );
    }
  }

  return null;
}

let driveInstance = null;
let authClient = null;
let authAttempted = false;

/**
 * Reset drive client state (useful for tests and dynamic re-authentication)
 */
function resetDriveClient() {
  driveInstance = null;
  authClient = null;
  authAttempted = false;
}

/**
 * Initializes and returns the authenticated Google Drive client, or null if unconfigured.
 */
function getDriveClient() {
  if (driveInstance) return driveInstance;
  if (authAttempted && !driveInstance) return null;

  authAttempted = true;
  const resolved = resolveGoogleCredentials();

  if (!resolved) {
    console.warn(
      "[Google Drive Service Warning]: Google Drive service-account credentials not found.\n" +
        "  • For Render production: Mount your service account JSON as a Secret File at /etc/secrets/google-service-account.json, or set GOOGLE_APPLICATION_CREDENTIALS.\n" +
        "  • For local development: Place google-service-account.json in the backend folder or set GOOGLE_KEY_FILE in .env."
    );
    return null;
  }

  try {
    const authOptions = {
      scopes: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive",
      ],
    };

    if (resolved.type === "file") {
      authOptions.keyFile = resolved.filePath;
      process.env.GOOGLE_APPLICATION_CREDENTIALS = resolved.filePath;
    } else if (resolved.type === "inline_json") {
      authOptions.credentials = resolved.credentials;
    }

    authClient = new google.auth.GoogleAuth(authOptions);
    driveInstance = google.drive({ version: "v3", auth: authClient });

    const safeDescription =
      resolved.type === "file"
        ? `${path.basename(resolved.filePath)} (${resolved.clientEmail}) via ${resolved.source}`
        : `${resolved.clientEmail} via ${resolved.source}`;

    console.log(
      `[Google Drive Service] Authenticated successfully using: ${safeDescription}`
    );
    return driveInstance;
  } catch (err) {
    console.error(
      "[Google Drive Service Auth Error]: Failed to initialize Google Auth client:",
      err.message
    );
    return null;
  }
}

/**
 * Transparent proxy for backward compatibility with imports expecting `const { drive } = require(...)`
 */
const drive = new Proxy(
  {},
  {
    get(target, prop) {
      const client = getDriveClient();
      if (!client) {
        throw new Error(
          "Google Drive service is not authenticated. Please check your credentials file or environment variables.",
        );
      }
      return client[prop];
    },
  },
);

/**
 * List all audio files from Google Drive (including shared folders)
 */
const listAudioFilesFromDrive = async () => {
  const client = getDriveClient();
  if (!client) {
    return [];
  }

  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const query = folderId
      ? `'${folderId}' in parents and trashed = false`
      : "trashed = false";

    const res = await client.files.list({
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      q: query,
      fields: "files(id, name, mimeType, size, parents, createdTime)",
    });

    const items = res.data.files || [];

    const audioFiles = items.filter((file) => {
      if (file.mimeType === "application/vnd.google-apps.folder") return false;
      const isAudioMime =
        file.mimeType &&
        (file.mimeType.includes("audio") ||
          file.mimeType.includes("octet-stream") ||
          file.mimeType.includes("media"));
      const isAudioExt = Boolean(
        file.name && file.name.match(/\.(mp3|wav|m4a|flac|ogg|aac|wma|mp4)$/i),
      );
      const isNonMedia =
        file.mimeType &&
        (file.mimeType.includes("image") ||
          file.mimeType.includes("pdf") ||
          file.mimeType.includes("json"));
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
  const client = getDriveClient();
  if (!client) {
    return [];
  }

  try {
    const coverFolderId = process.env.GOOGLE_DRIVE_COVER_FOLDER_ID;
    const query = coverFolderId
      ? `'${coverFolderId}' in parents and trashed = false`
      : "trashed = false";

    const res = await client.files.list({
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      q: query,
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
        "[Google Drive Sync] No audio files found in Google Drive yet (or credentials not configured).",
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
        duration: file.size
          ? Math.max(15, Math.min(600, Math.round(parseInt(file.size, 10) / 16000)))
          : 30,
        audioUrl,
        coverUrl,
        supabasePath: `gdrive:${file.id}`,
        featured: i < 3,
        accentColor: accentColors[i % accentColors.length],
        releaseYear: new Date().getFullYear().toString(),
      };

      const isMongoConnected =
        require("mongoose").connection.readyState === 1;

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
  const client = getDriveClient();
  if (!client) {
    throw new Error("Google Drive service is not configured or authenticated.");
  }
  return await client.files.get(
    { fileId: fileId, alt: "media", supportsAllDrives: true },
    { responseType: "stream", headers: headers },
  );
};

/**
 * Get metadata for file
 */
const getFileMetadata = async (fileId) => {
  const client = getDriveClient();
  if (!client) {
    throw new Error("Google Drive service is not configured or authenticated.");
  }
  const res = await client.files.get({
    fileId: fileId,
    supportsAllDrives: true,
    fields: "id, name, mimeType, size",
  });
  return res.data;
};

module.exports = {
  drive,
  getDriveClient,
  resetDriveClient,
  resolveGoogleCredentials,
  listAudioFilesFromDrive,
  listCoverImagesFromDrive,
  syncGoogleDriveSongs,
  getFileStream,
  getFileMetadata,
};
