const PDFDocument = require('pdfkit');

/**
 * Build a government-style audit PDF in memory.
 * @param {import('mongoose').Document} audit — populated asset optional
 * @param {import('mongoose').Document | object} asset
 * @returns {Promise<Buffer>}
 */
function generateAuditPdfBuffer(audit, asset) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const a = audit.toObject ? audit.toObject() : audit;
    const ast = asset && (asset.toObject ? asset.toObject() : asset);

    doc.fontSize(16).text('Punjab Infrastructure Audit Intelligence Platform', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text('Infrastructure Audit Report', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`, { continued: false });
    doc.moveDown();

    if (ast) {
      doc.fontSize(11).text('Asset', { underline: true });
      doc.fontSize(10).text(`District: ${ast.district || '—'}`);
      doc.text(`Type: ${ast.type || '—'}`);
      doc.text(`Location: ${ast.location?.lat ?? '—'}, ${ast.location?.lng ?? '—'}`);
      doc.moveDown();
    }

    doc.fontSize(11).text('Risk summary', { underline: true });
    doc.fontSize(10).text(`Overall risk band: ${a.overall_risk || '—'}`);
    if (a.scores) {
      doc.text(
        `Scores — structural: ${a.scores.structural}, flood: ${a.scores.flood}, earthquake: ${a.scores.earthquake}, heat: ${a.scores.heat}`
      );
    }
    doc.moveDown();

    doc.fontSize(11).text('Structural checklist', { underline: true });
    if (a.structural_checklist) {
      const s = a.structural_checklist;
      doc.fontSize(10).text(`Cracks: ${s.cracks}; Foundation: ${s.foundation}`);
      doc.text(`Load capacity: ${s.load_capacity}; Corrosion: ${s.corrosion}`);
    }
    doc.moveDown();

    doc.fontSize(11).text('Disaster exposure (qualitative)', { underline: true });
    if (a.disaster_assessment) {
      const d = a.disaster_assessment;
      doc.fontSize(10).text(`Flood: ${d.flood}; Earthquake: ${d.earthquake}; Heat: ${d.heat}`);
    }
    doc.moveDown();

    doc.fontSize(11).text('Notes', { underline: true });
    doc.fontSize(10).text(a.notes || '—', { align: 'left' });

    doc.end();
  });
}

module.exports = { generateAuditPdfBuffer };
