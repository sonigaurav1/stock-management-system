# Fix Implicit Any Types in MultiLocationPage.tsx

## Status: ✅ COMPLETED

## Errors Fixed
1. Line 308: Parameter 's' implicitly has an 'any' type in `dashboard.salesByLocation.map((s) => ...)`
2. Line 378: Parameter 'l' implicitly has an 'any' type in `matrix.locations.map((l) => ...)`
3. Line 392: Parameter 'l' implicitly has an 'any' type in `matrix.locations.map((l) => ...)`

## Root Cause
The `useQuery` hooks from convex were returning `any` typed data, making all nested properties `any` as well. With `strict: true` in tsconfig, callback parameters cannot be implicitly `any`.

## Solution Applied
Defined explicit TypeScript interfaces for the query return types and typed the `useQuery` calls with those interfaces.

## Interfaces Added
- `LocationMetric` - shared location metric type
- `SalesByLocation` - shared sales by location type
- `DashboardMetrics` - for `getLocationDashboardMetrics`
- `SyncOverview` - for `getInventorySyncOverview`
- `MatrixLocation` - location entry in matrix
- `MatrixRow` - row entry in matrix
- `InventoryMatrix` - for `getInventoryMatrix`
- `CompareLocation` - location with rank for comparison
- `LocationCompare` - for `compareLocations`

## Changes Made
- Added 9 TypeScript interfaces after imports in `MultiLocationPage.tsx`
- Typed 4 `useQuery` calls with `as Interface | undefined` assertions:
  - `dashboard` → `DashboardMetrics | undefined`
  - `syncOverview` → `SyncOverview | undefined`
  - `matrix` → `InventoryMatrix | undefined`
  - `compare` → `LocationCompare | undefined`
- Removed unnecessary `typeof dashboard.locations[0]` inline type annotation

## Verification
- `npx tsc --noEmit -p tsconfig.json` returns no errors for MultiLocationPage.tsx

