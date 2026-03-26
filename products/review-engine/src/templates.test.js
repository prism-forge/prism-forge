import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderTemplate, generateReviewUrl, listTemplates, TEMPLATES } from './templates.js';

describe('templates', () => {
  it('renders a template with variables', () => {
    const result = renderTemplate('initial_friendly', {
      businessName: "Joe's Plumbing",
      customerName: 'Sarah',
      reviewUrl: 'https://example.com/review',
      serviceName: 'water heater repair',
    });

    assert.ok(result.body.includes("Joe's Plumbing"));
    assert.ok(result.body.includes('Sarah'));
    assert.ok(result.body.includes('https://example.com/review'));
    assert.equal(result.channel, 'sms');
    assert.equal(result.timing, 'same_day');
  });

  it('renders all templates without error', () => {
    const vars = {
      businessName: 'Test Biz',
      customerName: 'John',
      reviewUrl: 'https://test.com',
      serviceName: 'plumbing',
    };

    for (const id of Object.keys(TEMPLATES)) {
      const result = renderTemplate(id, vars);
      assert.ok(result.body, `Template ${id} should have a body`);
      assert.ok(result.channel, `Template ${id} should have a channel`);
    }
  });

  it('throws for unknown template', () => {
    assert.throws(() => renderTemplate('nonexistent', {}), /Template not found/);
  });

  it('generates correct Google review URL', () => {
    const url = generateReviewUrl('ChIJtest123');
    assert.equal(url, 'https://search.google.com/local/writereview?placeid=ChIJtest123');
  });

  it('lists templates filtered by channel', () => {
    const smsTemplates = listTemplates('sms');
    assert.ok(smsTemplates.length > 0);
    assert.ok(smsTemplates.every(t => t.channel === 'sms'));

    const emailTemplates = listTemplates('email');
    assert.ok(emailTemplates.length > 0);
    assert.ok(emailTemplates.every(t => t.channel === 'email'));
  });

  it('lists templates filtered by timing', () => {
    const initial = listTemplates(null, 'same_day');
    assert.ok(initial.length > 0);
    assert.ok(initial.every(t => t.timing === 'same_day'));

    const followup = listTemplates(null, 'followup');
    assert.ok(followup.length > 0);
    assert.ok(followup.every(t => t.timing === 'followup'));
  });
});
