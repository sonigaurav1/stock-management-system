import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

// ============ SINGLETON PATTERN: Initialize once ============
// Cache to prevent multiple initializations on each request
interface CachedEdgeStore {
  router: any;
  handler: any;
}

let cachedEdgeStore: CachedEdgeStore | null = null;

/**
 * Initialize EdgeStore once and cache the result
 * Prevents multiple initializations which causes memory leaks
 */
function initializeEdgeStore(): CachedEdgeStore {
  // Return cached instance if already initialized
  if (cachedEdgeStore) {
    return cachedEdgeStore;
  }

  // Initialize only once
  const es = initEdgeStore.create();

  /**
   * This is the main router for the Edge Store buckets.
   */
  const edgeStoreRouter = es.router({
    publicFiles: es.fileBucket().beforeDelete(() => {
      return true;
    })
  });

  // Enable verbose logging in development so server-side errors from the
  // Edge Store provider are easier to debug (will log to the Next.js server
  // console). Keep default level in production.
  const logLevel = process.env.NODE_ENV === 'development' ? 'info' : undefined;

  const handler = createEdgeStoreNextHandler({
    router: edgeStoreRouter,
    ...(logLevel ? { logLevel } : {})
  });

  // Cache the initialized instance
  cachedEdgeStore = {
    router: edgeStoreRouter,
    handler
  };

  // Log initialization in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[EdgeStore] Singleton initialized and cached');
  }

  return cachedEdgeStore;
}

// Initialize EdgeStore once
const edgeStore = initializeEdgeStore();

// Export handler using cached instance
export const { handler } = edgeStore;
export const GET = handler;
export const POST = handler;

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStore.router;
