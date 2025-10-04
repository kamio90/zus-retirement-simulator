/**
 * Reports Service
 * Handles PDF and XLS report generation
 */
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
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

/**
 * Generate XLS report from simulation results
 * @param payload Report payload with input, result, and optional benchmarks
 * @returns XLS buffer
 */
export async function generateXlsReport(payload: ReportPayload): Promise<Buffer> {
  try {
    const { result } = payload;
    const workbook = new ExcelJS.Workbook();

    // Metadata
    workbook.creator = 'ZUS Retirement Simulator';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Podsumowanie');

    // Title
    summarySheet.mergeCells('A1:D1');
    summarySheet.getCell('A1').value = 'Symulator Emerytalny ZUS - Wyniki';
    summarySheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF007A33' } };
    summarySheet.getCell('A1').alignment = { horizontal: 'center' };

    // Key Results
    let row = 3;
    summarySheet.getCell(`A${row}`).value = 'Wyniki główne';
    summarySheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row += 2;

    summarySheet.getCell(`A${row}`).value = 'Miesięczna emerytura (nominalna)';
    summarySheet.getCell(`B${row}`).value = result.monthlyPensionNominal;
    summarySheet.getCell(`B${row}`).numFmt = '#,##0.00 "PLN"';
    row++;

    summarySheet.getCell(`A${row}`).value = 'Miesięczna emerytura (wartość dzisiejsza)';
    summarySheet.getCell(`B${row}`).value = result.monthlyPensionRealToday;
    summarySheet.getCell(`B${row}`).numFmt = '#,##0.00 "PLN"';
    row++;

    summarySheet.getCell(`A${row}`).value = 'Stopa zastąpienia';
    summarySheet.getCell(`B${row}`).value = result.replacementRate;
    summarySheet.getCell(`B${row}`).numFmt = '0.0%';
    row += 2;

    // Scenario Details
    summarySheet.getCell(`A${row}`).value = 'Szczegóły scenariusza';
    summarySheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row += 2;

    summarySheet.getCell(`A${row}`).value = 'Wiek emerytalny';
    summarySheet.getCell(`B${row}`).value = `${result.scenario.retirementAge} lat`;
    row++;

    summarySheet.getCell(`A${row}`).value = 'Rok emerytury';
    summarySheet.getCell(`B${row}`).value = result.scenario.retirementYear;
    row++;

    summarySheet.getCell(`A${row}`).value = 'Miesiąc zgłoszenia';
    summarySheet.getCell(`B${row}`).value = result.scenario.claimMonth;
    row++;

    summarySheet.getCell(`A${row}`).value = 'Płeć';
    summarySheet.getCell(`B${row}`).value =
      result.scenario.gender === 'M' ? 'Mężczyzna' : 'Kobieta';
    row += 2;

    // Assumptions
    summarySheet.getCell(`A${row}`).value = 'Założenia';
    summarySheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row += 2;

    summarySheet.getCell(`A${row}`).value = 'Rodzaj dostawcy';
    summarySheet.getCell(`B${row}`).value = result.assumptions.providerKind;
    row++;

    summarySheet.getCell(`A${row}`).value = 'Waloryzacja roczna';
    summarySheet.getCell(`B${row}`).value = result.assumptions.annualValorizationSetId;
    row++;

    summarySheet.getCell(`A${row}`).value = 'Waloryzacja kwartalna';
    summarySheet.getCell(`B${row}`).value = result.assumptions.quarterlySetId;
    row++;

    summarySheet.getCell(`A${row}`).value = 'Tabela SDŻ';
    summarySheet.getCell(`B${row}`).value = result.assumptions.sdżTableId;
    row++;

    summarySheet.getCell(`A${row}`).value = 'Wersja CPI';
    summarySheet.getCell(`B${row}`).value = result.assumptions.cpiVintage;
    row++;

    summarySheet.getCell(`A${row}`).value = 'Wersja płac';
    summarySheet.getCell(`B${row}`).value = result.assumptions.wageVintage;

    // Auto-size columns
    summarySheet.getColumn('A').width = 40;
    summarySheet.getColumn('B').width = 25;

    // Capital Trajectory Sheet
    const trajectorySheet = workbook.addWorksheet('Trajektoria kapitału');

    // Headers
    trajectorySheet.getCell('A1').value = 'Rok';
    trajectorySheet.getCell('B1').value = 'Roczne wynagrodzenie (PLN)';
    trajectorySheet.getCell('C1').value = 'Składka roczna (PLN)';
    trajectorySheet.getCell('D1').value = 'Kapitał skumulowany (PLN)';

    trajectorySheet.getRow(1).font = { bold: true };
    trajectorySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5F3E8' }, // ZUS light green
    };

    // Data
    result.capitalTrajectory.forEach(
      (
        item: {
          year: number;
          annualWage: number;
          annualContribution: number;
          cumulativeCapitalAfterAnnual: number;
        },
        index: number
      ) => {
        const rowNum = index + 2;
        trajectorySheet.getCell(`A${rowNum}`).value = item.year;
        trajectorySheet.getCell(`B${rowNum}`).value = item.annualWage;
        trajectorySheet.getCell(`B${rowNum}`).numFmt = '#,##0.00';
        trajectorySheet.getCell(`C${rowNum}`).value = item.annualContribution;
        trajectorySheet.getCell(`C${rowNum}`).numFmt = '#,##0.00';
        trajectorySheet.getCell(`D${rowNum}`).value = item.cumulativeCapitalAfterAnnual;
        trajectorySheet.getCell(`D${rowNum}`).numFmt = '#,##0.00';
      }
    );

    // Auto-size columns
    trajectorySheet.getColumn('A').width = 12;
    trajectorySheet.getColumn('B').width = 28;
    trajectorySheet.getColumn('C').width = 28;
    trajectorySheet.getColumn('D').width = 30;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    logger.error(
      `XLS generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

// Placeholder for reports service
export const reportsService = {
  getReports: (): void => {
    // To be implemented: delegate to @core
  },
};
