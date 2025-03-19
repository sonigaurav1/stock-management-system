import { NavItem } from 'types';

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
    url: '/dashboard/product/billing',
    icon: 'productBilling',
    shortcut: ['b', 'b'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'About',
    url: '/dashboard/about',
    icon: 'about',
    shortcut: ['i', 'i'],
    isActive: false,
    items: [] // No child items
  }
  // {
  //   title: 'Account',
  //   url: '#', // Placeholder as there is no direct link for the parent
  //   icon: 'billing',
  //   isActive: true,

  //   items: [
  //     {
  //       title: 'Profile',
  //       url: '/dashboard/profile',
  //       icon: 'userPen',
  //       shortcut: ['m', 'm']
  //     },
  //     {
  //       title: 'Login',
  //       shortcut: ['l', 'l'],
  //       url: '/',
  //       icon: 'login'
  //     }
  //   ]
  // },
  // {
  //   title: 'Kanban',
  //   url: '/dashboard/kanban',
  //   icon: 'kanban',
  //   shortcut: ['k', 'k'],
  //   isActive: false,
  //   items: [] // No child items
  // }
];
