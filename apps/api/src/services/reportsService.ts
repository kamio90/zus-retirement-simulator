/**
 * Reports Service
 * Handles PDF and XLS report generation
 */
import PDFDocument from 'pdfkit';
import type { ReportPayload } from '@zus/types';
import { logger } from '../utils/logger';

/**
 * Generate PDF report from simulation results
 * @param payload Report payload with input, result, and optional benchmarks
 * @returns PDF buffer
 */
export async function generatePdfReport(payload: ReportPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { result, branding } = payload;
      const appName = branding?.appName || 'ZUS Retirement Simulator';
      const primaryColor = branding?.primaryHex || '#007a33';

      // Convert hex color to RGB
      const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 0, g: 122, b: 51 }; // ZUS green fallback
      };

      const rgb = hexToRgb(primaryColor);

      // Header
      doc
        .fontSize(24)
        .fillColor([rgb.r, rgb.g, rgb.b])
        .text('Symulator Emerytalny ZUS', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor('black').text('Wyniki Symulacji Emerytalnej', { align: 'center' });
      doc.moveDown(2);

      // Key Results Section
      doc.fontSize(16).fillColor([rgb.r, rgb.g, rgb.b]).text('Wyniki główne');
      doc.moveDown(0.5);

      doc.fontSize(12).fillColor('black');
      doc.text(`Miesięczna emerytura (nominalna): ${formatCurrency(result.monthlyPensionNominal)}`);
      doc.moveDown(0.3);
      doc.text(
        `Miesięczna emerytura (wartość dzisiejsza): ${formatCurrency(result.monthlyPensionRealToday)}`
      );
      doc.moveDown(0.3);
      doc.text(`Stopa zastąpienia: ${formatPercentage(result.replacementRate)}`);
      doc.moveDown(1.5);

      // Scenario Details
      doc.fontSize(16).fillColor([rgb.r, rgb.g, rgb.b]).text('Szczegóły scenariusza');
      doc.moveDown(0.5);

      doc.fontSize(12).fillColor('black');
      doc.text(`Wiek emerytalny: ${result.scenario.retirementAge} lat`);
      doc.moveDown(0.3);
      doc.text(`Rok emerytury: ${result.scenario.retirementYear}`);
      doc.moveDown(0.3);
      doc.text(`Miesiąc zgłoszenia: ${result.scenario.claimMonth}`);
      doc.moveDown(0.3);
      doc.text(`Płeć: ${result.scenario.gender === 'M' ? 'Mężczyzna' : 'Kobieta'}`);
      doc.moveDown(1.5);

      // Assumptions Section
      doc.fontSize(16).fillColor([rgb.r, rgb.g, rgb.b]).text('Założenia');
      doc.moveDown(0.5);

      doc.fontSize(12).fillColor('black');
      doc.text(`Rodzaj dostawcy: ${result.assumptions.providerKind}`);
      doc.moveDown(0.3);
      doc.text(`Waloryzacja roczna: ${result.assumptions.annualValorizationSetId}`);
      doc.moveDown(0.3);
      doc.text(`Waloryzacja kwartalna: ${result.assumptions.quarterlySetId}`);
      doc.moveDown(0.3);
      doc.text(`Tabela SDŻ: ${result.assumptions.sdżTableId}`);
      doc.moveDown(0.3);
      doc.text(`Wersja CPI: ${result.assumptions.cpiVintage}`);
      doc.moveDown(0.3);
      doc.text(`Wersja płac: ${result.assumptions.wageVintage}`);
      doc.moveDown(1.5);

      // Capital Trajectory Summary
      doc.fontSize(16).fillColor([rgb.r, rgb.g, rgb.b]).text('Trajektoria kapitału (wybrane lata)');
      doc.moveDown(0.5);

      doc.fontSize(10).fillColor('black');
      const trajectory = result.capitalTrajectory;
      const sampleYears = [
        0,
        Math.floor(trajectory.length / 4),
        Math.floor(trajectory.length / 2),
        Math.floor((3 * trajectory.length) / 4),
        trajectory.length - 1,
      ];

      sampleYears.forEach((idx) => {
        const row = trajectory[idx];
        if (row) {
          doc.text(
            `${row.year}: Wynagrodzenie ${formatCurrency(row.annualWage)}, Kapitał ${formatCurrency(row.cumulativeCapitalAfterAnnual)}`
          );
          doc.moveDown(0.2);
        }
      });

      // Footer
      doc.fontSize(10).fillColor('gray');
      doc.text(
        `${appName} - HackYeah 2025 | Wygenerowano: ${new Date().toLocaleString('pl-PL')}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      logger.error(
        `PDF generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
      reject(error);
    }
  });
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage value
 */
function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

// Placeholder for reports service
export const reportsService = {
  getReports: (): void => {
    // To be implemented: delegate to @core
  },
};
