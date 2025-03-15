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
  FunctionReference
} from 'convex/server';
import type * as documents from '../documents.js';
import type * as emptyProductPrices from '../emptyProductPrices.js';
import type * as functions from '../functions.js';
import type * as product from '../product.js';

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  documents: typeof documents;
  emptyProductPrices: typeof emptyProductPrices;
  functions: typeof functions;
  product: typeof product;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'public'>
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'internal'>
>;
