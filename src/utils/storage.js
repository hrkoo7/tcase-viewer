
// Keys used in localStorage
const TOKEN_KEY = 'github_token';

/**
 * Save a value to localStorage
 * @param {string} key
 * @param {string} value
 */
export function setItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

/**
 * Read a value from localStorage
 * @param {string} key
 * @returns {string|null}
 */
export function getItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return null;
  }
}

/**
 * Remove a value from localStorage
 * @param {string} key
 */
export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing from localStorage', e);
  }
}

/**
 * Convenience functions for the GitHub token
 */
export function saveToken(token) {
  setItem(TOKEN_KEY, token);
}

export function getToken() {
  return getItem(TOKEN_KEY);
}

export function clearToken() {
  removeItem(TOKEN_KEY);
}
