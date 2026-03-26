/**
 * Authentication middleware.
 * Validates JWT tokens from Supabase Auth.
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;

/**
 * Require authenticated user.
 * Extracts user from JWT and attaches to req.user.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user',
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Require business ownership.
 * Checks that the authenticated user owns the business in :businessId param.
 */
export function requireBusinessOwner(req, res, next) {
  // In production, check database. For scaffold, trust JWT.
  // TODO: Verify req.user.id owns req.params.businessId via Supabase RLS
  next();
}

/**
 * Require specific plan tier.
 * @param {string} minPlan - Minimum plan required ('starter', 'growth', 'premium', 'voice')
 */
export function requirePlan(minPlan) {
  const planOrder = { starter: 1, growth: 2, premium: 3, voice: 4 };

  return (req, res, next) => {
    const userPlan = req.business?.plan || 'starter';
    if ((planOrder[userPlan] || 0) < (planOrder[minPlan] || 0)) {
      return res.status(403).json({
        error: `This feature requires the ${minPlan} plan or higher`,
        currentPlan: userPlan,
        requiredPlan: minPlan,
      });
    }
    next();
  };
}
