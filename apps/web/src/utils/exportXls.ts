/**
 * Excel Export Utility
 * Exports simulation results to XLSX
 */
import ExcelJS from 'exceljs';
import type { SimulationResult } from '@zus/types';
import type { BenchmarksResponse } from '../services/api';

export async function exportToXls(
  result: SimulationResult,
  benchmarks?: BenchmarksResponse
): Promise<void> {
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
  summarySheet.getCell(`B${row}`).value = result.scenario.gender === 'M' ? 'Mężczyzna' : 'Kobieta';
  row += 2;

  // Benchmarks
  if (benchmarks) {
    summarySheet.getCell(`A${row}`).value = 'Porównanie z benchmarkami';
    summarySheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row += 2;

    summarySheet.getCell(`A${row}`).value = 'Średnia krajowa';
    summarySheet.getCell(`B${row}`).value = benchmarks.nationalAvgPension;
    summarySheet.getCell(`B${row}`).numFmt = '#,##0.00 "PLN"';
    row++;

    if (benchmarks.powiatAvgPension && benchmarks.powiatResolved) {
      summarySheet.getCell(`A${row}`).value = `Średnia w ${benchmarks.powiatResolved.name}`;
      summarySheet.getCell(`B${row}`).value = benchmarks.powiatAvgPension;
      summarySheet.getCell(`B${row}`).numFmt = '#,##0.00 "PLN"';
      row++;
    }

    const percentOfNational =
      (result.monthlyPensionRealToday / benchmarks.nationalAvgPension) * 100;
    summarySheet.getCell(`A${row}`).value = '% średniej krajowej';
    summarySheet.getCell(`B${row}`).value = percentOfNational / 100;
    summarySheet.getCell(`B${row}`).numFmt = '0.0%';
    row += 2;
  }

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
  result.capitalTrajectory.forEach((item, index) => {
    const rowNum = index + 2;
    trajectorySheet.getCell(`A${rowNum}`).value = item.year;
    trajectorySheet.getCell(`B${rowNum}`).value = item.annualWage;
    trajectorySheet.getCell(`B${rowNum}`).numFmt = '#,##0.00';
    trajectorySheet.getCell(`C${rowNum}`).value = item.annualContribution;
    trajectorySheet.getCell(`C${rowNum}`).numFmt = '#,##0.00';
    trajectorySheet.getCell(`D${rowNum}`).value = item.cumulativeCapitalAfterAnnual;
    trajectorySheet.getCell(`D${rowNum}`).numFmt = '#,##0.00';
  });

  // Auto-size columns
  trajectorySheet.getColumn('A').width = 12;
  trajectorySheet.getColumn('B').width = 28;
  trajectorySheet.getColumn('C').width = 28;
  trajectorySheet.getColumn('D').width = 30;

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const timestamp = new Date().toISOString().slice(0, 10);
  link.download = `emerytura-symulacja-${timestamp}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
