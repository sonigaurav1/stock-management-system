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
import type * as accountStatus from "../accountStatus.js";
import type * as admin from "../admin.js";
import type * as adminQueries from "../adminQueries.js";
import type * as analytics from "../analytics.js";
import type * as api_ from "../api.js";
import type * as auditLog from "../auditLog.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as budget from "../budget.js";
import type * as cashFlow from "../cashFlow.js";
import type * as categories from "../categories.js";
import type * as companies from "../companies.js";
import type * as companyAccess from "../companyAccess.js";
import type * as companyAccessActions from "../companyAccessActions.js";
import type * as companyDetails from "../companyDetails.js";
import type * as companyTeam from "../companyTeam.js";
import type * as compliance from "../compliance.js";
import type * as customerIntelligence from "../customerIntelligence.js";
import type * as dashboard from "../dashboard.js";
import type * as dashboardConfig from "../dashboardConfig.js";
import type * as dashboardExport from "../dashboardExport.js";
import type * as expenses from "../expenses.js";
import type * as feedback from "../feedback.js";
import type * as financialForecasting from "../financialForecasting.js";
import type * as forecasting from "../forecasting.js";
import type * as insights from "../insights.js";
import type * as inventoryOptimization from "../inventoryOptimization.js";
import type * as invoiceScheduler from "../invoiceScheduler.js";
import type * as ledger from "../ledger.js";
import type * as lib_analytics from "../lib/analytics.js";
import type * as lib_authHelper from "../lib/authHelper.js";
import type * as lib_email from "../lib/email.js";
import type * as lib_payments from "../lib/payments.js";
import type * as lib_permissionValidator from "../lib/permissionValidator.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as lib_schemaConstants from "../lib/schemaConstants.js";
import type * as lib_schemaHelpers from "../lib/schemaHelpers.js";
import type * as lib_secretStorage from "../lib/secretStorage.js";
import type * as lib_securityTests from "../lib/securityTests.js";
import type * as lib_slack from "../lib/slack.js";
import type * as lib_sms from "../lib/sms.js";
import type * as locations from "../locations.js";
import type * as logs from "../logs.js";
import type * as messaging from "../messaging.js";
import type * as migrations from "../migrations.js";
import type * as notificationPreferences from "../notificationPreferences.js";
import type * as notifications from "../notifications.js";
import type * as organizations from "../organizations.js";
import type * as payments from "../payments.js";
import type * as productSuppliers from "../productSuppliers.js";
import type * as products from "../products.js";
import type * as profitAndLoss from "../profitAndLoss.js";
import type * as registration from "../registration.js";
import type * as reporting from "../reporting.js";
import type * as sales from "../sales.js";
import type * as settings from "../settings.js";
import type * as stockTransfers from "../stockTransfers.js";
import type * as suppliers from "../suppliers.js";
import type * as tasks from "../tasks.js";
import type * as teamManagement from "../teamManagement.js";
import type * as tests from "../tests.js";
import type * as types from "../types.js";
import type * as users from "../users.js";
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
  accountStatus: typeof accountStatus;
  admin: typeof admin;
  adminQueries: typeof adminQueries;
  analytics: typeof analytics;
  api: typeof api_;
  auditLog: typeof auditLog;
  auth: typeof auth;
  billing: typeof billing;
  budget: typeof budget;
  cashFlow: typeof cashFlow;
  categories: typeof categories;
  companies: typeof companies;
  companyAccess: typeof companyAccess;
  companyAccessActions: typeof companyAccessActions;
  companyDetails: typeof companyDetails;
  companyTeam: typeof companyTeam;
  compliance: typeof compliance;
  customerIntelligence: typeof customerIntelligence;
  dashboard: typeof dashboard;
  dashboardConfig: typeof dashboardConfig;
  dashboardExport: typeof dashboardExport;
  expenses: typeof expenses;
  feedback: typeof feedback;
  financialForecasting: typeof financialForecasting;
  forecasting: typeof forecasting;
  insights: typeof insights;
  inventoryOptimization: typeof inventoryOptimization;
  invoiceScheduler: typeof invoiceScheduler;
  ledger: typeof ledger;
  "lib/analytics": typeof lib_analytics;
  "lib/authHelper": typeof lib_authHelper;
  "lib/email": typeof lib_email;
  "lib/payments": typeof lib_payments;
  "lib/permissionValidator": typeof lib_permissionValidator;
  "lib/permissions": typeof lib_permissions;
  "lib/schemaConstants": typeof lib_schemaConstants;
  "lib/schemaHelpers": typeof lib_schemaHelpers;
  "lib/secretStorage": typeof lib_secretStorage;
  "lib/securityTests": typeof lib_securityTests;
  "lib/slack": typeof lib_slack;
  "lib/sms": typeof lib_sms;
  locations: typeof locations;
  logs: typeof logs;
  messaging: typeof messaging;
  migrations: typeof migrations;
  notificationPreferences: typeof notificationPreferences;
  notifications: typeof notifications;
  organizations: typeof organizations;
  payments: typeof payments;
  productSuppliers: typeof productSuppliers;
  products: typeof products;
  profitAndLoss: typeof profitAndLoss;
  registration: typeof registration;
  reporting: typeof reporting;
  sales: typeof sales;
  settings: typeof settings;
  stockTransfers: typeof stockTransfers;
  suppliers: typeof suppliers;
  tasks: typeof tasks;
  teamManagement: typeof teamManagement;
  tests: typeof tests;
  types: typeof types;
  users: typeof users;
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
