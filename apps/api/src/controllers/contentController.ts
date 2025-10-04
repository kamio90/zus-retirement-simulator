import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { resolveTokens } from '../utils/tokenResolver';

interface KnowledgeItem {
  id: string;
  step?: string;
  title: string;
  tone?: 'fun' | 'formal';
  short?: string;
  body: string;
  pose?: string;
  icon?: string;
  tokens?: string[];
  source: {
    title: string;
    url: string;
  };
  lang: string;
}

interface KnowledgeData {
  version: string;
  items: KnowledgeItem[];
}

interface ExplainerItem {
  id: string;
  targetId: string;
  title: string;
  body: string;
  source: {
    title: string;
    url: string;
  };
  relatedTips?: string[];
  lang: string;
}

interface ExplainerData {
  version: string;
  explainers: ExplainerItem[];
}

// Cache for loaded knowledge files
const knowledgeCache = new Map<string, KnowledgeData>();
const explainerCache = new Map<string, ExplainerData>();

// Load knowledge file with caching
function loadKnowledgeFile(lang: string): KnowledgeData | null {
  if (knowledgeCache.has(lang)) {
    return knowledgeCache.get(lang)!;
  }

  const filePath = path.join(process.cwd(), 'content', `knowledge.${lang}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent) as KnowledgeData;
    knowledgeCache.set(lang, data);
    return data;
  } catch (error) {
    console.error(`Error loading knowledge file for ${lang}:`, error);
    return null;
  }
}

// Load explainer file with caching
function loadExplainerFile(lang: string): ExplainerData | null {
  if (explainerCache.has(lang)) {
    return explainerCache.get(lang)!;
  }

  const filePath = path.join(process.cwd(), 'content', `explainers.${lang}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent) as ExplainerData;
    explainerCache.set(lang, data);
    return data;
  } catch (error) {
    console.error(`Error loading explainer file for ${lang}:`, error);
    return null;
  }
}

// Calculate ETag from content
function calculateETag(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

export const contentController = {
  getKnowledge: (req: Request, res: Response): void => {
    const { step, lang = 'pl-PL', tone, limit = 3 } = req.query;

    // Validate language
    const validLangs = ['pl-PL', 'en-GB'];
    const requestedLang = typeof lang === 'string' && validLangs.includes(lang) ? lang : 'pl-PL';

    // Note: tone parameter is now ignored - always returns friendly content
    // Kept for backwards compatibility with clients that still send it
    if (tone) {
      console.log(
        `[INFO] Tone parameter '${tone}' received but ignored - returning friendly content`
      );
    }

    // Validate limit
    const maxLimit = 10;
    const requestedLimit = Math.min(typeof limit === 'string' ? parseInt(limit, 10) : 3, maxLimit);

    // Load knowledge data
    let knowledgeData = loadKnowledgeFile(requestedLang);

    // Fallback to en-GB if requested language not available
    if (!knowledgeData && requestedLang !== 'en-GB') {
      knowledgeData = loadKnowledgeFile('en-GB');
    }

    if (!knowledgeData) {
      res.status(404).json({
        code: 'KNOWLEDGE_NOT_FOUND',
        message: `Knowledge file not found for language: ${requestedLang}`,
      });
      return;
    }

    // Filter by step if provided
    let items = knowledgeData.items;
    if (step && typeof step === 'string') {
      items = items.filter((item) => item.step === step);
    }

    // No tone filtering - return friendly content by default

    // Limit results
    items = items.slice(0, requestedLimit);

    // Resolve tokens in items
    items = items.map((item) => ({
      ...item,
      body: resolveTokens(item.body),
      short: item.short ? resolveTokens(item.short) : item.short,
    }));

    // Prepare response
    const response = {
      version: knowledgeData.version,
      items,
    };

    const responseBody = JSON.stringify(response);
    const etag = calculateETag(responseBody);

    // Check if client has cached version
    const clientETag = req.headers['if-none-match'];
    if (clientETag === etag) {
      res.status(304).end();
      return;
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('ETag', etag);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Content-Tone', 'friendly'); // Indicate tone used

    res.json(response);
  },

  getExplainers: (req: Request, res: Response): void => {
    const { targetId, lang = 'pl-PL' } = req.query;

    // Validate language
    const validLangs = ['pl-PL', 'en-GB'];
    const requestedLang = typeof lang === 'string' && validLangs.includes(lang) ? lang : 'pl-PL';

    // Load explainer data
    let explainerData = loadExplainerFile(requestedLang);

    // Fallback to en-GB if requested language not available
    if (!explainerData && requestedLang !== 'en-GB') {
      explainerData = loadExplainerFile('en-GB');
    }

    if (!explainerData) {
      res.status(404).json({
        code: 'EXPLAINERS_NOT_FOUND',
        message: `Explainer file not found for language: ${requestedLang}`,
      });
      return;
    }

    // Filter by targetId if provided
    let explainers = explainerData.explainers;
    if (targetId && typeof targetId === 'string') {
      const explainer = explainers.find((item) => item.targetId === targetId);
      if (!explainer) {
        res.status(404).json({
          code: 'EXPLAINER_NOT_FOUND',
          message: `Explainer not found for targetId: ${targetId}`,
        });
        return;
      }
      explainers = [explainer];
    }

    // Resolve tokens in items
    explainers = explainers.map((item) => ({
      ...item,
      body: resolveTokens(item.body),
    }));

    // Prepare response
    const response = {
      version: explainerData.version,
      explainer: explainers[0], // Return single explainer for specific targetId
      explainers: targetId ? undefined : explainers, // Return all if no targetId
    };

    const responseBody = JSON.stringify(response);
    const etag = calculateETag(responseBody);

    // Check if client has cached version
    const clientETag = req.headers['if-none-match'];
    if (clientETag === etag) {
      res.status(304).end();
      return;
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('ETag', etag);
    res.setHeader('Content-Type', 'application/json');

    res.json(response);
  },
};
