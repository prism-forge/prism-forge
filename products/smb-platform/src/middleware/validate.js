/**
 * Request validation middleware using Zod.
 */

import { z } from 'zod';

/**
 * Validate request body against a Zod schema.
 * @param {z.ZodSchema} schema - Zod schema
 * @returns {Function} Express middleware
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    req.validated = result.data;
    next();
  };
}

/**
 * Validate query params against a Zod schema.
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: result.error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    req.validatedQuery = result.data;
    next();
  };
}

// Shared schemas
export const schemas = {
  createBusiness: z.object({
    name: z.string().min(1).max(200),
    placeId: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    category: z.string().optional(),
    address: z.string().optional(),
    website: z.string().url().optional(),
  }),

  createCustomer: z.object({
    name: z.string().min(1).max(200),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    serviceDate: z.string().optional(),
    serviceDescription: z.string().max(500).optional(),
  }),

  importCustomers: z.object({
    customers: z.array(z.object({
      name: z.string().min(1),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      serviceDate: z.string().optional(),
      serviceDescription: z.string().optional(),
    })).min(1).max(500),
  }),

  createCampaign: z.object({
    name: z.string().min(1).max(200),
    templateId: z.string().optional(),
    followUpDays: z.number().int().min(1).max(30).optional(),
    maxAttempts: z.number().int().min(1).max(5).optional(),
  }),

  generateResponse: z.object({
    reviewAuthor: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    reviewText: z.string().min(1).max(5000),
  }),

  subscribe: z.object({
    plan: z.enum(['starter', 'growth', 'premium', 'voice']),
    paymentMethodId: z.string().optional(),
  }),
};
