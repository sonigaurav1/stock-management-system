/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as analytics from "../analytics.js";
import type * as billing from "../billing.js";
import type * as categories from "../categories.js";
import type * as companyDetails from "../companyDetails.js";
import type * as ledger from "../ledger.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as sales from "../sales.js";
import type * as suppliers from "../suppliers.js";
import type * as types from "../types.js";
import type * as verification from "../verification.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  analytics: typeof analytics;
  billing: typeof billing;
  categories: typeof categories;
  companyDetails: typeof companyDetails;
  ledger: typeof ledger;
  payments: typeof payments;
  products: typeof products;
  sales: typeof sales;
  suppliers: typeof suppliers;
  types: typeof types;
  verification: typeof verification;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
