'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import { NavItem } from '@/types';
import {
  BadgeCheck,
  BadgeInfo,
  Bell,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  GalleryVerticalEnd,
  LogOut,
  MessageSquare,
  Crown,
  Shield,
  User,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { Icons } from '../icons';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { capitalizeWords } from '@/lib/utils';

// Enterprise role-based navigation imports
import {
  ROLE_CONFIG,
  ROLE_QUICK_ACTIONS,
  filterNavByRole,
  getQuickActions,
  getRoleDisplayInfo,
  ROLE_HIERARCHY,
  MENU_PERMISSIONS
} from '@/config/role-nav-config';

export const company = {
  name: 'NextTech',
  logo: GalleryVerticalEnd,
  plan: 'Enterprise'
};

/**
 * Get role icon component
 */
function getRoleIcon(iconName: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    crown: Crown,
    shield: Shield,
    user: User,
    eye: Eye
  };
  return icons[iconName] || User;
}

/**
 * Enterprise AppSidebar with full role-based navigation
 * Provides different sidebar experiences for owner, manager, staff, and viewer
 */
export default function AppSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const context = useQuery(api.companyAccess.getCallerContext);

  const [isHydrated, setIsHydrated] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Get user context
  const hydratedUser = isHydrated ? user : null;
  const userName = hydratedUser?.fullName || 'Guest User';
  const userEmail =
    hydratedUser?.emailAddresses[0]?.emailAddress || 'guest@example.com';
  const userInitials =
    hydratedUser?.fullName?.slice(0, 2)?.toUpperCase() || 'GU';

  // Company name from query
  const companyName =
    useQuery(api.companies.getCompanyName, {
      userId: hydratedUser?.id ?? ''
    }) ?? '';

  // Extract role and permissions from context
  const role = context?.role ?? null;
  const permissions = context?.permissions ?? [];
  const isOwner = context?.isOwner ?? false;
  const isLoading = context === undefined;

  // Permission check helper
  const can = React.useCallback(
    (permission: string): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  // Filter navigation items based on role
  const filteredNavItems = React.useMemo(() => {
    if (isLoading) return navItems;
    return filterNavByRole(navItems, role, can);
  }, [role, can, isLoading]);

  // Get role display information
  const roleInfo = React.useMemo(() => {
    return getRoleDisplayInfo(role);
  }, [role]);

  // Get quick actions for dropdown
  const quickActions = React.useMemo(() => {
    return getQuickActions(role, can);
  }, [role, can]);

  // Get role label
  const roleLabel = roleInfo.label;

  // Get role hierarchy level for comparison
  const roleLevel = ROLE_HIERARCHY[role?.toLowerCase() ?? 'viewer'] ?? 0;

  // Permission checks for special items
  const canAccessBilling = can('manage_settings');
  const canManageUsers = can('manage_users');
  const canManageOrganization = can('manage_organization');
  const canViewAuditLogs = can('view_audit_logs');

  // Role icon component
  const RoleIconComponent = getRoleIcon(roleInfo.icon);

  // Loading skeleton while hydrating
  if (!isHydrated) {
    return (
      <Sidebar collapsible='icon'>
        <SidebarHeader>
          <div className='flex gap-2 py-2 text-sidebar-accent-foreground'>
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
              <company.logo className='size-4' />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>NextTech</span>
              <span className='truncate text-xs'>{company.plan}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className='overflow-x-hidden' />
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar
      collapsible='icon'
      className={isCollapsed ? 'sidebar-collapsed' : ''}
    >
      <SidebarHeader>
        <div className='flex gap-2 py-2 text-sidebar-accent-foreground'>
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
            <company.logo className='size-4' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>
              {capitalizeWords(companyName)}
            </span>
            <span className='truncate text-xs'>{company.plan}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='overflow-x-hidden'>
        {/* Role-based section visibility */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {role === 'owner'
              ? 'Management'
              : role === 'manager'
                ? 'Operations'
                : 'Overview'}
          </SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              const isActive = pathname === item.url;

              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const SubIcon = subItem.icon
                            ? Icons[subItem.icon]
                            : Icons.logo;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  <SubIcon className='mr-2 h-4 w-4' />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Quick Actions Section - Role-based */}
        {quickActions.length > 0 && (
          <SidebarGroup className='mt-auto'>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarMenu>
              {quickActions.map((action) => {
                const ActionIcon =
                  (
                    Icons as Record<
                      string,
                      React.ComponentType<{ className?: string }>
                    >
                  )[action.icon] || Icons.arrowRight;
                return (
                  <SidebarMenuItem key={action.href}>
                    <SidebarMenuButton asChild tooltip={action.label}>
                      <Link href={action.href}>
                        <ActionIcon className='mr-2 h-4 w-4' />
                        <span>{action.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Feedback section */}
        <SidebarGroup className='mt-auto'>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip='Send us your feedback'>
                <Link
                  href='/feedback'
                  className='text-muted-foreground hover:text-foreground'
                >
                  <MessageSquare className='h-4 w-4' />
                  <span>Feedback</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={hydratedUser?.imageUrl} alt={userName} />
                    <AvatarFallback className='rounded-lg'>
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>{userName}</span>
                    <span className='truncate text-xs'>{userEmail}</span>
                  </div>
                  <ChevronsUpDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    <Avatar className='h-8 w-8 rounded-lg'>
                      <AvatarImage
                        src={hydratedUser?.imageUrl}
                        alt={userName}
                      />
                      <AvatarFallback className='rounded-lg'>
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>{userName}</span>
                      <span className='truncate text-xs'>{userEmail}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                {/* Role Badge */}
                <DropdownMenuSeparator />
                <DropdownMenuItem className='p-0'>
                  <div
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-2 ${roleInfo.bgColor}`}
                  >
                    <RoleIconComponent
                      className={`h-4 w-4 ${roleInfo.color}`}
                    />
                    <div className='flex flex-col'>
                      <span className={`text-sm font-medium ${roleInfo.color}`}>
                        {roleLabel}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {roleInfo.description}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck className='mr-2' />
                    Account Settings
                  </DropdownMenuItem>

                  {canManageOrganization && (
                    <DropdownMenuItem>
                      <GalleryVerticalEnd className='mr-2' />
                      Organization
                    </DropdownMenuItem>
                  )}

                  {canAccessBilling && (
                    <DropdownMenuItem>
                      <CreditCard className='mr-2' />
                      Billing & Plans
                    </DropdownMenuItem>
                  )}

                  {canViewAuditLogs && (
                    <DropdownMenuItem>
                      <Shield className='mr-2' />
                      Audit Logs
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem>
                    <Bell className='mr-2' />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Role-based quick links */}
                {role === 'owner' && canManageUsers && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href='/settings/users'
                        className='flex cursor-pointer gap-2'
                      >
                        <Shield className='h-4 w-4' />
                        Manage Team
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem asChild>
                  <Link href='/feedback' className='flex cursor-pointer gap-2'>
                    <MessageSquare className='h-4 w-4' />
                    Send Feedback
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className='p-0'>
                  {hydratedUser ? (
                    <SignOutButton redirectUrl='/sign-in'>
                      <div className='flex h-full w-full cursor-pointer gap-2 rounded-md px-2 py-1.5 hover:bg-muted'>
                        <LogOut />
                        Log out
                      </div>
                    </SignOutButton>
                  ) : (
                    <Link
                      href='/sign-in'
                      className='flex h-full w-full gap-2 px-2 py-1.5'
                    >
                      <LogOut />
                      Sign in
                    </Link>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
