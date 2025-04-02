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

export default clerkMiddleware(async (auth, request) => {
  try {
    const { userId, getToken } = await auth();

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

    if (userId) {
      // Redirect authenticated users to the dashboard if they access public routes
      if (isHomeRoute(request)) {
        return NextResponse.redirect(
          new URL(RedirectDestination.DASHBOARD, request.url)
        );
      }
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

      // Redirect based on the `isVerified` claim
      if (claims.isVerified === null || claims.isVerified === undefined) {
        if (!request.url.includes(RedirectDestination.COMPANY_DETAILS)) {
          return NextResponse.redirect(
            new URL(RedirectDestination.COMPANY_DETAILS, request.url)
          );
        }
      }

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
