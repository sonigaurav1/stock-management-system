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
import { navItems, NavItem } from '@/constants/data';
import {
  BadgeCheck,
  BadgeInfo,
  Bell,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  GalleryVerticalEnd,
  LogOut,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { Icons } from '../icons';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { capitalizeWords } from '@/lib/utils';
import { useUserRole, getRoleLabel } from '@/hooks/useUserRole';
import { PERMISSIONS } from '@/convex/permissions';

export const company = {
  name: 'NextTech',
  logo: GalleryVerticalEnd,
  plan: 'Enterprise'
};

// Permission mapping: which permission is required to view each nav item
const NAV_PERMISSIONS: Record<string, string> = {
  Dashboard: PERMISSIONS.VIEW_INVENTORY,
  Inventory: PERMISSIONS.VIEW_INVENTORY,
  Purchasing: PERMISSIONS.VIEW_INVENTORY,
  Finance: PERMISSIONS.VIEW_LEDGER,
  Reports: PERMISSIONS.VIEW_REPORTS,
  Communication: PERMISSIONS.VIEW_INVENTORY,
  Settings: PERMISSIONS.MANAGE_SETTINGS,
  Help: PERMISSIONS.VIEW_INVENTORY
};

/**
 * Filter navItems based on user permissions
 */
function filterNavItemsByPermission(
  items: NavItem[],
  can: (permission: string) => boolean
): NavItem[] {
  return items
    .map((item) => {
      // Check if user has permission for this section
      const requiredPermission = NAV_PERMISSIONS[item.title];
      if (requiredPermission && !can(requiredPermission)) {
        return null;
      }

      // Filter sub-items if present
      if (item.items && item.items.length > 0) {
        const filteredSubItems = item.items.filter((subItem) => {
          // For now, allow all sub-items if the parent is visible
          return true;
        });

        // If all sub-items are filtered out, don't show the parent
        if (filteredSubItems.length === 0) {
          return null;
        }

        return { ...item, items: filteredSubItems };
      }

      return item;
    })
    .filter((item): item is NavItem => item !== null);
}

export default function AppSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const { role, can, isLoading: isRoleLoading } = useUserRole();
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const hydratedUser = isHydrated ? user : null;
  const userName = hydratedUser?.fullName || 'Guest User';
  const userEmail =
    hydratedUser?.emailAddresses[0]?.emailAddress || 'guest@example.com';
  const userInitials =
    hydratedUser?.fullName?.slice(0, 2)?.toUpperCase() || 'GU';

  const companyName =
    useQuery(api.companies.getCompanyName, {
      userId: hydratedUser?.id ?? ''
    }) ?? '';

  // Filter nav items based on permissions (only after role is loaded)
  const filteredNavItems =
    !isRoleLoading && can
      ? filterNavItemsByPermission(navItems, can)
      : navItems;

  // Determine user role label
  const roleLabel = role ? getRoleLabel(role) : 'Guest';

  // Check if user can access billing/settings (managers and owners only)
  const canAccessBilling = can(PERMISSIONS.MANAGE_SETTINGS);
  const canManageUsers = can(PERMISSIONS.MANAGE_USERS);

  console.log('AppSidebar - user:', {
    user,
    hydratedUser,
    userName,
    userEmail,
    role
  });
  console.log('AppSidebar - companyName:', { companyName });
  console.log('AppSidebar - canAccessBilling:', canAccessBilling);

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
    <Sidebar collapsible='icon'>
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
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
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
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
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
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck className='mr-2' />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BadgeInfo className='mr-2' />
                    Role: {roleLabel}
                  </DropdownMenuItem>
                  {canAccessBilling && (
                    <DropdownMenuItem>
                      <CreditCard className='mr-2' />
                      Billing
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Bell className='mr-2' />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
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
                      <div className='flex h-full w-full gap-2 px-2 py-1.5'>
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
