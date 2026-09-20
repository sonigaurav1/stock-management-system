'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart4,
  Box,
  CreditCard,
  FileText,
  HelpCircle,
  Package,
  Settings,
  Truck,
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Bot,
  Receipt,
  Clock,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');

  const quickLinks = [
    {
      title: 'Add New Product',
      href: '/inventory/products',
      icon: Package,
      badge: 'Inventory'
    },
    {
      title: 'Create GST Invoice',
      href: '/billing',
      icon: Receipt,
      badge: 'Billing'
    },
    {
      title: 'Manage Team & Roles',
      href: '/settings/account',
      icon: Users,
      badge: 'RBAC'
    },
    {
      title: 'Submit Feedback',
      href: '/feedback',
      icon: MessageSquare,
      badge: 'Feedback'
    },
    {
      title: 'Developer Portal',
      href: '/admin',
      icon: ShieldCheck,
      badge: 'Admin'
    }
  ];

  return (
    <div className='container mx-auto max-w-7xl space-y-8 px-4 pb-12 text-foreground md:px-6'>
      {/* Hero Header Section */}
      <div className='relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-card via-background to-card p-8 shadow-card'>
        <div className='pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl' />

        <div className='flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='max-w-2xl space-y-2'>
            <div className='flex items-center gap-2'>
              <div className='rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary'>
                <HelpCircle className='h-6 w-6' />
              </div>
              <Badge
                variant='outline'
                className='border-primary/20 bg-primary/5 font-mono text-xs text-primary'
              >
                INVENTO HELP & SUPPORT
              </Badge>
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
              Knowledge Base & User Guide
            </h1>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              Explore tutorials, step-by-step guides, and features for billing,
              multi-supplier inventory, team RBAC, AI intelligence, and
              developer administration.
            </p>
          </div>

          {/* Search Box */}
          <div className='relative w-full pt-2 md:w-80 md:pt-0'>
            <Search className='absolute left-3 top-3.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search topics (e.g., GST, Roles, AI, CSV)...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='border-border bg-background pl-9 text-sm shadow-sm'
            />
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className='space-y-3'>
        <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          Quick Actions & Short-cuts
        </h3>
        <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-5'>
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.title} href={link.href}>
                <Card className='group cursor-pointer border border-border/80 bg-card shadow-sm transition-all hover:bg-muted/50 hover:shadow-md'>
                  <CardContent className='flex items-center justify-between p-4'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <div className='rounded-md bg-primary/10 p-2 text-primary transition-transform group-hover:scale-105'>
                        <Icon className='h-4 w-4' />
                      </div>
                      <div className='min-w-0'>
                        <p className='truncate text-xs font-semibold text-foreground'>
                          {link.title}
                        </p>
                        <Badge
                          variant='outline'
                          className='px-1 py-0 font-mono text-[10px] text-muted-foreground'
                        >
                          {link.badge}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className='h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Feature Tabs */}
      <Tabs defaultValue='dashboard' className='w-full space-y-6'>
        <TabsList className='flex h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto rounded-lg bg-muted p-1'>
          <TabsTrigger
            value='dashboard'
            className='flex items-center gap-1.5 text-xs md:text-sm'
          >
            <BarChart4 className='h-4 w-4 text-blue-500' />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value='products'
            className='flex items-center gap-1.5 text-xs md:text-sm'
          >
            <Package className='h-4 w-4 text-indigo-500' />
            Products & Stock
          </TabsTrigger>
          <TabsTrigger
            value='suppliers'
            className='flex items-center gap-1.5 text-xs md:text-sm'
          >
            <Truck className='h-4 w-4 text-purple-500' />
            Multi-Supplier
          </TabsTrigger>
          <TabsTrigger
            value='billing'
            className='flex items-center gap-1.5 text-xs md:text-sm'
          >
            <Receipt className='h-4 w-4 text-emerald-500' />
            GST Billing & Sales
          </TabsTrigger>
          <TabsTrigger
            value='rbac'
            className='flex items-center gap-1.5 text-xs md:text-sm'
          >
            <Users className='h-4 w-4 text-amber-500' />
            Team & RBAC Roles
          </TabsTrigger>
          <TabsTrigger
            value='ai'
            className='flex items-center gap-1.5 text-xs md:text-sm'
          >
            <Bot className='h-4 w-4 text-pink-500' />
            AI & Analytics
          </TabsTrigger>
          <TabsTrigger
            value='finance'
            className='flex items-center gap-1.5 text-xs md:text-sm'
          >
            <TrendingUp className='h-4 w-4 text-cyan-500' />
            Finance & Ledger
          </TabsTrigger>
          <TabsTrigger
            value='admin'
            className='flex items-center gap-1.5 text-xs md:text-sm'
          >
            <ShieldCheck className='h-4 w-4 text-red-500' />
            Developer Admin
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Dashboard */}
        <TabsContent
          value='dashboard'
          className='space-y-6 focus-visible:outline-none'
        >
          <Card className='border-border bg-card text-card-foreground shadow-card'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg font-bold'>
                <BarChart4 className='h-5 w-5 text-blue-500' />
                Dashboard Overview & Real-Time Metrics
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                Monitor live inventory levels, sales revenue trends, low stock
                alerts, and top-selling products.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6 text-sm'>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-3 rounded-lg border border-border/80 bg-background/50 p-4'>
                  <h3 className='flex items-center gap-2 font-semibold text-foreground'>
                    <Zap className='h-4 w-4 text-primary' /> Core Dashboard
                    Features
                  </h3>
                  <ul className='list-disc space-y-2 pl-4 text-xs text-muted-foreground'>
                    <li>
                      <strong>Real-Time Sales Counter:</strong> Tracks revenue
                      and transaction volume.
                    </li>
                    <li>
                      <strong>Low Stock Alerts:</strong> Automatically flags
                      items below configured reorder levels.
                    </li>
                    <li>
                      <strong>Top Selling Products:</strong> Dynamic
                      visualization of best-performing SKUs.
                    </li>
                    <li>
                      <strong>Financial Forecast Widgets:</strong> Shows cash
                      flow and projected expense trends.
                    </li>
                  </ul>
                </div>

                <div className='space-y-3 rounded-lg border border-border/80 bg-background/50 p-4'>
                  <h3 className='flex items-center gap-2 font-semibold text-foreground'>
                    <CheckCircle2 className='h-4 w-4 text-emerald-500' />{' '}
                    Business Value
                  </h3>
                  <ul className='list-disc space-y-2 pl-4 text-xs text-muted-foreground'>
                    <li>
                      Prevent inventory stock-outs with automated alert
                      triggers.
                    </li>
                    <li>
                      Identify peak sales hours and customer purchasing
                      behavior.
                    </li>
                    <li>
                      Quickly switch between Financial Overview and Operational
                      views.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Products & Stock */}
        <TabsContent
          value='products'
          className='space-y-6 focus-visible:outline-none'
        >
          <Card className='border-border bg-card text-card-foreground shadow-card'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg font-bold'>
                <Package className='h-5 w-5 text-indigo-500' />
                Product Inventory Management
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                Learn how to add, edit, track SKUs, barcodes, HSN/SAC codes, and
                stock levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type='single' collapsible className='w-full space-y-2'>
                <AccordionItem
                  value='add-product'
                  className='rounded-lg border border-border/60 bg-background/40 px-4'
                >
                  <AccordionTrigger className='text-sm font-semibold hover:no-underline'>
                    How to Add a Product to Inventory
                  </AccordionTrigger>
                  <AccordionContent className='space-y-3 pt-2 text-xs text-muted-foreground'>
                    <ol className='list-decimal space-y-1.5 pl-4'>
                      <li>
                        Go to <strong>Inventory &gt; Products</strong> in the
                        sidebar.
                      </li>
                      <li>
                        Click the <strong>Add Product</strong> button.
                      </li>
                      <li>
                        Enter product details (Name, SKU, Category, Selling
                        Price, Stock Level, HSN/SAC code).
                      </li>
                      <li>
                        Click <strong>Save Product</strong> to record to Convex
                        database.
                      </li>
                    </ol>

                    <div className='rounded-md border border-primary/20 bg-primary/5 p-3 text-foreground'>
                      <p className='mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary'>
                        <AlertCircle className='h-3.5 w-3.5' /> Mandatory
                        Product Fields
                      </p>
                      <ul className='list-disc space-y-0.5 pl-4 text-xs text-muted-foreground'>
                        <li>
                          <code className='font-mono text-primary'>Name</code>:
                          Display name of item
                        </li>
                        <li>
                          <code className='font-mono text-primary'>SKU</code>:
                          Unique Stock Keeping Unit
                        </li>
                        <li>
                          <code className='font-mono text-primary'>
                            Category
                          </code>
                          : Product classification
                        </li>
                        <li>
                          <code className='font-mono text-primary'>
                            Selling Price
                          </code>
                          : Retail unit price
                        </li>
                        <li>
                          <code className='font-mono text-primary'>
                            Stock Level
                          </code>
                          : Quantity on hand
                        </li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value='hsn-sac'
                  className='rounded-lg border border-border/60 bg-background/40 px-4'
                >
                  <AccordionTrigger className='text-sm font-semibold hover:no-underline'>
                    HSN/SAC Codes & Barcode Support
                  </AccordionTrigger>
                  <AccordionContent className='space-y-2 pt-2 text-xs text-muted-foreground'>
                    <p>
                      Invento supports{' '}
                      <strong>HSN (Harmonized System of Nomenclature)</strong>{' '}
                      and <strong>SAC (Services Accounting Code)</strong> for
                      GST compliance in billing. Barcodes can be assigned to
                      products for instant scanning during checkout.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Multi-Supplier */}
        <TabsContent
          value='suppliers'
          className='space-y-6 focus-visible:outline-none'
        >
          <Card className='border-border bg-card text-card-foreground shadow-card'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg font-bold'>
                <Truck className='h-5 w-5 text-purple-500' />
                Multi-Supplier & Performance Metrics
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                Link multiple suppliers per product, set preferred vendors,
                track lead times, and automate purchase orders.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-muted-foreground'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2 rounded-lg border border-border/80 bg-background/50 p-4'>
                  <h4 className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <CheckCircle2 className='h-4 w-4 text-purple-500' />{' '}
                    Multi-Supplier Mapping
                  </h4>
                  <p>
                    Assign multiple vendors to a single product with custom cost
                    prices, minimum order quantities (MOQ), and preferred
                    supplier tags.
                  </p>
                </div>

                <div className='space-y-2 rounded-lg border border-border/80 bg-background/50 p-4'>
                  <h4 className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Clock className='h-4 w-4 text-purple-500' /> Vendor Lead
                    Times
                  </h4>
                  <p>
                    Track average lead times (days) and delivery performance
                    ratings to choose the best vendor during restocks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: GST Billing */}
        <TabsContent
          value='billing'
          className='space-y-6 focus-visible:outline-none'
        >
          <Card className='border-border bg-card text-card-foreground shadow-card'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg font-bold'>
                <Receipt className='h-5 w-5 text-emerald-500' />
                GST Invoicing & Point of Sale
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                Process sales transactions, print tax invoices with HSN/SAC
                codes, and automatically deduct stock.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-muted-foreground'>
              <ol className='list-decimal space-y-2 pl-4'>
                <li>
                  Navigate to <strong>Billing</strong> in the sidebar.
                </li>
                <li>Search or select items by SKU/Barcode or name.</li>
                <li>
                  Enter customer phone number or PAN number for business
                  invoices.
                </li>
                <li>Specify item quantities and optional discounts.</li>
                <li>
                  Click <strong>Complete Sale & Print Invoice</strong> to deduct
                  stock and produce a PDF receipt.
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Team & RBAC Roles */}
        <TabsContent
          value='rbac'
          className='space-y-6 focus-visible:outline-none'
        >
          <Card className='border-border bg-card text-card-foreground shadow-card'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg font-bold'>
                <Users className='h-5 w-5 text-amber-500' />
                Team Management & Role-Based Access Control (RBAC)
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                Invite team members via email, assign granular permissions, and
                restrict sensitive business settings.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-muted-foreground'>
              <div className='grid gap-4 md:grid-cols-4'>
                <div className='space-y-1 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3'>
                  <span className='text-sm font-bold text-purple-600 dark:text-purple-400'>
                    Owner
                  </span>
                  <p>
                    Full control over company, billing, RBAC roles, audit logs,
                    and account settings.
                  </p>
                </div>
                <div className='space-y-1 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3'>
                  <span className='text-sm font-bold text-blue-600 dark:text-blue-400'>
                    Admin
                  </span>
                  <p>
                    Can manage users, inventory, suppliers, billing, and report
                    exports.
                  </p>
                </div>
                <div className='space-y-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3'>
                  <span className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>
                    Manager
                  </span>
                  <p>
                    Can add products, process sales, restock inventory, and view
                    sales reports.
                  </p>
                </div>
                <div className='space-y-1 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3'>
                  <span className='text-sm font-bold text-indigo-600 dark:text-indigo-400'>
                    Staff / Viewer
                  </span>
                  <p>
                    Can view inventory and process sales transactions without
                    access to admin settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: AI Assistant */}
        <TabsContent
          value='ai'
          className='space-y-6 focus-visible:outline-none'
        >
          <Card className='border-border bg-card text-card-foreground shadow-card'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg font-bold'>
                <Bot className='h-5 w-5 text-pink-500' />
                AI Assistant & Customer Intelligence
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                Use natural language commands to query inventory, forecast stock
                demand, and analyze sales.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3 text-xs text-muted-foreground'>
              <p>
                The integrated AI assistant allows you to query your business
                database in plain English or Nepalese:
              </p>
              <ul className='list-disc space-y-1 pl-4 text-xs'>
                <li>
                  <em>
                    &quot;Which products are below reorder level this
                    week?&quot;
                  </em>
                </li>
                <li>
                  <em>
                    &quot;What is our total revenue for the current month?&quot;
                  </em>
                </li>
                <li>
                  <em>
                    &quot;Show customer purchasing patterns for returning
                    buyers.&quot;
                  </em>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Finance & Ledger */}
        <TabsContent
          value='finance'
          className='space-y-6 focus-visible:outline-none'
        >
          <Card className='border-border bg-card text-card-foreground shadow-card'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg font-bold'>
                <TrendingUp className='h-5 w-5 text-cyan-500' />
                Financial Forecasting & Ledger Accounts
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                Track Debit (Dr) and Credit (Cr) transactions, manage recurring
                expenses, and forecast cash flow.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3 text-xs text-muted-foreground'>
              <p>
                The financial ledger maintains running balances for suppliers
                and customers, allowing you to generate PDF statements, export
                transactions, and track expense approvals.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 8: Developer Admin */}
        <TabsContent
          value='admin'
          className='space-y-6 focus-visible:outline-none'
        >
          <Card className='border-border bg-card text-card-foreground shadow-card'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg font-bold'>
                <ShieldCheck className='h-5 w-5 text-red-500' />
                Developer Admin Console (/admin)
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                Learn about the system developer portal located at{' '}
                <code className='font-mono text-primary'>/admin</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-muted-foreground'>
              <p>
                Developers and platform administrators can access{' '}
                <Link
                  href='/admin'
                  className='font-semibold text-primary underline'
                >
                  /admin
                </Link>{' '}
                to:
              </p>
              <ul className='list-disc space-y-1 pl-4 text-xs'>
                <li>
                  <strong>Users Created:</strong> Inspect all registered
                  profiles, roles, and Clerk subject IDs.
                </li>
                <li>
                  <strong>User Feedback:</strong> Review user ratings,
                  screenshots, and send developer responses.
                </li>
                <li>
                  <strong>Registered Companies:</strong> View company accounts
                  and subscription tiers.
                </li>
                <li>
                  <strong>System Health:</strong> Monitor database statistics,
                  document counts, and response latency.
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FAQ Section */}
      <div className='space-y-4 border-t border-border/80 pt-8'>
        <h2 className='flex items-center gap-2 text-xl font-bold tracking-tight text-foreground'>
          <HelpCircle className='h-5 w-5 text-primary' /> Frequently Asked
          Questions
        </h2>

        <Accordion type='single' collapsible className='w-full space-y-2'>
          <AccordionItem
            value='faq-1'
            className='rounded-lg border border-border/60 bg-card px-4'
          >
            <AccordionTrigger className='text-sm font-semibold hover:no-underline'>
              How do I get started with Invento?
            </AccordionTrigger>
            <AccordionContent className='text-xs leading-relaxed text-muted-foreground'>
              Start by setting up your business profile in{' '}
              <strong>Settings &gt; Company Details</strong>, add product
              categories, and then create products and suppliers.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value='faq-2'
            className='rounded-lg border border-border/60 bg-card px-4'
          >
            <AccordionTrigger className='text-sm font-semibold hover:no-underline'>
              How do I invite team members and assign roles?
            </AccordionTrigger>
            <AccordionContent className='text-xs leading-relaxed text-muted-foreground'>
              Go to <strong>Settings &gt; Account & Team</strong>, enter your
              staff member&apos;s email address, and select a role (Admin,
              Manager, Staff, Viewer). An invitation link will be generated.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value='faq-3'
            className='rounded-lg border border-border/60 bg-card px-4'
          >
            <AccordionTrigger className='text-sm font-semibold hover:no-underline'>
              Where can I submit feedback or report bugs?
            </AccordionTrigger>
            <AccordionContent className='text-xs leading-relaxed text-muted-foreground'>
              Visit the{' '}
              <Link
                href='/feedback'
                className='font-semibold text-primary underline'
              >
                /feedback
              </Link>{' '}
              page to submit feature requests or bugs. Developers reply
              directly, and you can track responses under{' '}
              <strong>My Submissions & Replies</strong>.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Footer Support Banner */}
      <div className='space-y-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-primary/10 p-6 text-center'>
        <h3 className='text-base font-bold text-foreground'>
          Need additional help or technical support?
        </h3>
        <p className='mx-auto max-w-xl text-xs text-muted-foreground'>
          Our developer team is available to assist. Submit a feedback ticket or
          reach out to our administration portal.
        </p>
        <div className='flex flex-wrap justify-center gap-3 pt-1'>
          <Link href='/feedback'>
            <Button
              size='sm'
              className='gap-2 bg-primary text-primary-foreground hover:bg-primary/90'
            >
              <MessageSquare className='h-4 w-4' /> Submit Feedback Ticket
            </Button>
          </Link>
          <Link href='/admin'>
            <Button size='sm' variant='outline' className='gap-2 border-border'>
              <ShieldAlert className='h-4 w-4 text-primary' /> Developer Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
