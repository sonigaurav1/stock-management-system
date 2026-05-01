import { ConvexClient } from 'convex/browser';

// Create a Convex client for server-side usage
const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL || 'https://your-project.convex.cloud';

export const convexClient = new ConvexClient(convexUrl);
