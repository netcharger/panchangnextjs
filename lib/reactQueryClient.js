const { QueryClient } = require('@tanstack/react-query');
const { persistQueryClient } = require('@tanstack/react-query-persist-client');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24 * 7, // gcTime replaces cacheTime in v5
      refetchOnWindowFocus: false
    },
  },
});

// Only set up persistence on the client side (browser)
if (typeof window !== 'undefined') {
  // Dynamically import localforage only on the client side
  import('localforage').then((localforageModule) => {
    const localforage = localforageModule.default || localforageModule;
    
    // Create persistor with all required methods - ensure it's properly structured
    const persistor = {
      persistClient: async (client) => {
        try {
          await localforage.setItem("REACT_QUERY_OFFLINE_CACHE", client);
        } catch (error) {
          console.warn("Failed to persist client:", error);
        }
      },
      restoreClient: async () => {
        try {
          const cache = await localforage.getItem("REACT_QUERY_OFFLINE_CACHE");
          return cache || undefined;
        } catch (error) {
          console.warn("Failed to restore client:", error);
          return undefined;
        }
      },
      removeClient: async () => {
        try {
          await localforage.removeItem("REACT_QUERY_OFFLINE_CACHE");
        } catch (error) {
          console.warn("Failed to remove client:", error);
        }
      },
    };

    // Initialize persistence - React Query v5 uses 'persister' property
    // The persister object must have persistClient, restoreClient, and removeClient methods
    try {
      persistQueryClient({
        queryClient,
        persister: persistor
      });
    } catch (e) {
      console.warn("React Query persistence initialization error:", e);
    }
  }).catch((e) => {
    console.warn("Failed to load localforage:", e);
  });
}

module.exports = queryClient;
