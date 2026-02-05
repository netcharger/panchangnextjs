// Client-side panchang cache for Next.js WebView
// This works with IndexedDB/localStorage in the browser/WebView

const CACHE_PREFIX = 'panchang_cache:';
const CACHE_VERSION = '1.0.0';

// Check if IndexedDB is available
function isIndexedDBAvailable() {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

// Get cached panchang data from IndexedDB or localStorage
async function getCachedPanchang(date) {
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
async function savePanchangToCache(date, data) {
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
async function requestPanchangFromNative(date) {
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

// Batch save daily data to IndexedDB
async function batchSaveToIndexedDB(db, dataList) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['panchang'], 'readwrite');
    const store = transaction.objectStore('panchang');

    transaction.oncomplete = () => {
      console.log(`✅ Batch save complete: ${dataList.length} items`);
      resolve();
    };

    transaction.onerror = (event) => {
      console.error('❌ Batch save transaction failed:', transaction.error);
      reject(transaction.error);
    };

    dataList.forEach(item => {
      const dateStr = item.date;
      const key = `${CACHE_PREFIX}${dateStr}`;
      const dataStr = JSON.stringify(item);
      store.put({ key, value: dataStr });
    });
  });
}

// Check if year data is cached, if not fetch and cache it
async function ensureYearlyDataCached(year, backendUrl) {
  if (typeof window === 'undefined') return false;

  const yearKey = `panchang_year_cached_${year}`;
  const lastSyncKey = `panchang_last_sync_${year}`;
  const yearlyUrl = `${backendUrl}/media/panchang_files/${year}_total_panchangam.json`;

  console.log(`📥 Verifying yearly data for ${year}...`);

  try {
    let shouldDownload = false;
    let serverLastModified = null;

    // 1. Check if we have data (quick check)
    const isCached = localStorage.getItem(yearKey) === 'true';

    // 2. If cached, check for updates on server
    if (isCached) {
        try {
            // Perform HEAD request to check file date with cache buster
            const headUrl = `${yearlyUrl}?t=${new Date().getTime()}`;
            const headResponse = await fetch(headUrl, { method: 'HEAD', cache: 'no-store' });
            
            if (headResponse.ok) {
                serverLastModified = headResponse.headers.get('last-modified');
                const localLastSync = localStorage.getItem(lastSyncKey);
                
                // Also check Content-Length if available
                const serverSize = headResponse.headers.get('content-length');
                // We don't easily have local size in localStorage, so relying mainly on date
                
                console.log(`📅 Header Check - Server: ${serverLastModified} vs Local: ${localLastSync}`);

                if (serverLastModified && localLastSync) {
                    // Normalize dates
                    const serverDate = new Date(serverLastModified);
                    const localDate = new Date(localLastSync);
                    
                    // If server date is different (newer) than local
                    // Note: checking > is usually enough, but strictly different covers some edge cases
                    if (serverDate.getTime() > localDate.getTime()) {
                        console.log(`🆕 New version found! Server: ${serverDate.toISOString()}, Local: ${localDate.toISOString()}`);
                        shouldDownload = true;
                    }
                } else if (!localLastSync) {
                     // No sync record, assume update needed
                     console.log('⚠️ No local sync timestamp found. Force update.');
                     shouldDownload = true;
                }
            }
        } catch (e) {
            console.warn('⚠️ Failed to check server headers:', e);
            // If offline or error, just stick with cache
        }
    } else {
        shouldDownload = true;
    }

    if (!shouldDownload) {
         // Verify integrity just to be safe (optional, can be skipped for speed)
         const sentinelData = await getCachedPanchang(`${year}-01-01`);
         if (sentinelData) {
             // console.log('✅ Daily cache valid and up to date.');
             return true;
         } else {
             console.warn('⚠️ Cache marker exists but data missing. Redownloading.');
             shouldDownload = true;
         }
    }

    // Download the full year JSON
    console.log(`⬇️ Downloading ${year} yearly panchangam JSON...`);
    
    // Use no-store to ensure we get fresh data
    const response = await fetch(yearlyUrl, { cache: 'no-store' });
    
    if (!response.ok) {
       console.error(`❌ Failed to download yearly JSON: ${response.status}`);
       return false;
    }

    // Capture Last-Modified if we didn't get it from HEAD
    if (!serverLastModified) {
        serverLastModified = response.headers.get('last-modified');
    }

    const yearlyData = await response.json();
    
    if (!Array.isArray(yearlyData)) {
      console.error('❌ Invalid yearly data format: expected array');
      return false;
    }

    console.log(`✅ Downloaded ${yearlyData.length} days. Caching to IndexedDB...`);

    if (isIndexedDBAvailable()) {
      const db = await openIndexedDB();
      // Batch save all days
      await batchSaveToIndexedDB(db, yearlyData);
      
      localStorage.setItem(yearKey, 'true');
      if (serverLastModified) {
          localStorage.setItem(lastSyncKey, serverLastModified);
      } else {
          localStorage.setItem(lastSyncKey, new Date().toUTCString());
      }

      console.log(`✅ Yearly data cached successfully for ${year}`);
      return true;
    } else {
      console.warn('⚠️ IndexedDB not available, skipping yearly cache (too big for localStorage)');
      return false;
    }

  } catch (error) {
    console.error('❌ Error in ensureYearlyDataCached:', error);
    return false;
  }
}

module.exports = {
  getCachedPanchang,
  savePanchangToCache,
  requestPanchangFromNative,
  ensureYearlyDataCached
};
