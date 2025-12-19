// Client-side panchang cache for Next.js WebView
// This works with IndexedDB/localStorage in the browser/WebView

const CACHE_PREFIX = 'panchang_cache:';
const CACHE_VERSION = '1.0.0';

// Check if IndexedDB is available
function isIndexedDBAvailable() {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

// Get cached panchang data from IndexedDB or localStorage
export async function getCachedPanchang(date) {
  if (typeof window === 'undefined') return null;

  try {
    const dateStr = typeof date === 'string' ? date :
      date instanceof Date ? date.toISOString().split('T')[0] :
      new Date(date).toISOString().split('T')[0];
    
    const key = `${CACHE_PREFIX}${dateStr}`;
    
    // Try IndexedDB first (better for large files)
    if (isIndexedDBAvailable()) {
      try {
        const db = await openIndexedDB();
        const data = await getFromIndexedDB(db, key);
        if (data) return JSON.parse(data);
      } catch (error) {
        console.warn('IndexedDB error, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached panchang:', error);
    return null;
  }
}

// Save panchang data to cache
export async function savePanchangToCache(date, data) {
  if (typeof window === 'undefined') return false;

  try {
    const dateStr = typeof date === 'string' ? date :
      date instanceof Date ? date.toISOString().split('T')[0] :
      new Date(date).toISOString().split('T')[0];
    
    const key = `${CACHE_PREFIX}${dateStr}`;
    const dataStr = JSON.stringify(data);
    
    // Try IndexedDB first
    if (isIndexedDBAvailable()) {
      try {
        const db = await openIndexedDB();
        await saveToIndexedDB(db, key, dataStr);
        return true;
      } catch (error) {
        console.warn('IndexedDB save error, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    localStorage.setItem(key, dataStr);
    return true;
  } catch (error) {
    console.error('Error saving panchang to cache:', error);
    return false;
  }
}

// Open IndexedDB database
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PanchangCache', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('panchang')) {
        db.createObjectStore('panchang', { keyPath: 'key' });
      }
    };
  });
}

// Get data from IndexedDB
function getFromIndexedDB(db, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['panchang'], 'readonly');
    const store = transaction.objectStore('panchang');
    const request = store.get(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.value : null);
    };
  });
}

// Save data to IndexedDB
function saveToIndexedDB(db, key, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['panchang'], 'readwrite');
    const store = transaction.objectStore('panchang');
    const request = store.put({ key, value });
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Request panchang file from React Native cache via bridge
export async function requestPanchangFromNative(date) {
  if (typeof window === 'undefined' || !window.ReactNativeWebView) {
    return null;
  }

  return new Promise((resolve) => {
    const dateStr = typeof date === 'string' ? date :
      date instanceof Date ? date.toISOString().split('T')[0] :
      new Date(date).toISOString().split('T')[0];
    
    const messageId = `panchang_${dateStr}_${Date.now()}`;
    
    // Set up listener for response
    const listener = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'PANCHANG_CACHE_RESPONSE' && data.messageId === messageId) {
          window.removeEventListener('message', listener);
          resolve(data.data);
        }
      } catch (error) {
        // Ignore parse errors
      }
    };
    
    window.addEventListener('message', listener);
    
    // Request from native
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'GET_PANCHANG_CACHE',
      date: dateStr,
      messageId
    }));
    
    // Timeout after 1 second
    setTimeout(() => {
      window.removeEventListener('message', listener);
      resolve(null);
    }, 1000);
  });
}










