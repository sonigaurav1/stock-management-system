import { NavItem } from '@/types';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Product',
    url: '/dashboard/product',
    icon: 'product',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Category',
    url: '/dashboard/product/category',
    icon: 'category',
    shortcut: ['c', 'c'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Supplier',
    url: '/dashboard/product/supplier',
    icon: 'supplier',
    shortcut: ['s', 's'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Billing',
    url: '/billing',
    icon: 'productBilling',
    shortcut: ['b', 'b'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Ledger',
    url: '/ledger',
    icon: 'ledger',
    shortcut: ['l', 'l'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Restock',
    url: '/restock',
    icon: 'ledger',
    shortcut: ['r', 'r'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Settings',
    url: '/settings', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: false,

    items: [
      {
        title: 'Profile',
        url: '/settings/profile',
        icon: 'userPen'
      },
      {
        title: 'Account',
        url: '/settings/account',
        icon: 'creditCard'
      },
      {
        title: 'Appearance',
        url: '/settings/appearance',
        icon: 'monitor'
      },
      {
        title: 'Notifications',
        url: '/settings/notifications',
        icon: 'bell'
      },
      {
        title: 'Display',
        url: '/settings/display',
        icon: 'settings'
      }
    ]
  },
  {
    title: 'Help Center',
    url: '/help-center',
    icon: 'help',
    shortcut: ['h', 'h'],
    isActive: false,
    items: [] // No child items
  }
];
