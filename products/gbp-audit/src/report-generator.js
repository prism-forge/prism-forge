/**
 * PDF Report Generator
 * Generates a professional GBP Audit Report using PDFKit.
 */

import PDFDocument from 'pdfkit';

const COLORS = {
  primary: '#1a56db',
  secondary: '#6b7280',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  dark: '#111827',
  light: '#f9fafb',
  white: '#ffffff',
  border: '#e5e7eb',
};

/**
 * Generate a PDF audit report.
 * @param {object} auditResult - Output from auditProfile()
 * @param {object[]} competitors - Optional competitor data
 * @returns {PDFDocument} Writable PDF stream
 */
export function generatePdfReport(auditResult, competitors = []) {
  const doc = new PDFDocument({
    size: 'letter',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `GBP Audit Report — ${auditResult.businessName}`,
      Author: 'Prism Forge GBP Audit Tool',
      Subject: 'Google Business Profile Audit',
    },
  });

  renderCoverPage(doc, auditResult);
  doc.addPage();
  renderScoreSummary(doc, auditResult);
  doc.addPage();
  renderDetailedFindings(doc, auditResult);
  doc.addPage();
  renderRecommendations(doc, auditResult);

  if (competitors.length > 0) {
    doc.addPage();
    renderCompetitorComparison(doc, auditResult, competitors);
  }

  doc.addPage();
  renderNextSteps(doc, auditResult);

  return doc;
}

function renderCoverPage(doc, audit) {
  doc.moveDown(4);

  // Title
  doc.fontSize(32).fillColor(COLORS.primary).text('Google Business Profile', { align: 'center' });
  doc.fontSize(32).fillColor(COLORS.primary).text('Audit Report', { align: 'center' });
  doc.moveDown(1);

  // Business name
  doc.fontSize(20).fillColor(COLORS.dark).text(audit.businessName, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor(COLORS.secondary).text(audit.address, { align: 'center' });
  doc.moveDown(2);

  // Overall score circle (text representation)
  const gradeColor = audit.grade === 'A' ? COLORS.success
    : audit.grade === 'B' ? '#22c55e'
    : audit.grade === 'C' ? COLORS.warning
    : COLORS.danger;

  doc.fontSize(72).fillColor(gradeColor).text(audit.grade, { align: 'center' });
  doc.fontSize(24).fillColor(COLORS.dark).text(`${audit.overallScore}/100`, { align: 'center' });
  doc.moveDown(2);

  // Summary line
  const criticalCount = audit.findings.filter(f => f.severity === 'critical').length;
  const warningCount = audit.findings.filter(f => f.severity === 'warning').length;

  doc.fontSize(14).fillColor(COLORS.secondary);
  if (criticalCount > 0) {
    doc.text(`${criticalCount} critical issues found that need immediate attention`, { align: 'center' });
  } else if (warningCount > 0) {
    doc.text(`${warningCount} areas identified for improvement`, { align: 'center' });
  } else {
    doc.text('Your profile is performing well across all dimensions', { align: 'center' });
  }

  // Footer
  doc.moveDown(4);
  doc.fontSize(10).fillColor(COLORS.secondary);
  doc.text(`Report generated: ${new Date(audit.auditDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
  doc.text('Powered by Prism Forge GBP Audit Tool', { align: 'center' });
}

function renderScoreSummary(doc, audit) {
  doc.fontSize(20).fillColor(COLORS.primary).text('Score Summary');
  doc.moveDown(0.5);
  drawHorizontalRule(doc);
  doc.moveDown(1);

  Object.entries(audit.scores).forEach(([key, val]) => {
    const barWidth = 300;
    const barHeight = 16;
    const x = 200;
    const y = doc.y;

    // Label
    doc.fontSize(11).fillColor(COLORS.dark).text(val.label, 50, y, { width: 140 });

    // Background bar
    doc.rect(x, y, barWidth, barHeight).fill(COLORS.border);

    // Score bar
    const fillWidth = (val.score / 100) * barWidth;
    const barColor = val.score >= 70 ? COLORS.success
      : val.score >= 40 ? COLORS.warning
      : COLORS.danger;
    doc.rect(x, y, fillWidth, barHeight).fill(barColor);

    // Score text
    doc.fontSize(11).fillColor(COLORS.dark).text(`${val.score}`, x + barWidth + 10, y);

    doc.moveDown(0.8);
  });

  doc.moveDown(1);
  doc.fontSize(11).fillColor(COLORS.secondary)
    .text('Scores are weighted: Review Health (25%), Profile Completeness (20%), Response Rate (15%), Photos (10%), Categories (10%), Posting (10%), Attributes (5%), Website (5%).');
}

function renderDetailedFindings(doc, audit) {
  doc.fontSize(20).fillColor(COLORS.primary).text('Detailed Findings');
  doc.moveDown(0.5);
  drawHorizontalRule(doc);
  doc.moveDown(1);

  const severityOrder = { critical: 0, warning: 1, good: 2 };
  const sorted = [...audit.findings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  sorted.forEach(finding => {
    checkPageBreak(doc, 80);

    const icon = finding.severity === 'critical' ? '[!]'
      : finding.severity === 'warning' ? '[~]'
      : '[+]';
    const color = finding.severity === 'critical' ? COLORS.danger
      : finding.severity === 'warning' ? COLORS.warning
      : COLORS.success;

    doc.fontSize(12).fillColor(color).text(`${icon} ${finding.dimension} — ${finding.score}/100`);
    doc.fontSize(10).fillColor(COLORS.dark).text(finding.finding, { indent: 20 });
    doc.moveDown(0.8);
  });
}

function renderRecommendations(doc, audit) {
  doc.fontSize(20).fillColor(COLORS.primary).text('Top Recommendations');
  doc.moveDown(0.5);
  drawHorizontalRule(doc);
  doc.moveDown(1);

  if (audit.recommendations.length === 0) {
    doc.fontSize(12).fillColor(COLORS.success)
      .text('Your profile is performing well across all dimensions. Keep up the great work!');
    return;
  }

  audit.recommendations.forEach((rec, i) => {
    checkPageBreak(doc, 100);

    doc.fontSize(13).fillColor(COLORS.primary).text(`${i + 1}. ${rec.dimension}`);
    doc.fontSize(10).fillColor(COLORS.dark).text(rec.action, { indent: 15 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor(COLORS.secondary)
      .text(`Impact: ${rec.impact}`, { indent: 15 });
    doc.fontSize(9).fillColor(COLORS.secondary)
      .text(`Estimated effort: ${rec.effort}`, { indent: 15 });
    doc.moveDown(0.8);
  });
}

function renderCompetitorComparison(doc, audit, competitors) {
  doc.fontSize(20).fillColor(COLORS.primary).text('Competitor Comparison');
  doc.moveDown(0.5);
  drawHorizontalRule(doc);
  doc.moveDown(1);

  // Table header
  const colWidths = [180, 80, 80, 80];
  const startX = 50;
  let y = doc.y;

  doc.fontSize(10).fillColor(COLORS.primary);
  doc.text('Business', startX, y, { width: colWidths[0] });
  doc.text('Rating', startX + colWidths[0], y, { width: colWidths[1], align: 'center' });
  doc.text('Reviews', startX + colWidths[0] + colWidths[1], y, { width: colWidths[2], align: 'center' });
  doc.text('Photos', startX + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3], align: 'center' });
  doc.moveDown(0.5);
  drawHorizontalRule(doc);
  doc.moveDown(0.3);

  // Your business (highlighted)
  y = doc.y;
  doc.fontSize(10).fillColor(COLORS.primary);
  doc.text(`${audit.businessName} (You)`, startX, y, { width: colWidths[0] });
  doc.text(`${audit.scores.reviewHealth.details.averageRating || 'N/A'}`, startX + colWidths[0], y, { width: colWidths[1], align: 'center' });
  doc.text(`${audit.scores.reviewHealth.details.totalReviews || 0}`, startX + colWidths[0] + colWidths[1], y, { width: colWidths[2], align: 'center' });
  doc.text(`${audit.scores.photoPresence.details.photoCount || 0}`, startX + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3], align: 'center' });
  doc.moveDown(0.5);

  // Competitors
  competitors.slice(0, 8).forEach(comp => {
    checkPageBreak(doc, 30);
    y = doc.y;
    const name = comp.displayName?.text || 'Unknown';
    const isHigher = (comp.rating || 0) > (audit.scores.reviewHealth.details.averageRating || 0);

    doc.fontSize(10).fillColor(isHigher ? COLORS.danger : COLORS.dark);
    doc.text(name.substring(0, 30), startX, y, { width: colWidths[0] });
    doc.text(`${comp.rating || 'N/A'}`, startX + colWidths[0], y, { width: colWidths[1], align: 'center' });
    doc.text(`${comp.userRatingCount || 0}`, startX + colWidths[0] + colWidths[1], y, { width: colWidths[2], align: 'center' });
    doc.text(`${comp.photos?.length || 0}`, startX + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3], align: 'center' });
    doc.moveDown(0.5);
  });

  doc.moveDown(1);
  doc.fontSize(10).fillColor(COLORS.secondary)
    .text('Competitors shown in red have higher ratings. Focus on reviews, photos, and profile completeness to close the gap.');
}

function renderNextSteps(doc, audit) {
  doc.fontSize(20).fillColor(COLORS.primary).text('What Happens Next');
  doc.moveDown(0.5);
  drawHorizontalRule(doc);
  doc.moveDown(1);

  const steps = [
    {
      title: 'Quick Wins (Do This Week)',
      items: audit.recommendations
        .filter(r => r.effort.includes('minute'))
        .map(r => r.action),
    },
    {
      title: 'Short-Term Improvements (This Month)',
      items: audit.recommendations
        .filter(r => r.effort.includes('hour') || r.effort.includes('week'))
        .map(r => r.action),
    },
    {
      title: 'Ongoing Optimization',
      items: [
        'Request reviews after every completed job — aim for 5+ per week',
        'Respond to all reviews within 24 hours',
        'Post weekly Google Business updates',
        'Add new photos monthly',
        'Monitor your competitor rankings quarterly',
      ],
    },
  ];

  steps.forEach(step => {
    checkPageBreak(doc, 80);
    doc.fontSize(14).fillColor(COLORS.dark).text(step.title);
    doc.moveDown(0.3);

    if (step.items.length === 0) {
      doc.fontSize(10).fillColor(COLORS.success).text('All items in this category are already handled!', { indent: 15 });
    } else {
      step.items.forEach(item => {
        doc.fontSize(10).fillColor(COLORS.dark).text(`• ${item}`, { indent: 15 });
      });
    }
    doc.moveDown(1);
  });

  // CTA
  doc.moveDown(1);
  drawHorizontalRule(doc);
  doc.moveDown(1);
  doc.fontSize(14).fillColor(COLORS.primary).text('Need help implementing these recommendations?', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor(COLORS.dark)
    .text('We offer monthly GBP management starting at $99/month.', { align: 'center' });
  doc.text('Includes: profile optimization, review management, weekly posts, and monthly reporting.', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor(COLORS.primary).text('Contact: hello@prismforge.dev', { align: 'center' });
}

function drawHorizontalRule(doc) {
  const y = doc.y;
  doc.moveTo(50, y).lineTo(562, y).stroke(COLORS.border);
}

function checkPageBreak(doc, neededSpace) {
  if (doc.y + neededSpace > 700) {
    doc.addPage();
  }
}

/**
 * Generate a plain-text audit summary (for email/SMS).
 * @param {object} auditResult - Output from auditProfile()
 * @returns {string} Plain text summary
 */
export function generateTextSummary(auditResult) {
  const lines = [
    `GBP AUDIT REPORT — ${auditResult.businessName}`,
    `Overall Score: ${auditResult.overallScore}/100 (Grade: ${auditResult.grade})`,
    `Date: ${new Date(auditResult.auditDate).toLocaleDateString()}`,
    '',
    'SCORES:',
  ];

  Object.values(auditResult.scores).forEach(s => {
    const bar = '█'.repeat(Math.round(s.score / 10)) + '░'.repeat(10 - Math.round(s.score / 10));
    lines.push(`  ${s.label.padEnd(22)} ${bar} ${s.score}/100`);
  });

  lines.push('');
  lines.push('TOP RECOMMENDATIONS:');
  auditResult.recommendations.forEach((rec, i) => {
    lines.push(`  ${i + 1}. ${rec.action}`);
  });

  return lines.join('\n');
}
