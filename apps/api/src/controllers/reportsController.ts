import { Request, Response, NextFunction } from 'express';
import { generatePdfReport, generateXlsReport } from '../services/reportsService';
import { ReportPayloadSchema } from '@zus/types';
import { logger } from '../utils/logger';

export const reportsController = {
  /**
   * Generate PDF report
   * POST /api/reports/pdf
   */
  generatePdf: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      const payload = ReportPayloadSchema.parse(req.body);

      // Generate PDF
      const pdfBuffer = await generatePdfReport(payload);

      // Set response headers
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `emerytura-symulacja-${timestamp}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF
      res.send(pdfBuffer);

      logger.info(`PDF generated successfully: ${filename}`);
    } catch (error) {
      logger.error(
        `PDF generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
      next(error);
    }
  },

  /**
   * Generate XLS report
   * POST /api/reports/xls
   */
  generateXls: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      const payload = ReportPayloadSchema.parse(req.body);

      // Generate XLS
      const xlsBuffer = await generateXlsReport(payload);

      // Set response headers
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `emerytura-symulacja-${timestamp}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', xlsBuffer.length);

      // Send XLS
      res.send(xlsBuffer);

      logger.info(`XLS generated successfully: ${filename}`);
    } catch (error) {
      logger.error(
        `XLS generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
      next(error);
    }
  },

  /**
   * Placeholder for other report endpoints
   */
  getReports: (req: Request, res: Response) => {
    res.status(200).json({ message: 'Reports endpoint placeholder' });
  },
};
