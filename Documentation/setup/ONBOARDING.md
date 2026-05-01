# Developer Onboarding

Complete guide for new developers to set up and start contributing to Invento.

## Prerequisites

- Node.js 18+ (check with `node --version`)
- npm or pnpm (recommend pnpm: `npm install -g pnpm`)
- Git
- Clerk account (for authentication)
- Convex account (for backend)
- Razorpay account (for payments, optional)

## Initial Setup (First Time)

### 1. Clone and Install
```bash
# Clone repository
git clone https://github.com/sonigaurav1/invento.git
cd invento

# Install dependencies
pnpm install

# Or with npm
npm install
```

### 2. Environment Variables
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your credentials
# Required variables:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - NEXT_PUBLIC_CONVEX_URL
# - CONVEX_DEPLOYMENT

# See ENV-VARS.md for complete list
```

### 3. Start Convex Backend
```bash
# In one terminal, start Convex dev server
pnpm convex

# This will:
# - Start local Convex backend
# - Watch for schema changes
# - Auto-generate types
# - Show logs
```

### 4. Start Frontend Development
```bash
# In another terminal
pnpm dev

# Opens http://localhost:3000
# Hot reloads on file changes
```

### 5. Create Test Account
```
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Enter email and password (for dev only)
4. Complete company setup
5. You now have an organization with sample data
```

## Project Structure Overview

```
invento/
├── convex/              # Backend (Convex queries/mutations)
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── features/        # Feature modules (auth, etc)
│   └── lib/             # Utilities and helpers
├── documentation/       # This documentation
├── public/              # Static assets
└── package.json         # Dependencies
```

### Key Directories to Know

- **convex/schema.ts** - Database schema definitions
- **convex/products.ts** - Product queries/mutations (example)
- **src/app/(main)/(authenticated)/** - Protected pages
- **src/components/ui/** - shadcn/ui components
- **src/features/auth/** - Authentication logic

## Common Development Tasks

### Adding a Feature
1. Read [documentation/MODULES.md](../MODULES.md) for context
2. Check [documentation/CODE-PATTERNS.md](../CODE-PATTERNS.md) for examples
3. Follow [documentation/CONVENTIONS.md](../CONVENTIONS.md) for code style
4. Implement feature with tests
5. Update documentation if adding new patterns

### Running Tests
```bash
# Run all tests
pnpm test

# Watch mode
pnpm test --watch

# Specific file
pnpm test ProductForm.test.tsx
```

### Formatting and Linting
```bash
# Format code
pnpm format

# Check formatting
pnpm format:check

# Lint with auto-fix
pnpm lint:fix

# Strict lint (no warnings)
pnpm lint:strict
```

### Building for Production
```bash
# Build
pnpm build

# Start production build locally
pnpm start

# Note: Requires proper env vars and Convex deployment
```

## Common Issues During Setup

### "Cannot find module 'convex/react'"
**Solution**: Run `pnpm convex` in another terminal and wait for code generation.

### "No organization after sign-up"
**Solution**: Verify Clerk is properly configured. Check `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.

### "Convex types out of sync"
**Solution**: Run `pnpm convex` to regenerate types from schema.

### "Port 3000 already in use"
**Solution**: 
```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Or use different port
pnpm dev -- -p 3001
```

## Development Workflow

### Typical Day
1. **Start**: `pnpm convex` (one terminal) + `pnpm dev` (another)
2. **Code**: Edit files - hot reload works automatically
3. **Check**: Run `pnpm lint:fix` before committing
4. **Commit**: Follow [git conventions](../CONVENTIONS.md#git-commits)
5. **Push**: Create pull request with description

### Making Changes
1. Create feature branch: `git checkout -b feat/my-feature`
2. Make changes following code conventions
3. Test locally in dev environment
4. Run linting: `pnpm lint:fix`
5. Commit with descriptive message
6. Push and create PR

## Useful Commands Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm convex           # Start Convex backend

# Building
pnpm build            # Build for production
pnpm start            # Run production build

# Code Quality
pnpm lint             # Check for lint errors
pnpm lint:fix         # Auto-fix lint errors
pnpm lint:strict      # Strict mode (no warnings)
pnpm format           # Format code
pnpm format:check     # Check formatting

# Testing
pnpm test             # Run tests
pnpm test --watch     # Watch mode

# Database
pnpm convex           # Access Convex dashboard
```

## Next Steps

1. **Explore codebase**: Browse [modules documentation](../MODULES.md)
2. **Learn patterns**: Review [code patterns](../CODE-PATTERNS.md)
3. **Understand architecture**: Read [ARCHITECTURE.md](../ARCHITECTURE.md)
4. **Pick a task**: Find an issue or feature to work on
5. **Ask questions**: Check documentation or reach out to team

## Support

- **Documentation**: Check `/documentation/` directory
- **Code examples**: See `/documentation/CODE-PATTERNS.md`
- **Database schema**: See `/documentation/DATABASE-SCHEMA.md`
- **Module specifics**: See `/documentation/modules/`

Welcome to Invento! 🚀
