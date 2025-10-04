import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Track IPs that have been warned (simple in-memory cache for 24h)
const warnedIPs = new Map<string, number>();
const WARN_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Cleanup old entries periodically
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, timestamp] of warnedIPs.entries()) {
      if (now - timestamp > WARN_DURATION) {
        warnedIPs.delete(ip);
      }
    }
  },
  60 * 60 * 1000
); // Clean up every hour

export const v1DeprecationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const path = req.path;

  // Check if this is a v1 API route
  if (path.startsWith('/v1/') || path === '/v1') {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';

    // Log warning once per IP per 24h
    if (!warnedIPs.has(clientIP)) {
      logger.info(
        `[WARN] API v1 deprecated request: path=${path} ip=${clientIP} deprecated.v1=true`
      );
      warnedIPs.set(clientIP, Date.now());
    }

    // Set deprecation headers
    res.setHeader('Deprecation', 'version="1" date="2025-10-04"');
    res.setHeader('Link', '</api/v2>; rel="successor-version"');

    // Return 410 Gone
    res.status(410).json({
      code: 'API_V1_DEPRECATED',
      message: 'API v1 is deprecated. Please migrate to /api/v2/*.',
      migrateTo: '/api/v2/*',
    });
    return;
  }

  next();
};
