# Phase 1_2 - Developer Quick Start

## What is Phase 1_2?

Phase 1_2 extends the Phase 1_1 (Intelligent Dashboard) with three critical business features:

1. **📈 Profit & Loss Intelligence** - Automated reports showing revenue, costs, margins, and profitability
2. **💰 Cash Flow Management** - Track cash position, receivables, payables, and forecasts
3. **🎯 Non-Technical UX** - Help system for non-technical business owners (tooltips, wizard, KB)

## Quick Start (5 minutes)

### Step 1: Deploy Backend Queries

```bash
# The queries are already in convex/
# Make sure Convex backend is running
npx convex dev

# You should see no errors related to profitAndLoss.ts or cashFlow.ts
```

### Step 2: Add Components to Your Page

```typescript
// src/features/overview/components/OverviewPage.tsx
import Phase1_2Dashboard from './Phase1_2Dashboard';

export default function OverviewPage() {
  return <Phase1_2Dashboard />;
}
```

### Step 3: Test It

```bash
# Navigate to your dashboard URL
# You should see three tabs: Overview, P&L, Cash Flow, Help
# Setup Wizard should appear for first-time users
```

## File Locations

| What                | Where                                                    |
| ------------------- | -------------------------------------------------------- |
| P&L Queries         | `convex/profitAndLoss.ts`                                |
| Cash Flow Queries   | `convex/cashFlow.ts`                                     |
| P&L Component       | `src/components/dashboard/ProfitAndLossReport.tsx`       |
| Cash Flow Component | `src/components/dashboard/CashFlowDashboard.tsx`         |
| Help System         | `src/components/dashboard/HelpTooltip.tsx`               |
| Setup Wizard        | `src/components/dashboard/SetupWizard.tsx`               |
| Main Dashboard      | `src/features/overview/components/Phase1_2Dashboard.tsx` |
| Documentation       | `Documentation/Phase1_2/IMPLEMENTATION.md`               |

## Key Queries

### P&L Queries

```typescript
// Convex API
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';

// Get full P&L report
const plReport = useQuery(api.profitAndLoss.getProfitLossReport, {
  period: 'monthly'
});

// Get product profitability
const products = useQuery(api.profitAndLoss.getProductProfitability, {
  period: 'monthly',
  limit: 5
});

// Get category margins
const categories = useQuery(api.profitAndLoss.getCategoryMargins, {
  period: 'monthly'
});

// Get low margin products
const warnings = useQuery(api.profitAndLoss.getLowMarginProducts, {
  minMarginPercentage: 15
});

// Get profit trend
const trend = useQuery(api.profitAndLoss.getProfitTrend, { months: 3 });

// Get break-even analysis
const breakEven = useQuery(api.profitAndLoss.getBreakEvenAnalysis, {
  productId: 'product_123',
  monthlyFixedCosts: 10000
});
```

### Cash Flow Queries

```typescript
// Get cash position
const cashPosition = useQuery(api.cashFlow.getCashPositionSummary);

// Get payment alerts
const alerts = useQuery(api.cashFlow.getPaymentDueAlerts, { daysAhead: 30 });

// Get invoice aging
const aging = useQuery(api.cashFlow.getInvoiceAging);

// Get receivables
const receivables = useQuery(api.cashFlow.getReceivablesDashboard);

// Get payables
const payables = useQuery(api.cashFlow.getPayablesDashboard);

// Get cash forecast
const forecast = useQuery(api.cashFlow.getCashFlowForecast, { months: 3 });
```

## Component Usage Examples

### P&L Report

```typescript
import { ProfitAndLossReport } from '@/components/dashboard/ProfitAndLossReport';

export function Dashboard() {
  return <ProfitAndLossReport />;
}
```

### Cash Flow Dashboard

```typescript
import { CashFlowDashboard } from '@/components/dashboard/CashFlowDashboard';

export function Dashboard() {
  return <CashFlowDashboard />;
}
```

### Help Tooltips

```typescript
import { HelpTooltip, SmartGuidance } from '@/components/dashboard/HelpTooltip';

export function MyComponent() {
  return (
    <>
      <HelpTooltip
        title="Gross Profit"
        content="Revenue minus cost of goods - shows profit before expenses"
      />

      <SmartGuidance
        type="warning"
        message="Your margin is below 20%. <strong>Consider raising prices.</strong>"
      />
    </>
  );
}
```

### Setup Wizard

```typescript
import { SetupWizard } from '@/components/dashboard/SetupWizard';

export function Dashboard() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <>
      <button onClick={() => setShowWizard(true)}>Start Setup</button>

      {showWizard && (
        <SetupWizard onComplete={() => setShowWizard(false)} />
      )}
    </>
  );
}
```

### Knowledge Base

```typescript
import { KnowledgeBase } from '@/components/dashboard/HelpTooltip';

export function HelpPage() {
  return <KnowledgeBase />;
}
```

## Common Tasks

### Add a New Article to Knowledge Base

Edit `src/components/dashboard/HelpTooltip.tsx`:

```typescript
const KNOWLEDGE_BASE: KnowledgeArticle[] = [
  // ... existing articles
  {
    id: 'N',
    title: 'Your Article Title',
    category: 'Category Name',
    content: 'Your article content here...',
    tags: ['tag1', 'tag2']
  }
];
```

### Add a Setup Wizard Step

Edit `src/components/dashboard/SetupWizard.tsx`:

```typescript
const [steps, setSteps] = useState<SetupStep[]>([
  // ... existing steps
  {
    id: 6,
    title: 'Your New Step',
    description: 'Description of what to do',
    action: 'Button Label',
    icon: 'emoji',
    completed: false,
    estimatedTime: '1 min'
  }
]);
```

### Modify P&L Calculation

Edit `convex/profitAndLoss.ts`:

1. Find the relevant query (e.g., `getProfitLossReport`)
2. Update calculation logic
3. Save and let Convex auto-reload
4. Test in UI

## Troubleshooting

### "Query not found" error

- Make sure Convex backend is running: `npx convex dev`
- Check you're importing from `@/../convex/_generated/api`
- Verify file names match exactly

### Queries returning empty data

- Check your database has sales/payments/products
- Verify Convex queries aren't filtered by `userId` (auth check)
- Add console.debug to backend queries to debug

### TypeScript errors in components

- Ensure all imports use correct paths (@ alias)
- Run `pnpm tsc --check` to validate types
- Check UI component library exports exist

### Dashboard not showing

- Verify `Phase1_2Dashboard.tsx` is imported
- Check browser console for error messages
- Make sure Convex provider wraps your app

## Testing Strategy

### Unit Test Queries

```typescript
// Create a test file: convex/__tests__/profitAndLoss.test.ts
import { expect, it } from 'vitest';
import { getProfitLossReport } from '../profitAndLoss';

it('should calculate profit correctly', () => {
  // Mock data and test calculation
});
```

### Integration Test Components

```typescript
// Create: src/components/__tests__/ProfitAndLossReport.test.tsx
import { render, screen } from '@testing-library/react';
import { ProfitAndLossReport } from '@/components/dashboard/ProfitAndLossReport';

it('should render P&L report', () => {
  render(<ProfitAndLossReport />);
  expect(screen.getByText('Profit & Loss Summary')).toBeInTheDocument();
});
```

### Manual Testing Checklist

- [ ] P&L loads with sample data
- [ ] Cash Flow loads with sample data
- [ ] Help tooltips work on click
- [ ] Setup Wizard can be completed
- [ ] Knowledge Base search works
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Dark mode works (if applicable)

## Performance Tips

### Optimize Queries

```typescript
// Bad: Iterates all sales with O(n²) complexity
const all = await ctx.db.query('sales').collect();

// Better: Use indexes and filters
const sales = await ctx.db
  .query('sales')
  .withIndex('by_user_and_isDeleted', (q) =>
    q.eq('userId', userId).eq('isDeleted', false)
  )
  .filter((s) => s.soldAt >= startDate && s.soldAt <= endDate)
  .collect();
```

### Cache Results

```typescript
// In component: Cache last query result
const [lastReport, setLastReport] = useState(null);
const report = useQuery(...) || lastReport;
if (report && report !== lastReport) {
  setLastReport(report);
}
```

### Lazy Load Components

```typescript
import { lazy, Suspense } from 'react';

const CashFlow = lazy(() => import('./CashFlowDashboard'));

export function Dashboard() {
  return (
    <Suspense fallback="Loading...">
      <CashFlow />
    </Suspense>
  );
}
```

## Next Steps

1. **Deploy to production** - Follow your deployment process
2. **Monitor usage** - Track which features users use most
3. **Gather feedback** - Ask users what would help most
4. **Plan Phase 2** - Predictive forecasting and optimization
5. **Optimize based on metrics** - Use analytics to prioritize improvements

## Resources

- **All Features:** `Documentation/Phase1_2/IMPLEMENTATION.md`
- **Architecture:** `Documentation/ENTERPRISE_ARCHITECTURE.md`
- **Roadmap:** `Documentation/ENTERPRISE_ROADMAP.md`
- **Components:** See JSDoc comments in component files

## Support Contacts

- **Backend Questions:** Check `convex/profitAndLoss.ts` inline comments
- **Frontend Questions:** Check component files for JSDoc
- **Architecture Questions:** See `ENTERPRISE_ARCHITECTURE.md`

---

**Happy Coding! 🚀**

Questions? Review the detailed documentation in `Documentation/Phase1_2/IMPLEMENTATION.md`
