import axios from "axios";
import getBaseURL from "./getBaseURL";

const API_BASE = getBaseURL();

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // Reduced from 15000 to 10000 (10 seconds)
  headers: { "Content-Type": "application/json" }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ API Request timeout:', error.config?.url);
      error.message = 'Request timeout. Please check your connection.';
    } else if (error.response) {
      // Server responded with error status
      console.error('❌ API Error:', error.response.status, error.config?.url);
      error.message = `Server error (${error.response.status}). Please try again.`;
    } else if (error.request) {
      // Request made but no response
      console.error('🌐 Network Error:', error.config?.url);
      error.message = 'Network error. Please check your internet connection.';
    }
    return Promise.reject(error);
  }
);

// 🔥 Add this interceptor RIGHT HERE
api.interceptors.request.use((config) => {
  console.log("🚀 API REQUEST:", config.baseURL + config.url);
  return config;
});

// Log the API base URL in development for debugging
if (typeof window !== 'undefined') {
  console.log('🌐 API Base URL:', API_BASE);
  console.log('🔍 Environment:', {
    isWebView: typeof window !== 'undefined' && (
      window.ReactNativeWebView !== undefined ||
      window.navigator?.userAgent?.includes('ReactNative')
    ),
    userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'N/A',
    envVar: process.env.NEXT_PUBLIC_API_BASE || 'Not set'
  });
}

// Fetch carousel images from Django API
export const fetchCarouselImages = async () => {
  try {
    const response = await api.get('/api/mobile-settings/carousel-images/');

    // Handle paginated response (Django REST framework format)
    let dataArray = [];
    if (Array.isArray(response.data)) {
      // Direct array response
      dataArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      // Paginated response with results property
      dataArray = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
      // Alternative paginated format
      dataArray = response.data.data;
    }

    // Filter only active images and sort by order
    const images = dataArray
      .filter(img => img.is_active === true)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return images;
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    return [];
  }
};

// Fetch categories from Django API
export const fetchCategories = async () => {
  try {
    const response = await api.get('/api/posts/categories/');
    const apiUrl = response.config.baseURL + response.config.url;
    console.log('Categories API response:',apiUrl);

    // Handle paginated response (Django REST framework format)
    let dataArray = [];
    if (Array.isArray(response.data)) {
      dataArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      dataArray = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
      dataArray = response.data.data;
    }

    // If no data found, return empty array but log it
    if (dataArray.length === 0) {
      console.warn('⚠️ Categories API returned empty array');
    }

    return dataArray;
  } catch (error) {
    console.error('❌ Error fetching categories:', error.message || error);
    // Re-throw the error so React Query can handle it properly
    throw error;
  }
};

// Fetch posts by category from Django API
export const fetchPostsByCategory = async (categorySlug) => {
  try {
    const response = await api.get(`/api/posts/posts/?category=${categorySlug}`);



    // Handle paginated response (Django REST framework format)
    let dataArray = [];
    if (Array.isArray(response.data)) {
      // Direct array response
      dataArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      // Paginated response with results property
      dataArray = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
      // Alternative paginated format
      dataArray = response.data.data;
    }

    return dataArray;
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }
};

// Fetch a single post by slug or ID from Django API
export const fetchPostBySlug = async (slug) => {
  try {
    const response = await api.get(`/api/posts/posts/${slug}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    // If slug endpoint fails, try fetching by ID or search
    try {
      const searchResponse = await api.get(`/api/posts/posts/?slug=${slug}`);
      if (Array.isArray(searchResponse.data)) {
        return searchResponse.data[0] || null;
      } else if (searchResponse.data?.results?.length > 0) {
        return searchResponse.data.results[0] || null;
      }
      return null;
    } catch (searchError) {
      console.error('Error searching for post:', searchError);
      return null;
    }
  }
};




// Fetch a single post by ID from Django API
export const fetchPostById = async (id) => {
  try {
    const response = await api.get(`/api/posts/posts/by-id/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post by id:', error);
    return null;
  }
};

// Fetch posts by tag from Django API
export const fetchPostsByTag = async (tagSlug) => {
  try {
    const response = await api.get(`/api/posts/posts/?tag=${tagSlug}`);

    // Handle paginated response (Django REST framework format)
    let dataArray = [];
    if (Array.isArray(response.data)) {
      // Direct array response
      dataArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      // Paginated response with results property
      dataArray = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
      // Alternative paginated format
      dataArray = response.data.data;
    }

    return dataArray;
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return [];
  }
};

// Fetch all posts from Django API
export const fetchAllPosts = async () => {
  try {
    const response = await api.get('/api/posts/posts/');

    // Handle paginated response (Django REST framework format)
    let dataArray = [];
    if (Array.isArray(response.data)) {
      // Direct array response
      dataArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      // Paginated response with results property
      dataArray = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
      // Alternative paginated format
      dataArray = response.data.data;a
    }

    return dataArray;
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
};

// Fetch panchangam data for a specific date
export const fetchPanchangam = async (date, language = 'te') => {
  try {
    // Format date as YYYY-MM-DD
    const dateStr = typeof date === 'string' ? date :
      date instanceof Date ? date.toISOString().split('T')[0] :
      new Date(date).toISOString().split('T')[0];

    // Only use cache on client side (not during SSR)
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid SSR issues
        const { getCachedPanchang, savePanchangToCache, requestPanchangFromNative } = await import('./panchangCache');

        // Step 1: Try to get from native cache (React Native mobile app)
        if (window.ReactNativeWebView) {
          const nativeData = await requestPanchangFromNative(dateStr);
          if (nativeData) {
            console.log(`✅ Mobile View: Data loaded from native cache for ${dateStr}`);
            // Also cache in browser storage
            await savePanchangToCache(dateStr, nativeData);
            return nativeData;
          } else {
            // If not in native cache, download it
            console.log(`⬇️ Mobile View: Panchang data not in native cache, downloading for: ${dateStr}`);
            const url = `/panchang_files/${dateStr}.json`; // This block now serves as the primary SSR fetch or a final fallback
            console.log(`Mobile View Download URL: ${url}`);

            const response = await fetch(url, {
              cache: 'no-store', // Always fetch fresh data for mobile if not cached
            });

            if (!response.ok) {
              console.error(`Panchangam file not found: ${dateStr}.json (Status: ${response.status})`);
              return null;
            }

            const data = await response.json();
            await savePanchangToCache(dateStr, data); // Cache it after download
            return data;
          }
        }

    // For web view and SSR, prioritize Django API directly
    console.log(`🌐 Fetching panchang from Django API: ${dateStr}`);
    const djangoUrl = `${API_BASE}/media/panchang_files/${dateStr}.json`;
    console.log(`Fetch URL: ${djangoUrl}`);
    
    const response = await fetch(djangoUrl, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.warn(`Panchangam not found in Django API, trying local fallback: ${dateStr}.json`);
      // Fallback to local public folder
      const localUrl = `/panchang_files/${dateStr}.json`;
      const localResponse = await fetch(localUrl, { cache: 'no-store' });
      
      if (!localResponse.ok) {
        console.error(`Panchangam file not found anywhere for ${dateStr}`);
        return null;
      }
      
      const localData = await localResponse.json();
      return localData;
    }

    const data = await response.json();

    // Save to cache for future use (only on client)
    if (typeof window !== 'undefined' && !window.ReactNativeWebView) {
      try {
        const { savePanchangToCache } = await import('./panchangCache');
        await savePanchangToCache(dateStr, data);
      } catch (cacheError) {
        console.warn('Failed to save to cache:', cacheError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error fetching panchangam:', error);
    // Return null or a default structure if fetch fails
    return null;
  }
};

// Fetch wallpaper main categories
export const fetchWallpaperMainCategories = async () => {
  try {
    const response = await api.get('/api/wallpapers/categories/');

    let dataArray = [];
    if (Array.isArray(response.data)) {
      dataArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      dataArray = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
      dataArray = response.data.data;
    }

    // Filter only active categories if is_active field exists
    const activeCategories = dataArray.filter(cat =>
      cat.is_active !== false // Include if is_active is true or undefined
    );

    // Sort by order if available
    return activeCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error fetching wallpaper main categories:', error);
    return [];
  }
};

// Fetch wallpaper sub categories by main category ID
// This endpoint returns sub categories directly when main_category_id is provided
export const fetchWallpaperSubCategories = async (mainCategoryId) => {
  try {
    const response = await api.get(`/api/wallpapers/wallpapers/`, {
      params: {
        main_category_id: mainCategoryId
      }
    });

    console.log('Sub categories API response:', response.data);

    let dataArray = [];
    if (Array.isArray(response.data)) {
      // Direct array response - these are sub categories
      dataArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      // Paginated response
      dataArray = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
      // Alternative paginated format
      dataArray = response.data.data;
    }

    // Filter only active sub categories if is_active field exists
    const activeSubCategories = dataArray.filter(cat =>
      cat.is_active !== false // Include if is_active is true or undefined
    );

    // Sort by order if available
    const sortedSubCategories = activeSubCategories.sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log('Processed sub categories:', sortedSubCategories);
    return sortedSubCategories;
  } catch (error) {
    console.error('Error fetching wallpaper sub categories:', error);
    console.error('Error details:', error.response?.data || error.message);
    return [];
  }
};

// Fetch wallpapers by sub category ID
export const fetchWallpapers = async (mainCategoryId, subCategoryId, page = 1, pageSize = 20) => {
  try {
    const response = await api.get(`/api/wallpapers/wallpapers/`, {
      params: {
        sub_category_id: subCategoryId,
        page: page,
        page_size: pageSize
      }
    });

    let dataArray = [];
    if (Array.isArray(response.data)) {
      dataArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      dataArray = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
      dataArray = response.data.data;
    }

    // Ensure we always return a valid structure
    const result = {
      wallpapers: Array.isArray(dataArray) ? dataArray : [],
      count: response.data?.count || (Array.isArray(dataArray) ? dataArray.length : 0),
      next: response.data?.next || null,
      previous: response.data?.previous || null
    };

    console.log('fetchWallpapers result:', result);
    return result;
  } catch (error) {
    console.error('Error fetching wallpapers:', error);
    return {
      wallpapers: [],
      count: 0,
      next: null,
      previous: null
    };
  }
};

// Fetch latest wallpapers from Django API
export const fetchLatestWallpapers = async (limit = 10) => {
  try {
    const response = await api.get('/api/wallpapers/wallpapers/', {
      params: {
        page: 1,
        page_size: limit,
        ordering: '-created_at' // Sort by creation date descending (newest first)
      }
    });

    let dataArray = [];
    if (Array.isArray(response.data)) {
      dataArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      dataArray = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
      dataArray = response.data.data;
    }

    // Sort by created_at if available, otherwise return as is
    if (dataArray.length > 0 && dataArray[0].created_at) {
      dataArray.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA; // Newest first
      });
    }

    return dataArray.slice(0, limit);
  } catch (error) {
    console.error('Error fetching latest wallpapers:', error);
    return [];
  }
};

// Fetch wallpapers from a next page URL (for infinite scroll)
export const fetchWallpapersNextPage = async ({ pageParam = 1, queryKey }) => {
  const [, mainCategoryId, subCategoryId] = queryKey;

  try {
    // If pageParam is a URL, extract the path and query string
    if (typeof pageParam === 'string' && pageParam.startsWith('http')) {
      // Extract path and query from full URL
      const url = new URL(pageParam);
      const pathWithQuery = url.pathname + url.search;

      // Use axios to fetch from the path (relative to baseURL)
      const response = await api.get(pathWithQuery);

      let dataArray = [];
      if (Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        dataArray = response.data.results;
      } else if (response.data && Array.isArray(response.data.data)) {
        dataArray = response.data.data;
      }

      return {
        wallpapers: dataArray,
        next: response.data?.next || null,
        previous: response.data?.previous || null,
        count: response.data?.count || dataArray.length
      };
    }

    // Otherwise, use page number
    return await fetchWallpapers(mainCategoryId, subCategoryId, pageParam, 20);
  } catch (error) {
    console.error('Error fetching next page:', error);
    return {
      wallpapers: [],
      next: null,
      previous: null,
      count: 0
    };
  }
};

// Fetch music/audio categories from Django API
export const fetchMusicCategories = async () => {
  try {
    const response = await api.get('/api/audio-manager/categories/');

    // Handle paginated response (Django REST framework format)
    let dataArray = [];
    if (Array.isArray(response.data)) {
      dataArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      dataArray = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
      dataArray = response.data.data;
    }

    // Sort by order if available
    return dataArray.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error fetching music categories:', error);
    return [];
  }
};

// Fetch music category by slug with subcategories
export const fetchMusicCategoryBySlug = async (slug) => {
  try {
    const response = await api.get(`/api/audio-manager/categories/${slug}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching music category by slug:', error);
    return null;
  }
};

// Fetch audio files by category slug
export const fetchAudioFilesByCategory = async (categorySlug) => {
  try {
    const response = await api.get('/api/audio-manager/audio-files/', {
      params: {
        category: categorySlug
      }
    });

    // Handle paginated response (Django REST framework format)
    let dataArray = [];
    if (Array.isArray(response.data)) {
      dataArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      dataArray = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
      dataArray = response.data.data;
    }

    return dataArray;
  } catch (error) {
    console.error('Error fetching audio files by category:', error);
    return [];
  }
};

export default api;

