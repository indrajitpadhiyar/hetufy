/**
 * IDRMusic Version & In-App Update Checker
 */

export const CURRENT_APP_VERSION = "1.0.1";
export const CURRENT_VERSION_CODE = 2;

/**
 * Compare two semver strings (e.g. "1.0.1" vs "1.0.0")
 */
function isNewer(latest, current) {
  const lParts = latest.split('.').map(n => parseInt(n, 10) || 0);
  const cParts = current.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(lParts.length, cParts.length); i++) {
    const l = lParts[i] || 0;
    const c = cParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

export async function checkForAppUpdate() {
  const updateEndpoints = [
    'https://idrmusicbackend.onrender.com/api/version',
    'https://idrmusic.netlify.app/version.json',
    '/version.json'
  ];

  for (const url of updateEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const latestCode = Number(data.latestVersionCode) || 1;
        const latestVer = data.latestVersion || "1.0.1";
        const isUpdateAvailable = latestCode > CURRENT_VERSION_CODE || isNewer(latestVer, CURRENT_APP_VERSION);

        if (isUpdateAvailable) {
          return {
            hasUpdate: true,
            currentVersion: CURRENT_APP_VERSION,
            latestVersion: latestVer,
            latestVersionCode: latestCode,
            apkUrl: data.apkUrl || 'https://idrmusic.netlify.app/IDRMusic.apk',
            releaseNotes: data.releaseNotes || 'New features, improved performance, and bug fixes.',
            mandatory: data.mandatory || false
          };
        }
        return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION };
      }
    } catch (e) {
      // Continue to next endpoint fallback
    }
  }

  return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION };
}

