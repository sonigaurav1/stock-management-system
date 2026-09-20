import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  RedirectDestination,
  RoutePattern
} from './types';

// Create route matchers
const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);
const isProtectedRoute = createRouteMatcher(PROTECTED_ROUTES);
const isHomeRoute = createRouteMatcher([RoutePattern.HOME]);
const isSignInRoute = createRouteMatcher([RoutePattern.SIGN_IN]);
const isSignUpRoute = createRouteMatcher([RoutePattern.SIGN_UP]);
const isDashboardRoute = createRouteMatcher([RoutePattern.DASHBOARD]);
const isCompanyRegistrationRoute = createRouteMatcher([
  RoutePattern.COMPANY_REGISTRATION
]);

// CRITICAL: Dev-only routes (database admin, dev tools) - blocked in production
const isDevOnlyRoute = createRouteMatcher(['/database(.*)', '/dev-tools(.*)']);

export default clerkMiddleware(async (auth, request) => {
  try {
    const { userId, sessionClaims, getToken } = await auth();

    // CRITICAL: Block dev-only routes in production
    if (isDevOnlyRoute(request)) {
      // Block completely in production
      if (
        process.env.NODE_ENV === 'production' ||
        process.env.VERCEL_ENV === 'production'
      ) {
        return new NextResponse('Not Found', { status: 404 });
      }

      // Check if database route authentication is disabled via environment variable
      const isDevAuthDisabled =
        process.env.NEXT_PUBLIC_DEV_ONLY_ROUTE_NO_AUTH === 'true';

      // If auth is disabled for dev routes, allow access without authentication
      if (isDevAuthDisabled) {
        return NextResponse.next();
      }

      // In dev/staging: require authentication
      // if (!userId) {
      //   return NextResponse.redirect(
      //     new URL(RedirectDestination.SIGN_IN, request.url)
      //   );
      // }

      // Require admin access
      // const adminIds =
      //   process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',').map((id) =>
      //     id.trim()
      //   ) || [];
      // const userIdFromClaims = sessionClaims?.sub;

      // if (!adminIds.includes(userIdFromClaims || '')) {
      //   return new NextResponse('Forbidden: admin access required', {
      //     status: 403
      //   });
      // }
    }

    // Redirect authenticated users from home, sign-in, and sign-up to dashboard
    if (
      userId &&
      (isHomeRoute(request) || isSignInRoute(request) || isSignUpRoute(request))
    ) {
      return NextResponse.redirect(
        new URL(RedirectDestination.OVERVIEW, request.url)
      );
    }

    // Allow public routes to proceed without authentication
    if (isPublicRoute(request)) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to the sign-in page for protected routes
    if (!userId && isProtectedRoute(request)) {
      return NextResponse.redirect(
        new URL(RedirectDestination.SIGN_IN, request.url)
      );
    }

    // Fetch the token and parse claims for protected routes
    if (isProtectedRoute(request)) {
      const token = await getToken({ template: 'convex' });
      if (!token) {
        return NextResponse.redirect(
          new URL(RedirectDestination.SIGN_IN, request.url)
        );
      }

      const claims = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Redirect if the token has expired
      if (claims.exp < currentTime) {
        return NextResponse.redirect(
          new URL(RedirectDestination.SIGN_IN, request.url)
        );
      }

      // NOTE: We skip the company details check in middleware because:
      // 1. JWT tokens don't automatically refresh when metadata is updated via API
      // 2. Client-side guards (BusinessProfileGuard, AccountStatusGuard) will handle this check
      // 3. They can query both Convex data and fresh Clerk metadata
      console.log(
        '[PROXY DEBUG] Skipping company details check in middleware (handled by client-side guards)'
      );

      // Redirect based on the legacy `isVerified` claim if present
      if (claims.isVerified === false || claims.isVerified === 'false') {
        if (!request.url.includes(RedirectDestination.VERIFY)) {
          return NextResponse.redirect(
            new URL(RedirectDestination.VERIFY, request.url)
          );
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Middleware error:', error);
    return new Response(
      'An unexpected error occurred. Please try again later.',
      { status: 500 }
    );
  }
});

export const config = {
  matcher: [
    // Apply middleware to all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    '/(api|trpc)(.*)'
  ]
};
