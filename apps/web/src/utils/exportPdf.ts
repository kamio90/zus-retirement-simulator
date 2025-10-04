/**
 * PDF Export Utility
 * Exports simulation results to PDF
 */
import jsPDF from 'jspdf';
import type { SimulationResult } from '@zus/types';
import type { BenchmarksResponse } from '../services/api';

export async function exportToPdf(
  result: SimulationResult,
  benchmarks?: BenchmarksResponse
): Promise<void> {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 122, 51); // ZUS green
  doc.text('Symulator Emerytalny ZUS', 20, 20);

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Wyniki Symulacji Emerytalnej', 20, 30);

  let y = 45;

  // Key Results Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Wyniki główne:', 20, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Miesięczna emerytura (nominalna): ${formatCurrency(result.monthlyPensionNominal)}`,
    20,
    y
  );
  y += 7;
  doc.text(
    `Miesięczna emerytura (wartość dzisiejsza): ${formatCurrency(result.monthlyPensionRealToday)}`,
    20,
    y
  );
  y += 7;
  doc.text(`Stopa zastąpienia: ${formatPercentage(result.replacementRate)}`, 20, y);
  y += 15;

  // Scenario Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Szczegóły scenariusza:', 20, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Wiek emerytalny: ${result.scenario.retirementAge} lat`, 20, y);
  y += 7;
  doc.text(`Rok emerytury: ${result.scenario.retirementYear}`, 20, y);
  y += 7;
  doc.text(`Miesiąc zgłoszenia: ${result.scenario.claimMonth}`, 20, y);
  y += 7;
  doc.text(`Płeć: ${result.scenario.gender === 'M' ? 'Mężczyzna' : 'Kobieta'}`, 20, y);
  y += 15;

  // Benchmarks (if available)
  if (benchmarks) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Porównanie z benchmarkami:', 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Średnia krajowa: ${formatCurrency(benchmarks.nationalAvgPension)}`, 20, y);
    y += 7;

    if (benchmarks.powiatAvgPension && benchmarks.powiatResolved) {
      doc.text(
        `Średnia w ${benchmarks.powiatResolved.name}: ${formatCurrency(benchmarks.powiatAvgPension)}`,
        20,
        y
      );
      y += 7;
    }

    const percentOfNational =
      (result.monthlyPensionRealToday / benchmarks.nationalAvgPension) * 100;
    doc.text(`Twoja emerytura: ${percentOfNational.toFixed(1)}% średniej krajowej`, 20, y);
    y += 15;
  }

  // Assumptions
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Założenia:', 20, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rodzaj dostawcy: ${result.assumptions.providerKind}`, 20, y);
  y += 7;
  doc.text(`Waloryzacja roczna: ${result.assumptions.annualValorizationSetId}`, 20, y);
  y += 7;
  doc.text(`Waloryzacja kwartalna: ${result.assumptions.quarterlySetId}`, 20, y);
  y += 7;
  doc.text(`Tabela SDŻ: ${result.assumptions.sdżTableId}`, 20, y);
  y += 7;
  doc.text(`Wersja CPI: ${result.assumptions.cpiVintage}`, 20, y);
  y += 7;
  doc.text(`Wersja płac: ${result.assumptions.wageVintage}`, 20, y);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`ZUS Retirement Simulator - HackYeah 2025 | Strona ${i} z ${pageCount}`, 105, 290, {
      align: 'center',
    });
  }

  // Save PDF
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`emerytura-symulacja-${timestamp}.pdf`);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
