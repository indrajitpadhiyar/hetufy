/**
 * Centralized API Configuration Module
 *
 * Supports environment-specific configuration, Render deployment URLs,
 * and runtime user customization via Settings.
 */

// Default Render or local endpoints
const DEFAULT_DEV_API = "http://localhost:4000/api";
// Configurable Render backend URL (must point to /api where Express routes are mounted)
const DEFAULT_PROD_API = "https://idrmusicbackend.onrender.com/api";

/**
 * Normalizes any API URL to ensure it ends with /api (without double slashes)
 */
export function normalizeApiUrl(url) {
  if (!url || typeof url !== "string") return DEFAULT_PROD_API;
  let clean = url.trim().replace(/\/+$/, "");
  // If user entered e.g. "https://idrmusicbackend.onrender.com", append "/api"
  if (!clean.endsWith("/api")) {
    clean = `${clean}/api`;
  }
  return clean;
}

/**
 * Get the active API Base URL.
 * Automatically ensures Electron desktop app connects to live Render backend.
 */
export function getApiBaseUrl() {
  const isElectron = 
    typeof window !== "undefined" && 
    (Boolean(window.electronAPI?.isElectron) || window.location?.protocol === 'file:');

  if (typeof window !== "undefined") {
    const savedUrl = localStorage.getItem("hetufy_api_base_url");
    if (savedUrl && savedUrl.trim()) {
      // Clear stale localhost in packaged desktop app
      if (isElectron && savedUrl.includes("localhost")) {
        localStorage.removeItem("hetufy_api_base_url");
      } else {
        return normalizeApiUrl(savedUrl);
      }
    }
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    if (isElectron && import.meta.env.VITE_API_BASE_URL.includes("localhost")) {
      return normalizeApiUrl(DEFAULT_PROD_API);
    }
    return normalizeApiUrl(import.meta.env.VITE_API_BASE_URL);
  }

  // Desktop apps or production builds connect to hosted Render API
  if (isElectron || !import.meta.env.DEV) {
    return normalizeApiUrl(DEFAULT_PROD_API);
  }

  return DEFAULT_DEV_API;
}

/**
 * Update the active API Base URL at runtime and persist to localStorage
 */
export function setApiBaseUrl(newUrl) {
  if (typeof window !== "undefined") {
    if (newUrl && newUrl.trim()) {
      const sanitized = normalizeApiUrl(newUrl);
      localStorage.setItem("hetufy_api_base_url", sanitized);
      return sanitized;
    } else {
      localStorage.removeItem("hetufy_api_base_url");
      return getApiBaseUrl();
    }
  }
  return DEFAULT_PROD_API;
}

/**
 * Reset API Base URL to environment default
 */
export function resetApiBaseUrl() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("hetufy_api_base_url");
  }
  return getApiBaseUrl();
}

/**
 * Robust fetch wrapper with timeout, Render cold-start detection, and error parsing
 */
export async function apiRequest(endpoint, options = {}, timeoutMs = 50000) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Add auth token if available
  const token =
    typeof window !== "undefined" ? localStorage.getItem("hetufy_token") : null;
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      const timeoutError = new Error(
        `Backend request timed out (${timeoutMs / 1000}s). If your Render backend is spinning up from sleep, please wait 30 seconds and try again.`,
      );
      timeoutError.isTimeout = true;
      throw timeoutError;
    }

    const networkError = new Error(
      `Cannot connect to backend server at ${baseUrl}. Please check your internet connection or Render service status.`,
    );
    networkError.originalError = error;
    networkError.isNetworkError = true;
    throw networkError;
  }
}
