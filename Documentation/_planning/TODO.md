# Fix Build Error - Missing isDeleted in messages insert

## Steps
- [x] 1. Identify the issue: `isDeleted` missing in 3 message insertions in `convex/tasks.ts`
- [x] 2. Add `isDeleted: false` to all 3 message insert calls in `convex/tasks.ts`
- [x] 3. Run `npm run build` to verify the fix

