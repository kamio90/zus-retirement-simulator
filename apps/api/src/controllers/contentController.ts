import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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

// Cache for loaded knowledge files
const knowledgeCache = new Map<string, KnowledgeData>();

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

    // Validate tone
    const validTones = ['fun', 'formal'];
    const requestedTone = typeof tone === 'string' && validTones.includes(tone) ? tone : undefined;

    // Validate limit
    const maxLimit = 10;
    const requestedLimit = Math.min(
      typeof limit === 'string' ? parseInt(limit, 10) : 3,
      maxLimit
    );

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
      items = items.filter(item => item.step === step);
    }

    // Filter by tone if provided
    if (requestedTone) {
      items = items.filter(item => !item.tone || item.tone === requestedTone);
    }

    // Limit results
    items = items.slice(0, requestedLimit);

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

    res.json(response);
  },
};
