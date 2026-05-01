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

export default clerkMiddleware(async (auth, request) => {
  try {
    const { userId, getToken } = await auth();

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

      // Debug: Log claims structure
      console.log('[PROXY DEBUG] JWT Claims Structure:', {
        sub: claims.sub,
        metadata: claims.metadata,
        publicMetadata: claims.publicMetadata,
        hasMetadata: !!claims.metadata,
        hasPublicMetadata: !!claims.publicMetadata
      });

      // Redirect if the token has expired
      if (claims.exp < currentTime) {
        return NextResponse.redirect(
          new URL(RedirectDestination.SIGN_IN, request.url)
        );
      }

      // NOTE: publicMetadata is NOT included in the convex JWT template by default
      // The client-side guards (BusinessProfileGuard, AccountStatusGuard) will verify:
      // 1. accountStatus in Convex (via checkUserAccess)
      // 2. organizationSettings in Convex (via isBusinessProfileComplete)
      // 3. Clerk publicMetadata.companyDetailsSubmitted
      // So we skip the check here and let client-side guards handle it
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
