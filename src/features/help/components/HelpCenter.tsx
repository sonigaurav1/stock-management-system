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
import {
  AlertCircle,
  BarChart4,
  Box,
  CreditCard,
  FileText,
  HelpCircle,
  Package,
  Settings,
  Truck,
  Users
} from 'lucide-react';

export default function HelpCenter() {
  return (
    <div className='pb-10 md:container md:mx-auto md:px-6'>
      <div className='mb-10 flex flex-col space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>
            Help Center
          </h1>
          <p className='mx-auto max-w-3xl text-muted-foreground'>
            Welcome to the comprehensive guide for your Stock Management System.
            Learn how to use all features to streamline your business
            operations.
          </p>
        </div>
      </div>

      <Tabs defaultValue='dashboard' className='w-full'>
        <TabsList className='mb-8 grid h-full grid-cols-2 md:grid-cols-5 lg:grid-cols-10'>
          <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
          <TabsTrigger value='products'>Products</TabsTrigger>
          <TabsTrigger value='categories'>Categories</TabsTrigger>
          <TabsTrigger value='suppliers'>Suppliers</TabsTrigger>
          <TabsTrigger value='billing'>Billing</TabsTrigger>
          <TabsTrigger value='customers'>Customers</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='restock'>Restock</TabsTrigger>
          <TabsTrigger value='ledger'>Ledger</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value='dashboard' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart4 className='h-5 w-5' />
                Dashboard Overview
              </CardTitle>
              <CardDescription>
                Your dashboard provides a comprehensive overview of your
                business at a glance
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Key Features</h3>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>Real-time sales and revenue metrics</li>
                    <li>Inventory status with low stock alerts</li>
                    <li>Top-selling products visualization</li>
                    <li>Customer growth and retention statistics</li>
                    <li>Recent transactions and activities</li>
                  </ul>
                </div>
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Business Growth Insights
                  </h3>
                  <p>The dashboard helps you make data-driven decisions by:</p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>Identifying sales trends over time</li>
                    <li>Highlighting inventory that needs attention</li>
                    <li>Showing customer purchasing patterns</li>
                    <li>Providing quick access to critical business metrics</li>
                  </ul>
                </div>
              </div>

              <div className='rounded-lg border p-4'>
                <h3 className='mb-2 font-medium'>Pro Tip</h3>
                <p className='text-sm text-muted-foreground'>
                  Customize your dashboard view by clicking the settings icon in
                  the top-right corner to focus on metrics that matter most to
                  your business.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='products' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Product Management
              </CardTitle>
              <CardDescription>
                Learn how to add, edit, and manage your product inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type='single' collapsible className='w-full'>
                <AccordionItem value='adding-products'>
                  <AccordionTrigger>How to Add Products</AccordionTrigger>
                  <AccordionContent className='space-y-4'>
                    <p>To add a new product to your inventory:</p>
                    <ol className='list-decimal space-y-2 pl-5'>
                      <li>Navigate to the Products section from the sidebar</li>
                      <li>
                        Click the &quot;Add Product&quot; button in the
                        top-right corner
                      </li>
                      <li>Fill in the product details in the form</li>
                      <li>
                        Click &quot;Save&quot; to add the product to your
                        inventory
                      </li>
                    </ol>

                    <div className='mt-4 rounded-md border border-amber-200 bg-amber-50 p-4'>
                      <h4 className='mb-2 flex items-center gap-2 font-medium text-amber-800'>
                        <AlertCircle className='h-4 w-4' />
                        Required Fields
                      </h4>
                      <p className='mb-2 text-sm text-amber-700'>
                        The following fields are mandatory when adding a
                        product:
                      </p>
                      <ul className='list-disc space-y-1 pl-5 text-sm text-amber-700'>
                        <li>
                          <strong>Name:</strong> The product name
                        </li>
                        <li>
                          <strong>SKU:</strong> Stock Keeping Unit (unique
                          identifier)
                        </li>
                        <li>
                          <strong>Category:</strong> Product category (must be
                          selected from existing categories)
                        </li>
                        <li>
                          <strong>Selling Price:</strong> The retail price of
                          the product
                        </li>
                        <li>
                          <strong>Stock Level:</strong> Initial quantity in
                          stock
                        </li>
                      </ul>
                    </div>

                    <p className='text-sm text-muted-foreground'>
                      Other fields like barcode, description, brand, and
                      supplier are optional but recommended for better inventory
                      management.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='editing-products'>
                  <AccordionTrigger>
                    Editing Product Information
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className='mb-4'>To edit an existing product:</p>
                    <ol className='list-decimal space-y-2 pl-5'>
                      <li>Find the product in your product list</li>
                      <li>
                        Click the three dots (⋮) menu on the right side of the
                        product row
                      </li>
                      <li>Select &quot;Edit&quot; from the dropdown menu</li>
                      <li>Update the necessary information</li>
                      <li>
                        Click &quot;Save Changes&quot; to update the product
                      </li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='product-fields'>
                  <AccordionTrigger>
                    Understanding Product Fields
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='space-y-4'>
                      <p>
                        Your product information is organized into several
                        sections:
                      </p>

                      <div>
                        <h4 className='mb-2 font-medium'>Basic Information</h4>
                        <ul className='list-disc space-y-1 pl-5 text-sm'>
                          <li>
                            <strong>Name:</strong> Product name (required)
                          </li>
                          <li>
                            <strong>SKU:</strong> Stock Keeping Unit - unique
                            identifier (required)
                          </li>
                          <li>
                            <strong>Slug:</strong> URL-friendly name
                            (auto-generated)
                          </li>
                          <li>
                            <strong>Serial Number:</strong> Manufacturer&apos;s
                            serial number (optional)
                          </li>
                          <li>
                            <strong>Barcode:</strong> For scanning and quick
                            identification (optional)
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className='mb-2 font-medium'>Categorization</h4>
                        <ul className='list-disc space-y-1 pl-5 text-sm'>
                          <li>
                            <strong>Category:</strong> Main product category
                            (required)
                          </li>
                          <li>
                            <strong>Subcategory:</strong> More specific
                            classification (optional)
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className='mb-2 font-medium'>Pricing</h4>
                        <ul className='list-disc space-y-1 pl-5 text-sm'>
                          <li>
                            <strong>Purchase Price:</strong> Cost price from
                            supplier (optional but recommended)
                          </li>
                          <li>
                            <strong>Selling Price:</strong> Retail price
                            (required)
                          </li>
                          <li>
                            <strong>Discount Price:</strong> Special offer price
                            (optional)
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className='mb-2 font-medium'>Inventory</h4>
                        <ul className='list-disc space-y-1 pl-5 text-sm'>
                          <li>
                            <strong>Stock Level:</strong> Current quantity in
                            stock (required)
                          </li>
                          <li>
                            <strong>Reorder Level:</strong> Minimum stock before
                            reorder alert (optional)
                          </li>
                          <li>
                            <strong>Stock Status:</strong> Automatically
                            calculated based on stock level
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className='mb-2 font-medium'>
                          Supplier Information
                        </h4>
                        <ul className='list-disc space-y-1 pl-5 text-sm'>
                          <li>
                            <strong>Supplier:</strong> Who provides this product
                            (optional)
                          </li>
                          <li>
                            <strong>Last Restocked:</strong> Date of most recent
                            restock (auto-updated)
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='categories' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Box className='h-5 w-5' />
                Category Management
              </CardTitle>
              <CardDescription>
                Learn how to organize your products with categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Why Categories Matter</h3>
                  <p>Categories help you:</p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>Organize your inventory logically</li>
                    <li>Filter products quickly when searching</li>
                    <li>Generate category-specific reports</li>
                    <li>Analyze sales performance by product type</li>
                  </ul>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Adding a New Category</h3>
                  <ol className='list-decimal space-y-2 pl-5'>
                    <li>Navigate to the Categories section from the sidebar</li>
                    <li>Click the &quot;Add Category&quot; button</li>
                    <li>Enter a category name (required)</li>
                    <li>
                      Add an optional description to clarify the category&apos;s
                      purpose
                    </li>
                    <li>Upload an optional image to represent the category</li>
                    <li>Click &quot;Save&quot; to create the category</li>
                  </ol>
                </div>

                <div className='rounded-md border border-blue-200 bg-blue-50 p-4'>
                  <h4 className='mb-2 flex items-center gap-2 font-medium text-blue-800'>
                    <HelpCircle className='h-4 w-4' />
                    Important Note
                  </h4>
                  <p className='text-sm text-blue-700'>
                    Categories must be created <strong>before</strong> adding
                    products that belong to them. You cannot assign a product to
                    a category that doesn&apos;t exist yet.
                  </p>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Managing Existing Categories
                  </h3>
                  <p>You can edit or delete categories as needed:</p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>To edit: Click the edit icon next to any category</li>
                    <li>
                      To delete: Click the delete icon (only possible if no
                      products are assigned to the category)
                    </li>
                  </ul>
                  <p className='text-sm text-muted-foreground'>
                    If you need to delete a category that has products assigned
                    to it, you must first reassign those products to a different
                    category.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='suppliers' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Truck className='h-5 w-5' />
                Supplier Management
              </CardTitle>
              <CardDescription>
                Learn how to manage your product suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Adding a New Supplier</h3>
                  <ol className='list-decimal space-y-2 pl-5'>
                    <li>Navigate to the Suppliers section from the sidebar</li>
                    <li>Click the &quot;Add Supplier&quot; button</li>
                    <li>Enter the supplier name (required)</li>
                    <li>Add contact information (phone, email, address)</li>
                    <li>Upload an optional supplier logo or image</li>
                    <li>
                      Click &quot;Save&quot; to add the supplier to your system
                    </li>
                  </ol>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Linking Suppliers to Products
                  </h3>
                  <p>After adding suppliers, you can link them to products:</p>
                  <ol className='list-decimal space-y-2 pl-5'>
                    <li>
                      When adding or editing a product, select the supplier from
                      the dropdown menu
                    </li>
                    <li>
                      This creates a relationship between the product and its
                      supplier
                    </li>
                    <li>
                      You can then filter products by supplier or see which
                      supplier provides which products
                    </li>
                  </ol>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Benefits of Supplier Management
                  </h3>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>
                      Quickly identify who to contact when restocking is needed
                    </li>
                    <li>Track supplier reliability and product quality</li>
                    <li>
                      Maintain organized contact information for all your
                      vendors
                    </li>
                    <li>
                      Generate supplier-specific reports for business analysis
                    </li>
                  </ul>
                </div>

                <div className='rounded-lg border p-4'>
                  <h3 className='mb-2 font-medium'>Pro Tip</h3>
                  <p className='text-sm text-muted-foreground'>
                    Keep your supplier information up-to-date to ensure smooth
                    communication when you need to restock products or resolve
                    issues with deliveries.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='billing' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' />
                Billing System
              </CardTitle>
              <CardDescription>
                Learn how the billing system works and manages sales, customers,
                and inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type='single' collapsible className='w-full'>
                <AccordionItem value='billing-overview'>
                  <AccordionTrigger>Billing System Overview</AccordionTrigger>
                  <AccordionContent className='space-y-4'>
                    <p>
                      The billing system is the core of your business
                      operations, handling:
                    </p>
                    <ul className='list-disc space-y-2 pl-5'>
                      <li>Sales transactions and invoice generation</li>
                      <li>Customer information management</li>
                      <li>Automatic inventory updates</li>
                      <li>Sales data collection for analytics</li>
                      <li>Tax calculations and reporting</li>
                    </ul>

                    <p>
                      Each sale automatically updates multiple parts of the
                      system:
                    </p>
                    <ul className='list-disc space-y-2 pl-5'>
                      <li>Reduces product stock levels</li>
                      <li>Records customer information</li>
                      <li>Generates a tax invoice</li>
                      <li>Updates sales analytics</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='creating-invoice'>
                  <AccordionTrigger>Creating a New Invoice</AccordionTrigger>
                  <AccordionContent className='space-y-4'>
                    <ol className='list-decimal space-y-2 pl-5'>
                      <li>Navigate to the Billing section</li>
                      <li>
                        Click &quot;New Invoice&quot; or &quot;New Sale&quot;
                      </li>
                      <li>
                        Enter or select customer information (name, phone, or
                        PAN number)
                      </li>
                      <li>
                        Add products to the invoice by searching and selecting
                        from your inventory
                      </li>
                      <li>Specify quantities for each product</li>
                      <li>Apply any discounts if applicable</li>
                      <li>Select payment method</li>
                      <li>
                        Finalize the sale by clicking &quot;Complete Sale&quot;
                      </li>
                    </ol>

                    <div className='rounded-md border border-blue-200 bg-blue-50 p-4'>
                      <h4 className='mb-2 font-medium text-blue-800'>
                        Customer Identification
                      </h4>
                      <p className='text-sm text-blue-700'>
                        Customers can be identified by either:
                      </p>
                      <ul className='list-disc space-y-1 pl-5 text-sm text-blue-700'>
                        <li>
                          <strong>Phone Number:</strong> Quick identification
                          for returning customers
                        </li>
                        <li>
                          <strong>PAN Number:</strong> For business customers
                          requiring tax documentation
                        </li>
                      </ul>
                      <p className='mt-2 text-sm text-blue-700'>
                        The system will automatically check if the customer
                        exists and create a new customer record if needed.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='stock-management'>
                  <AccordionTrigger>
                    Automatic Stock Management
                  </AccordionTrigger>
                  <AccordionContent className='space-y-4'>
                    <p>When a sale is completed:</p>
                    <ol className='list-decimal space-y-2 pl-5'>
                      <li>
                        The system automatically reduces the stock level of each
                        sold product
                      </li>
                      <li>
                        Stock movements are recorded with the type
                        &quot;sale&quot;
                      </li>
                      <li>
                        If a product reaches its reorder level, the system will
                        generate an alert
                      </li>
                      <li>
                        Products with zero stock will be marked as &quot;out of
                        stock&quot;
                      </li>
                    </ol>

                    <p className='text-sm text-muted-foreground'>
                      This automation ensures your inventory is always accurate
                      without manual adjustments.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='sales-analytics'>
                  <AccordionTrigger>
                    Sales Data for Business Analytics
                  </AccordionTrigger>
                  <AccordionContent className='space-y-4'>
                    <p>Every sale contributes to your business analytics:</p>
                    <ul className='list-disc space-y-2 pl-5'>
                      <li>
                        <strong>Total Revenue:</strong> Calculated from all
                        completed sales
                      </li>
                      <li>
                        <strong>Sales Count:</strong> Number of transactions
                        processed
                      </li>
                      <li>
                        <strong>Unique Customers:</strong> Count of individual
                        customers served
                      </li>
                      <li>
                        <strong>Product Performance:</strong> Which items sell
                        best
                      </li>
                      <li>
                        <strong>Category Performance:</strong> Which product
                        categories are most popular
                      </li>
                    </ul>

                    <p>
                      This data is visualized in the Analytics section to help
                      you make informed business decisions.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='customers' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                Customer Management
              </CardTitle>
              <CardDescription>
                Learn how to manage customer information and track purchase
                history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Customer Records</h3>
                  <p>
                    The system creates and maintains customer records based on
                    sales transactions:
                  </p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>
                      Customers are identified by phone number or PAN number
                    </li>
                    <li>
                      New customers are automatically added during their first
                      purchase
                    </li>
                    <li>
                      Returning customers&apos; information is retrieved and can
                      be updated
                    </li>
                    <li>Purchase history is tracked for each customer</li>
                  </ul>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Adding or Editing Customer Information
                  </h3>
                  <ol className='list-decimal space-y-2 pl-5'>
                    <li>Navigate to the Customers section</li>
                    <li>
                      To add a new customer manually, click &quot;Add
                      Customer&quot;
                    </li>
                    <li>
                      To edit an existing customer, find them in the list and
                      click the edit icon
                    </li>
                    <li>
                      Fill in or update their information (name, phone, email,
                      address, PAN)
                    </li>
                    <li>Save the changes</li>
                  </ol>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Viewing Customer Purchase History
                  </h3>
                  <p>To view a customer&apos;s purchase history:</p>
                  <ol className='list-decimal space-y-2 pl-5'>
                    <li>Find the customer in the Customers section</li>
                    <li>
                      Click on their name or the &quot;View Details&quot; button
                    </li>
                    <li>The customer profile will show all past purchases</li>
                    <li>
                      You can see total spending, frequency of purchases, and
                      preferred products
                    </li>
                  </ol>
                </div>

                <div className='rounded-lg border p-4'>
                  <h3 className='mb-2 font-medium'>Business Value</h3>
                  <p className='text-sm text-muted-foreground'>
                    Maintaining detailed customer records helps you build
                    relationships, offer personalized service, and implement
                    targeted marketing strategies based on purchase history.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart4 className='h-5 w-5' />
                Analytics and Reporting
              </CardTitle>
              <CardDescription>
                Learn how to use data visualizations to gain insights into your
                business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Available Analytics</h3>
                  <p>
                    The Analytics section provides visual representations of
                    your business data:
                  </p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>
                      <strong>Sales Trends:</strong> Daily, weekly, monthly, and
                      yearly sales graphs
                    </li>
                    <li>
                      <strong>Revenue Analysis:</strong> Visual breakdown of
                      revenue sources
                    </li>
                    <li>
                      <strong>Customer Growth:</strong> New and returning
                      customer metrics
                    </li>
                    <li>
                      <strong>Product Performance:</strong> Best and
                      worst-selling products
                    </li>
                    <li>
                      <strong>Category Analysis:</strong> Sales distribution
                      across product categories
                    </li>
                  </ul>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Using Graph Visualizations
                  </h3>
                  <p>
                    The system provides several types of graphs to help you
                    understand your data:
                  </p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>
                      <strong>Line Charts:</strong> Show trends over time
                      (sales, revenue, customer growth)
                    </li>
                    <li>
                      <strong>Bar Charts:</strong> Compare values across
                      categories or time periods
                    </li>
                    <li>
                      <strong>Pie Charts:</strong> Show proportional
                      distribution (sales by category, payment methods)
                    </li>
                    <li>
                      <strong>Heat Maps:</strong> Identify peak sales periods by
                      day and hour
                    </li>
                  </ul>
                  <p className='text-sm text-muted-foreground'>
                    You can adjust the time period for most graphs using the
                    date range selector at the top of the Analytics page.
                  </p>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Exporting Reports</h3>
                  <p>To save or share analytics data:</p>
                  <ol className='list-decimal space-y-2 pl-5'>
                    <li>Navigate to the desired report or graph</li>
                    <li>
                      Click the &quot;Export&quot; or &quot;Download&quot;
                      button
                    </li>
                    <li>Choose your preferred format (PDF, CSV, Excel)</li>
                    <li>Save the file to your device</li>
                  </ol>
                </div>

                <div className='rounded-lg border p-4'>
                  <h3 className='mb-2 font-medium'>
                    Making Data-Driven Decisions
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Use analytics to identify opportunities for growth, optimize
                    inventory, plan promotions, and make informed business
                    decisions based on actual performance data rather than
                    guesswork.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='restock' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Restocking Products
              </CardTitle>
              <CardDescription>
                Learn how to manage inventory levels and restock products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>When to Restock</h3>
                  <p>
                    The system helps you identify when restocking is needed:
                  </p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>Dashboard alerts for products below reorder level</li>
                    <li>
                      Color-coded inventory status (green: good, yellow: low,
                      red: out of stock)
                    </li>
                    <li>
                      Dedicated &quot;Low Stock&quot; filter in the Products
                      section
                    </li>
                    <li>
                      Automated notifications for critical inventory levels (if
                      enabled)
                    </li>
                  </ul>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    How to Restock Products
                  </h3>
                  <ol className='list-decimal space-y-2 pl-5'>
                    <li>Navigate to the Restock section from the sidebar</li>
                    <li>View the list of products that need restocking</li>
                    <li>
                      Click &quot;Add Stock&quot; for the product you want to
                      restock
                    </li>
                    <li>Enter the quantity being added</li>
                    <li>
                      Optionally update the purchase price if it has changed
                    </li>
                    <li>Select the supplier (if not already associated)</li>
                    <li>Add any notes about the restock (optional)</li>
                    <li>
                      Click &quot;Confirm Restock&quot; to update inventory
                    </li>
                  </ol>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Bulk Restocking</h3>
                  <p>For efficiency when receiving large shipments:</p>
                  <ol className='list-decimal space-y-2 pl-5'>
                    <li>
                      In the Restock section, click &quot;Bulk Restock&quot;
                    </li>
                    <li>Select multiple products from the list</li>
                    <li>Enter quantities for each selected product</li>
                    <li>Specify supplier and date for all selected items</li>
                    <li>
                      Click &quot;Confirm Bulk Restock&quot; to update all items
                      at once
                    </li>
                  </ol>
                </div>

                <div className='rounded-md border border-blue-200 bg-blue-50 p-4'>
                  <h4 className='mb-2 flex items-center gap-2 font-medium text-blue-800'>
                    <HelpCircle className='h-4 w-4' />
                    Important Note
                  </h4>
                  <p className='text-sm text-blue-700'>
                    Each restock action creates a record in the Stock Movements
                    log with the type &quot;purchase&quot;. This helps maintain
                    an audit trail of all inventory changes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='ledger' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                Ledger Management
              </CardTitle>
              <CardDescription>
                Learn how to track financial transactions with suppliers and
                customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Understanding the Ledger
                  </h3>
                  <p>
                    The Ledger provides a comprehensive record of all financial
                    transactions:
                  </p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>Tracks payments to suppliers</li>
                    <li>Records customer payments and credits</li>
                    <li>
                      Maintains running balances with each business partner
                    </li>
                    <li>
                      Provides transaction history for auditing and
                      reconciliation
                    </li>
                  </ul>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Recording Transactions
                  </h3>
                  <ol className='list-decimal space-y-2 pl-5'>
                    <li>Navigate to the Ledger section from the sidebar</li>
                    <li>
                      Select the firm (supplier or customer) from the dropdown
                    </li>
                    <li>Click &quot;Add Transaction&quot;</li>
                    <li>Enter the transaction date</li>
                    <li>
                      Provide a description in the &quot;Particular&quot; field
                    </li>
                    <li>
                      Enter the amount as either Debit (Dr) or Credit (Cr)
                    </li>
                    <li>
                      The system will automatically calculate the new balance
                    </li>
                    <li>Click &ldquo;Save Transaction&quot; to record it</li>
                  </ol>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Viewing Transaction History
                  </h3>
                  <p>To view the complete transaction history for a firm:</p>
                  <ol className='list-decimal space-y-2 pl-5'>
                    <li>
                      Select the firm from the dropdown in the Ledger section
                    </li>
                    <li>
                      The system will display all transactions in chronological
                      order
                    </li>
                    <li>You can filter by date range using the date picker</li>
                    <li>
                      Export the ledger as PDF or Excel for record-keeping or
                      sharing
                    </li>
                  </ol>
                </div>

                <div className='rounded-lg border p-4'>
                  <h3 className='mb-2 font-medium'>Business Benefits</h3>
                  <p className='text-sm text-muted-foreground'>
                    Maintaining an accurate ledger helps you track outstanding
                    balances, manage cash flow, prepare for tax filings, and
                    maintain professional relationships with suppliers and
                    customers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                System Settings
              </CardTitle>
              <CardDescription>
                Learn how to customize the system to match your business needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Company Details</h3>
                  <p>
                    Configure your business information for invoices and
                    reports:
                  </p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>
                      <strong>Company Name:</strong> Your business name as it
                      appears on invoices
                    </li>
                    <li>
                      <strong>Address:</strong> Physical location of your
                      business
                    </li>
                    <li>
                      <strong>Contact Information:</strong> Phone numbers and
                      email addresses
                    </li>
                    <li>
                      <strong>VAT/Tax Number:</strong> For tax compliance on
                      invoices
                    </li>
                    <li>
                      <strong>Logo:</strong> Upload your company logo for
                      branding
                    </li>
                  </ul>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Appearance Settings</h3>
                  <p>Customize the look and feel of your system:</p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>
                      <strong>Theme:</strong> Choose between light, dark, or
                      system theme
                    </li>
                    <li>
                      <strong>Color Scheme:</strong> Select primary colors that
                      match your brand
                    </li>
                    <li>
                      <strong>Dashboard Layout:</strong> Arrange widgets based
                      on your priorities
                    </li>
                  </ul>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>System Preferences</h3>
                  <p>Configure operational settings:</p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>
                      <strong>Date Format:</strong> Choose between different
                      date display formats
                    </li>
                    <li>
                      <strong>Time Format:</strong> 12-hour or 24-hour clock
                    </li>
                    <li>
                      <strong>Currency:</strong> Set your primary currency for
                      financial calculations
                    </li>
                    <li>
                      <strong>Tax Rates:</strong> Configure default tax rates
                      for products
                    </li>
                    <li>
                      <strong>Notifications:</strong> Enable/disable alerts for
                      low stock, sales, etc.
                    </li>
                  </ul>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>User Management</h3>
                  <p>If you have multiple staff members using the system:</p>
                  <ul className='list-disc space-y-2 pl-5'>
                    <li>Add new users with appropriate access levels</li>
                    <li>Manage permissions for different user roles</li>
                    <li>Monitor user activity and login history</li>
                    <li>Reset passwords and manage account security</li>
                  </ul>
                </div>

                <div className='rounded-md border border-amber-200 bg-amber-50 p-4'>
                  <h4 className='mb-2 flex items-center gap-2 font-medium text-amber-800'>
                    <AlertCircle className='h-4 w-4' />
                    Important
                  </h4>
                  <p className='text-sm text-amber-700'>
                    Always save your settings after making changes. Some
                    settings changes may require you to refresh the page or log
                    out and back in to take effect.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className='mt-12 border-t pt-8'>
        <h2 className='mb-4 text-2xl font-bold'>Frequently Asked Questions</h2>
        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='faq-1'>
            <AccordionTrigger>
              How do I get started with the system?
            </AccordionTrigger>
            <AccordionContent>
              <p>
                We recommend starting by setting up your company details in
                Settings, then adding your product categories, followed by
                adding your products and suppliers. This establishes the
                foundation for your inventory management system before you begin
                recording sales and transactions.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='faq-2'>
            <AccordionTrigger>
              Can I import my existing product data?
            </AccordionTrigger>
            <AccordionContent>
              <p>
                Yes, you can import products using our bulk import feature.
                Prepare your data in CSV format following our template, then use
                the Import function in the Products section. The system will
                guide you through mapping your columns and validating the data
                before import.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='faq-3'>
            <AccordionTrigger>
              How do I handle product returns?
            </AccordionTrigger>
            <AccordionContent>
              <p>
                To process a return, go to the Sales section, find the original
                sale, and click &quot;Process Return.&quot; You can choose to
                return all items or specific ones. The system will automatically
                adjust inventory levels and create the necessary records in your
                stock movements and financial ledger.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='faq-4'>
            <AccordionTrigger>
              Can I use the system on mobile devices?
            </AccordionTrigger>
            <AccordionContent>
              <p>
                Yes, the system is fully responsive and works on smartphones and
                tablets. You can access all features through your mobile browser
                without needing to install an app. This makes it convenient to
                check inventory, process sales, or view reports while on the go.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='faq-5'>
            <AccordionTrigger>How secure is my business data?</AccordionTrigger>
            <AccordionContent>
              <p>
                Your data is secured using industry-standard encryption both in
                transit and at rest. We implement regular backups, strict access
                controls, and follow best practices for data protection. Only
                authorized users with proper credentials can access your
                business information.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className='mt-12 text-center'>
        <p className='mb-4 text-muted-foreground'>
          Need more help? Our support team is ready to assist you.
        </p>
        <div className='flex justify-center gap-4'>
          <a href='#' className='flex items-center gap-1 hover:underline'>
            <HelpCircle className='h-4 w-4' />
            Contact Support
          </a>
          <a href='#' className='flex items-center gap-1 hover:underline'>
            <FileText className='h-4 w-4' />
            View Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
