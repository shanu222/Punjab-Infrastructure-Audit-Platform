const PDFDocument = require('pdfkit');

/**
 * @param {object} input
 * @param {object} result from analyzeFutureProject
 * @returns {Promise<Buffer>}
 */
function generateFutureProjectPdfBuffer(input, result) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(15).text('Punjab Infrastructure Audit Intelligence Platform', { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(12).text('Future Infrastructure — Pre-construction assessment', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(9).text(`Generated: ${new Date().toISOString()}`, { align: 'right' });
    doc.moveDown(1);

    doc.fontSize(11).text('Project inputs', { underline: true });
    doc.fontSize(10);
    doc.text(`Name: ${input.project_name || '—'}`);
    doc.text(`Type: ${input.type || '—'}`);
    doc.text(`District: ${input.district || '—'}`);
    doc.text(`Location: ${input.location?.lat ?? '—'}, ${input.location?.lng ?? '—'}`);
    doc.text(`Material: ${input.material || '—'}`);
    doc.text(`Structural type: ${input.structural_type || '—'}`);
    doc.moveDown();

    doc.fontSize(11).text('Hazard scores (0–100, higher = worse)', { underline: true });
    doc.fontSize(10);
    doc.text(
      `Flood: ${result.flood_risk?.score} (${result.flood_risk?.level})   |   Earthquake: ${result.earthquake_risk?.score} (${result.earthquake_risk?.level})   |   Heat: ${result.heat_risk?.score} (${result.heat_risk?.level})`
    );
    doc.text(`Structural component (model): ${result.structural_score ?? '—'}`);
    doc.text(`Overall band: ${result.overall_risk || '—'}   Composite: ${result.composite_index ?? '—'}`);
    doc.moveDown();

    doc.fontSize(11).text('Approval outcome', { underline: true });
    doc.fontSize(11).fillColor('#111').text(String(result.approval_status || '—'), { continued: false });
    doc.fillColor('#000');
    doc.fontSize(10).text(result.approval_explanation || result.recommendation || '—', { align: 'left' });
    doc.moveDown();

    doc.fontSize(11).text('Historical context', { underline: true });
    doc.fontSize(10);
    if (result.historical) {
      doc.text(`Nearby registered assets (sample): ${result.historical.nearby_asset_count ?? 0}`);
      doc.text(`Average area risk index: ${result.historical.average_area_risk ?? 'n/a'}`);
      doc.text(`High / critical audits in sample: ${result.historical.high_critical_audit_count ?? 0}`);
    }
    doc.moveDown(0.5);

    doc.fontSize(11).text('Nearby assets (summary)', { underline: true });
    doc.fontSize(9);
    const rows = (result.nearby_assets || []).slice(0, 15);
    if (rows.length === 0) {
      doc.text('None in search radius.');
    } else {
      rows.forEach((a) => {
        doc.text(
          `• ${a.type} — ${a.district} — ${a.distance_km} km — risk ${a.risk_score ?? 'n/a'}${a.is_flagged_critical ? ' [flagged critical]' : ''}`
        );
      });
    }
    doc.moveDown();

    doc.fontSize(11).text('Recommendations', { underline: true });
    doc.fontSize(10);
    (result.recommendations || []).forEach((line, i) => {
      doc.text(`${i + 1}. ${line}`, { paragraphGap: 4 });
    });

    doc.moveDown(1.2);
    doc.fontSize(8).fillColor('#555').text('This report is advisory and does not replace field investigation or statutory approvals.', {
      align: 'left',
    });

    doc.end();
  });
}

module.exports = { generateFutureProjectPdfBuffer };
