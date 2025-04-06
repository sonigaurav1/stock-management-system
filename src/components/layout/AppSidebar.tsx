'use client';
import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
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
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  GalleryVerticalEnd,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton, useUser } from '@clerk/clerk-react';
import { Icons } from '../icons';
import { useCookieStore } from '@/hooks/useCookieStore';

export const company = {
  name: 'NextTech',
  logo: GalleryVerticalEnd,
  plan: 'Enterprise'
};

export default function AppSidebar() {
  const { user } = useUser();
  const pathname = usePathname();

  const { getCookie, setCookie } = useCookieStore();
  const isSidebarOpenCookie = getCookie('sidebar:state');

  const [isSidebarOpen, setIsSidebarOpen] = useState(
    Boolean(isSidebarOpenCookie)
  );

  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Update cookie when sidebar state changes
  useEffect(() => {
    setCookie('sidebar:state', isSidebarOpen ? 'open' : '');
  }, [isSidebarOpen, setCookie]);

  // Close sidebar on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, isSidebarOpen]);

  const handleSidebarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSidebarOpen(e.target.value === 'open');
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Get user initials safely
  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName.slice(0, 2).toUpperCase();
  };

  // Extract menu item rendering for cleaner JSX
  const renderMenuItem = (item: {
    title: string;
    url: string;
    icon?: keyof typeof Icons;
    items?: any[];
    isActive?: boolean;
  }) => {
    const Icon = item.icon && Icons[item.icon] ? Icons[item.icon] : Icons.logo;
    const isActive = pathname === item.url;

    if ((item?.items ?? []).length > 0) {
      return (
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
                onClick={handleMenuClick}
              >
                {item.icon && <Icon />}
                <span>{item.title}</span>
                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem: any) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={pathname === subItem.url}
                      onClick={handleMenuClick}
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
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          isActive={isActive}
          onClick={handleMenuClick}
        >
          <Link href={item.url}>
            <Icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible='icon'
      defaultValue={isSidebarOpen ? 'open' : 'closed'}
      onChange={handleSidebarChange}
    >
      <SidebarHeader>
        <div className='flex gap-2 py-2 text-sidebar-accent-foreground'>
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
            <company.logo className='size-4' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>{company.name}</span>
            <span className='truncate text-xs'>{company.plan}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>{navItems.map(renderMenuItem)}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size='lg'
                    className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                  >
                    <Avatar className='h-8 w-8 rounded-lg'>
                      <AvatarImage
                        src={user.imageUrl || ''}
                        alt={user.fullName || 'User'}
                      />
                      <AvatarFallback className='rounded-lg'>
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>
                        {user.fullName || 'User'}
                      </span>
                      <span className='truncate text-xs'>
                        {user.emailAddresses?.[0]?.emailAddress || ''}
                      </span>
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
                          src={user.imageUrl || ''}
                          alt={user.fullName || 'User'}
                        />
                        <AvatarFallback className='rounded-lg'>
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='grid flex-1 text-left text-sm leading-tight'>
                        <span className='truncate font-semibold'>
                          {user.fullName || 'User'}
                        </span>
                        <span className='truncate text-xs'>
                          {user.emailAddresses?.[0]?.emailAddress || ''}
                        </span>
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
                      <CreditCard className='mr-2' />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className='mr-2' />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className='p-0'>
                    <SignOutButton redirectUrl='/sign-in'>
                      <button className='flex h-full w-full gap-2 px-2 py-1.5'>
                        <LogOut />
                        Log out
                      </button>
                    </SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
