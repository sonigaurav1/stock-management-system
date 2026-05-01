import { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

// Define route patterns with enums for better type safety
export enum RoutePattern {
  SIGN_IN = '/sign-in(.*)',
  SIGN_UP = '/sign-up(.*)',
  HOME = '/',
  LANDING = '/landing(.*)',
  FORGOT_PASSWORD = '/forgot-password(.*)',
  DASHBOARD = '/dashboard(.*)',
  PROFILE = '/profile(.*)',
  SETTINGS = '/settings(.*)',
  BILLING = '/billing(.*)',
  LEDGER = '/ledger(.*)',
  VERIFY_EMAIL = '/verify-email(.*)',
  VERIFY = '/verify(.*)',
  COMPANY_DETAILS = '/company-details(.*)',
  COMPANY_REGISTRATION = '/company-registration(.*)',
  ONBOARDING = '/onboarding(.*)',
  ABOUT = '/about(.*)'
}

// Define URL destinations to prevent typos
export enum RedirectDestination {
  SIGN_IN = '/sign-in',
  DASHBOARD = '/dashboard',
  OVERVIEW = '/dashboard/overview',
  VERIFY = '/verify',
  COMPANY_DETAILS = '/company-details',
  COMPANY_REGISTRATION = '/company-registration'
}

// Define public routes that don't require authentication
export const PUBLIC_ROUTES = [
  RoutePattern.HOME,
  RoutePattern.LANDING,
  RoutePattern.SIGN_IN,
  RoutePattern.SIGN_UP,
  RoutePattern.FORGOT_PASSWORD,
  RoutePattern.VERIFY_EMAIL,
  RoutePattern.VERIFY,
  RoutePattern.COMPANY_DETAILS,
  RoutePattern.COMPANY_REGISTRATION,
  RoutePattern.ONBOARDING,
  RoutePattern.ABOUT
];

// Define protected routes that require authentication
export const PROTECTED_ROUTES = [
  RoutePattern.DASHBOARD,
  RoutePattern.PROFILE,
  RoutePattern.SETTINGS,
  RoutePattern.BILLING,
  RoutePattern.LEDGER
];
