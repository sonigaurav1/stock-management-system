import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
}

/**
 * HelpTooltip Component
 * Provides contextual help for non-technical users
 * Shows tooltips with plain English explanations
 */
export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative inline-block'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200'
        aria-label={`Help: ${title}`}
      >
        {icon ? icon : <HelpCircle className='h-3 w-3' />}
      </button>

      {isOpen && (
        <div className='absolute right-0 z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg md:left-0 md:right-auto'>
          <div className='absolute right-2 top-0 h-2 w-2 -translate-y-1 rotate-45 transform border-l border-t border-gray-200 bg-white md:left-2 md:right-auto'></div>
          <h4 className='mb-2 text-sm font-semibold text-gray-900'>{title}</h4>
          <p className='text-sm leading-relaxed text-gray-700'>{content}</p>
          <button
            onClick={() => setIsOpen(false)}
            className='mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800'
          >
            Got it ✓
          </button>
        </div>
      )}

      {/* Backdrop to close tooltip */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

/**
 * Smart Guidance Component
 * Shows contextual suggestions and recommendations
 */
interface SmartGuidanceProps {
  message: string;
  type: 'info' | 'warning' | 'success' | 'tip';
  icon?: React.ReactNode;
}

export const SmartGuidance: React.FC<SmartGuidanceProps> = ({
  message,
  type,
  icon
}) => {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-900 text-blue-600',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 text-amber-600',
    success: 'bg-green-50 border-green-200 text-green-900 text-green-600',
    tip: 'bg-purple-50 border-purple-200 text-purple-900 text-purple-600'
  };

  const typeIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✓',
    tip: '💡'
  };

  return (
    <div className={`flex items-start gap-2 rounded-lg border border-l-4 p-3`}>
      <span className='mt-0.5 text-lg'>{icon || typeIcons[type]}</span>
      <p className='text-sm' dangerouslySetInnerHTML={{ __html: message }}></p>
    </div>
  );
};

/**
 * Knowledge Base Component
 * Searchable collection of help articles for non-technical users
 */
interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
}

const KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'What is Gross Profit?',
    category: 'Profit & Loss',
    content:
      'Gross Profit is the money left after you subtract the cost of products from your revenue. It shows how profitable your core business is before considering other expenses like rent or salaries.',
    tags: ['profit', 'p&l', 'revenue', 'cost']
  },
  {
    id: '2',
    title: 'How to Improve Profit Margins',
    category: 'Profit & Loss',
    content:
      'You can improve margins by: (1) Raising prices - even 5% increases profit significantly, (2) Reducing costs - negotiate with suppliers, (3) Selling more expensive items, (4) Eliminating slow-selling products with low margins.',
    tags: ['margin', 'profit', 'pricing', 'optimization']
  },
  {
    id: '3',
    title: 'Understanding Cash Flow',
    category: 'Cash Flow',
    content:
      'Cash flow is the movement of money in and out of your business. Positive cash flow means more money coming in than going out. Many businesses fail due to poor cash flow even when profitable on paper.',
    tags: ['cash', 'flow', 'receivables', 'payables']
  },
  {
    id: '4',
    title: 'How to Improve Collections',
    category: 'Cash Flow',
    content:
      'To collect money from customers faster: (1) Send invoices immediately after sale, (2) Set clear payment terms (due in 15-30 days), (3) Follow up on overdue invoices within 5 days, (4) Offer discounts for early payment.',
    tags: ['receivables', 'collection', 'invoice', 'cash']
  },
  {
    id: '5',
    title: 'What is Break-Even Analysis?',
    category: 'Profit & Loss',
    content:
      'Break-even analysis tells you how many units you need to sell to cover all your costs. This helps you set sales targets and understand if a product is worth keeping.',
    tags: ['break-even', 'analysis', 'target', 'cost']
  },
  {
    id: '6',
    title: 'Understanding Receivables and Payables',
    category: 'Cash Flow',
    content:
      'Receivables = Money customers owe you. Payables = Money you owe suppliers. Managing both well is critical for positive cash flow. Collect from customers faster than you pay suppliers when possible.',
    tags: ['receivables', 'payables', 'management']
  },
  {
    id: '7',
    title: 'How to Read a P&L Statement',
    category: 'Profit & Loss',
    content:
      'A P&L statement shows: Revenue (what you earned) - COGS (what you spent on products) = Gross Profit. If this number is positive and growing, your business is healthy.',
    tags: ['p&l', 'statement', 'revenue', 'profit']
  },
  {
    id: '8',
    title: 'Best Practices for Inventory Management',
    category: 'Operations',
    content:
      'Keep only what you can sell in 30 days. Order based on sales patterns, not hunches. Use the ABC method: A (high-value products), B (medium), C (low). Focus management on category A.',
    tags: ['inventory', 'management', 'stock', 'ordering']
  },
  {
    id: '9',
    title: 'Calculating Profit Margin Percentage',
    category: 'Profit & Loss',
    content:
      'Profit Margin % = (Profit ÷ Revenue) × 100. If you earned $100 and your profit was $25, your margin is 25%. Higher margins are better. Typical healthy margins: Retail 15-30%, Services 20-40%, Manufacturing 10-25%.',
    tags: ['margin', 'profit', 'percentage', 'calculation']
  },
  {
    id: '10',
    title: 'Managing Supplier Relationships',
    category: 'Operations',
    content:
      'Build strong supplier relationships to: (1) Negotiate better prices, (2) Increase credit terms (pay in 30-60 days), (3) Get priority on deliveries, (4) Access exclusive products. Pay on time, communicate clearly, and consider loyalty.',
    tags: ['suppliers', 'payables', 'relationships', 'negotiation']
  },
  {
    id: '11',
    title: 'The 80/20 Rule for Inventory',
    category: 'Operations',
    content:
      "Often, 80% of your revenue comes from 20% of your products. Focus your time managing this top 20%. Review them weekly. For the remaining 80% of products generating just 20% of sales, consider if they're worth keeping or if they tie up capital.",
    tags: ['inventory', '80/20', 'pareto', 'optimization']
  },
  {
    id: '12',
    title: 'Understanding Working Capital',
    category: 'Cash Flow',
    content:
      "Working Capital = What you own - What you owe. It's the cash available to run daily operations. If customers take 60 days to pay but suppliers need payment in 30 days, you need working capital to bridge the gap. Manage this carefully.",
    tags: ['working-capital', 'cash', 'operations']
  },
  {
    id: '13',
    title: 'Early Payment Discounts Strategy',
    category: 'Cash Flow',
    content:
      'Offering 5% discounts for payment within 7 days can accelerate cash collection significantly. If a customer owes you $1000, they pay $950 immediately instead of $1000 in 30 days. The $50 cost is worth the faster cash.',
    tags: ['discount', 'early-payment', 'cash', 'customer']
  },
  {
    id: '14',
    title: 'Seasonal Business Management',
    category: 'Profit & Loss',
    content:
      'If your business has seasonal peaks and valleys: (1) Calculate average monthly profit, (2) Save during peak months for slow months, (3) Plan inventory based on patterns, (4) Adjust pricing strategically during peaks, (5) Line up credit with suppliers.',
    tags: ['seasonal', 'cash-planning', 'inventory', 'forecasting']
  }
];

interface KnowledgeBaseProps {
  searchQuery?: string;
  onArticleSelect?: (article: KnowledgeArticle) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  searchQuery = '',
  onArticleSelect
}) => {
  const [search, setSearch] = React.useState(searchQuery);
  const [selectedArticle, setSelectedArticle] =
    React.useState<KnowledgeArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );

  const categories = Array.from(new Set(KNOWLEDGE_BASE.map((a) => a.category)));

  const filteredArticles = KNOWLEDGE_BASE.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      );
    const matchesCategory =
      !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
      {/* Sidebar */}
      <div className='lg:col-span-1'>
        <div className='space-y-4'>
          {/* Search */}
          <div>
            <input
              type='text'
              placeholder='Search articles...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* Categories */}
          <div>
            <h3 className='mb-2 text-sm font-semibold text-gray-900'>
              Categories
            </h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`mb-2 block w-full rounded px-3 py-2 text-left text-sm ${
                selectedCategory === null
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Articles
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`mb-2 block w-full rounded px-3 py-2 text-left text-sm ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='lg:col-span-3'>
        {selectedArticle ? (
          // Article View
          <div className='rounded-lg border border-gray-200 bg-white p-6'>
            <button
              onClick={() => setSelectedArticle(null)}
              className='mb-4 text-sm font-semibold text-blue-600 hover:text-blue-800'
            >
              ← Back to Articles
            </button>
            <div className='space-y-4'>
              <h2 className='text-2xl font-bold text-gray-900'>
                {selectedArticle.title}
              </h2>
              <div className='flex gap-2'>
                <span className='inline-block rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700'>
                  {selectedArticle.category}
                </span>
              </div>
              <p className='leading-relaxed text-gray-700'>
                {selectedArticle.content}
              </p>
              <div className='flex flex-wrap gap-2 pt-4'>
                {selectedArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-600'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Articles List
          <div className='space-y-3'>
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => {
                    setSelectedArticle(article);
                    onArticleSelect?.(article);
                  }}
                  className='w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-400 hover:shadow-md'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='mb-1 font-semibold text-gray-900'>
                        {article.title}
                      </h3>
                      <p className='mb-2 text-sm text-gray-600'>
                        {article.content.substring(0, 100)}...
                      </p>
                      <span className='inline-block rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700'>
                        {article.category}
                      </span>
                    </div>
                    <span className='ml-4 text-blue-600'>→</span>
                  </div>
                </button>
              ))
            ) : (
              <div className='rounded-lg bg-gray-50 p-6 text-center'>
                <p className='text-gray-600'>
                  No articles found matching your search.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
