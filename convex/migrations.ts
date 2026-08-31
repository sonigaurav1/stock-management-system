import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { BUSINESS_TYPE_VALUES } from './lib/schemaConstants';

/**
 * Phase 2A Migration: Consolidate firms + companyDetails → companies
 * Idempotent — safe to run multiple times
 */
export const migrateToConsolidatedCompanyTable = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      firmsMigrated: 0,
      companyDetailsMigrated: 0,
      organizationSettingsMigrated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // Migrate firms → companies
    const firms = await ctx.db.query('firms').collect();
    for (const firm of firms) {
      try {
        // Check if already migrated
        const existing = await ctx.db
          .query('companies')
          .withIndex('by_user', (q) => q.eq('userId', firm.userId))
          .first();

        if (existing) {
          results.skipped++;
          continue;
        }

        // Create consolidated company record
        await ctx.db.insert('companies', {
          userId: firm.userId,
          name: firm.name,
          owner: firm.owner,
          businessType: 'retailer',
          type: 'firm',
          address: firm.address || '',
          city: undefined,
          state: undefined,
          postalCode: undefined,
          country: undefined,
          phone: firm.phone ? [firm.phone] : [],
          email: '',
          website: undefined,
          taxNumber: '',
          businessRegistration: undefined,
          isVerified: false,
          logo: undefined,
          description: undefined,
          urls: [],
          processedBy: undefined,
          isDeleted: firm.isDeleted,
          createdAt: firm.createdAt,
          updatedAt: Date.now()
        });

        results.firmsMigrated++;
      } catch (error) {
        results.errors.push(`Firm ${firm._id}: ${error}`);
      }
    }

    // Migrate companyDetails → companies
    const companyDetails = await ctx.db.query('companyDetails').collect();
    for (const details of companyDetails) {
      try {
        const existing = await ctx.db
          .query('companies')
          .withIndex('by_user', (q) => q.eq('userId', details.userId))
          .first();

        if (existing) {
          // Merge data if company exists
          await ctx.db.patch(existing._id, {
            name: existing.name || details.companyName,
            address: details.companyAddress || existing.address,
            phone: details.phone?.length ? details.phone : existing.phone,
            email: details.email || existing.email,
            website: details.website || existing.website,
            taxNumber: details.vatNumber || existing.taxNumber,
            isVerified: details.isVerified || existing.isVerified,
            urls: details.urls?.length ? details.urls : existing.urls,
            updatedAt: Date.now()
          });
        } else {
          // Create new
          await ctx.db.insert('companies', {
            userId: details.userId,
            name: details.companyName,
            owner: undefined,
            businessType: 'retailer',
            type: 'company',
            address: details.companyAddress,
            city: undefined,
            state: undefined,
            postalCode: undefined,
            country: undefined,
            phone: details.phone,
            email: details.email,
            website: details.website,
            taxNumber: details.vatNumber,
            businessRegistration: undefined,
            isVerified: details.isVerified,
            logo: undefined,
            description: undefined,
            urls: details.urls,
            processedBy: details.processedBy,
            isDeleted: details.isDeleted,
            createdAt: details.createdAt,
            updatedAt: Date.now()
          });
        }

        results.companyDetailsMigrated++;
      } catch (error) {
        results.errors.push(`CompanyDetails ${details._id}: ${error}`);
      }
    }

    // Migrate organizationSettings → companies
    const orgSettings = await ctx.db.query('organizationSettings').collect();
    for (const settings of orgSettings) {
      try {
        const existing = await ctx.db
          .query('companies')
          .withIndex('by_user', (q) => q.eq('userId', settings.userId))
          .first();

        if (existing) {
          // Merge data
          await ctx.db.patch(existing._id, {
            name: existing.name || settings.companyName,
            address: settings.address || existing.address,
            city: settings.city || existing.city,
            state: settings.state || existing.state,
            postalCode: settings.postalCode || existing.postalCode,
            country: settings.country || existing.country,
            phone: settings.phone ? [settings.phone] : existing.phone,
            email: settings.email || existing.email,
            website: settings.website || existing.website,
            taxNumber: settings.taxNumber || existing.taxNumber,
            businessRegistration:
              settings.businessRegistration || existing.businessRegistration,
            logo: settings.logo || existing.logo,
            description: settings.description || existing.description,
            updatedAt: Date.now()
          });
        } else {
          await ctx.db.insert('companies', {
            userId: settings.userId,
            name: settings.companyName,
            owner: undefined,
            businessType: (settings.businessType ||
              'retailer') as (typeof BUSINESS_TYPE_VALUES)[number],
            type: 'company',
            address: settings.address,
            city: settings.city,
            state: settings.state,
            postalCode: settings.postalCode,
            country: settings.country,
            phone: settings.phone ? [settings.phone] : [],
            email: settings.email,
            website: settings.website,
            taxNumber: settings.taxNumber,
            businessRegistration: settings.businessRegistration,
            isVerified: false,
            logo: settings.logo,
            description: settings.description,
            urls: [],
            processedBy: undefined,
            isDeleted: false,
            createdAt: settings.createdAt,
            updatedAt: Date.now()
          });
        }

        results.organizationSettingsMigrated++;
      } catch (error) {
        results.errors.push(`OrgSettings ${settings._id}: ${error}`);
      }
    }

    // Log migration result
    await ctx.db.insert('systemLog', {
      userId: 'system:migration',
      logType: 'bulk_operation',
      status: results.errors.length > 0 ? 'warning' : 'success',
      description: 'Phase 2A Migration: Consolidated companies table',
      metadata: results,
      timestamp: Date.now()
    });

    return results;
  }
});
