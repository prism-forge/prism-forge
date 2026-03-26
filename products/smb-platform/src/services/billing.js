/**
 * Billing Service — Stripe integration.
 * Handles subscriptions, plan management, and webhooks.
 */

import Stripe from 'stripe';

let stripe;

function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

const PRICE_MAP = {
  starter: process.env.STRIPE_PRICE_STARTER,
  growth: process.env.STRIPE_PRICE_GROWTH,
  premium: process.env.STRIPE_PRICE_PREMIUM,
  voice: process.env.STRIPE_PRICE_VOICE,
};

/**
 * Create a Stripe customer for a new user.
 * @param {object} user - { email, name }
 * @returns {Promise<string>} Stripe customer ID
 */
export async function createCustomer(user) {
  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });
  return customer.id;
}

/**
 * Create a subscription.
 * @param {string} customerId - Stripe customer ID
 * @param {string} plan - Plan name ('starter', 'growth', 'premium', 'voice')
 * @param {string} [paymentMethodId] - Stripe payment method ID
 * @returns {Promise<object>} Subscription details
 */
export async function createSubscription(customerId, plan, paymentMethodId) {
  const priceId = PRICE_MAP[plan];
  if (!priceId) throw new Error(`Unknown plan: ${plan}`);

  if (paymentMethodId) {
    await getStripe().paymentMethods.attach(paymentMethodId, { customer: customerId });
    await getStripe().customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  const subscription = await getStripe().subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: 14,
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
  };
}

/**
 * Cancel a subscription.
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<object>}
 */
export async function cancelSubscription(subscriptionId) {
  const subscription = await getStripe().subscriptions.cancel(subscriptionId);
  return { status: subscription.status, canceledAt: new Date() };
}

/**
 * Change subscription plan.
 * @param {string} subscriptionId - Current subscription ID
 * @param {string} newPlan - New plan name
 * @returns {Promise<object>}
 */
export async function changePlan(subscriptionId, newPlan) {
  const priceId = PRICE_MAP[newPlan];
  if (!priceId) throw new Error(`Unknown plan: ${newPlan}`);

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const updated = await getStripe().subscriptions.update(subscriptionId, {
    items: [{ id: subscription.items.data[0].id, price: priceId }],
    proration_behavior: 'create_prorations',
  });

  return { subscriptionId: updated.id, plan: newPlan, status: updated.status };
}

/**
 * Create a Stripe billing portal session.
 * @param {string} customerId - Stripe customer ID
 * @param {string} returnUrl - URL to return to after portal
 * @returns {Promise<string>} Portal URL
 */
export async function createPortalSession(customerId, returnUrl) {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || process.env.APP_URL,
  });
  return session.url;
}

/**
 * Construct and verify a Stripe webhook event.
 * @param {Buffer} rawBody - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @returns {object} Verified event
 */
export function constructWebhookEvent(rawBody, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  return getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
}

/**
 * Handle Stripe webhook events.
 * @param {object} event - Stripe event
 * @returns {object} { action, data }
 */
export function handleWebhookEvent(event) {
  switch (event.type) {
    case 'customer.subscription.created':
      return { action: 'subscription_created', data: event.data.object };
    case 'customer.subscription.updated':
      return { action: 'subscription_updated', data: event.data.object };
    case 'customer.subscription.deleted':
      return { action: 'subscription_canceled', data: event.data.object };
    case 'invoice.paid':
      return { action: 'payment_succeeded', data: event.data.object };
    case 'invoice.payment_failed':
      return { action: 'payment_failed', data: event.data.object };
    case 'customer.subscription.trial_will_end':
      return { action: 'trial_ending', data: event.data.object };
    default:
      return { action: 'unhandled', type: event.type };
  }
}
