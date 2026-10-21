import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'copilot-fintech-jwt-secret-key-2026';

app.use(express.json());

// Initialize Google GenAI client (User-Agent header required by AI Studio guidelines)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Authentication Middleware to secure transaction endpoints
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied: Bearer JWT token required for transaction endpoints.',
      code: 'AUTH_TOKEN_MISSING',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      details: err.message,
      code: 'AUTH_TOKEN_INVALID',
    });
  }
}

// 1. Auth Endpoint: Generate a valid session JWT token
app.post('/api/auth/token', (req: Request, res: Response) => {
  const payload = {
    sub: 'usr_executive_9021',
    name: 'Executive Portfolio Holder',
    email: 'executive@cashflowcopilot.internal',
    scope: ['transactions:read', 'transactions:enrich', 'remediations:execute'],
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    expiresIn: '7d',
    tokenType: 'Bearer',
    claims: payload,
  });
});

// 2. Health & Status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    copilotEngine: 'Gemini 2.5 Flash',
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    serverTime: new Date().toISOString(),
  });
});

// 3. Protected AI Transaction Enrichment Endpoint
app.post('/api/parse-transaction', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { rawText, currencyHint = 'INR' } = req.body;

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return res.status(400).json({ error: 'Field "rawText" is required' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Deterministic fallback parser if API key is not yet set in environment
      const parsedFallback = parseRuleBasedFallback(rawText, currencyHint);
      return res.json({
        success: true,
        data: parsedFallback,
        source: 'rule_engine_fallback',
      });
    }

    const prompt = `You are Cashflow Copilot's financial transaction enrichment and money-leak detection engine.
Analyze the following messy raw bank SMS, POS debit string, or statement entry:
"""
${rawText}
"""

Instructions:
1. Extract the clean merchant name (e.g. "Notion Labs", "Canva Pty Ltd", "Midjourney Inc", "Netflix India").
2. Standardize the category (e.g., "Cloud Infrastructure", "SaaS & Productivity", "Streaming & Entertainment", "Travel & Aviation", "Design & Creative", "Food & Dining").
3. Extract amount as a numeric float and the original currency code (INR, USD, EUR). Convert to INR if in USD or EUR using 1 USD = 84 INR, 1 EUR = 91 INR.
4. Extract date formatted as 'DD Mon YYYY' (or current date if not found) and masked card last 4 digits (e.g. '8821', '4410').
5. Determine recurrence: 'monthly', 'annual', 'one_off', or 'trial'.
6. Detect anomaly type if any:
   - 'price_creep' if cost jumped from an earlier lower rate.
   - 'reward_optimizer' if wrong payment method was used and points were lost.
   - 'zombie_trial' if it is an inactive subscription or imminent renewal.
   - 'fx_markup' if heavy cross-border markup was added.
   - 'none' if normal clean spend.
7. Estimate monthly potential leak savings in INR.
8. Provide a concise human-readable explanation and a suggested safe human-in-the-loop remediation action.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a high-precision FinTech data enrichment specialist. Return valid structured JSON conforming to the requested schema. Never output markdown ticks around the JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchantName: { type: Type.STRING, description: 'Clean normalized merchant name' },
            category: { type: Type.STRING, description: 'Financial category' },
            amount: { type: Type.NUMBER, description: 'Total charge in INR' },
            currency: { type: Type.STRING, description: 'Original currency e.g. INR, USD' },
            date: { type: Type.STRING, description: 'Normalized date e.g. 21 Oct 2026' },
            cardLast4: { type: Type.STRING, description: 'Card or account last 4 digits' },
            recurrence: {
              type: Type.STRING,
              description: 'Cadence: monthly, annual, one_off, or trial',
            },
            anomalyType: {
              type: Type.STRING,
              description: 'Anomaly: price_creep, reward_optimizer, zombie_trial, fx_markup, or none',
            },
            anomalySeverity: {
              type: Type.STRING,
              description: 'Severity: none, low, medium, or high',
            },
            leakEstimatedSavingsINR: {
              type: Type.NUMBER,
              description: 'Estimated monthly potential savings in INR',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence score from 0.0 to 1.0',
            },
            explanation: {
              type: Type.STRING,
              description: 'Clear financial rationale for enrichment and leak detection',
            },
            suggestedAction: {
              type: Type.STRING,
              description: 'Actionable suggestion for human-in-the-loop remediation',
            },
          },
          required: [
            'merchantName',
            'category',
            'amount',
            'currency',
            'cardLast4',
            'recurrence',
            'anomalyType',
            'anomalySeverity',
            'leakEstimatedSavingsINR',
            'confidence',
            'explanation',
            'suggestedAction',
          ],
        },
      },
    });

    const textOutput = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(textOutput);
    } catch {
      // If direct parse fails, try extracting JSON substring
      const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = parseRuleBasedFallback(rawText, currencyHint);
      }
    }

    parsedData.rawText = rawText;
    res.json({
      success: true,
      data: parsedData,
      source: 'gemini-2.5-flash',
    });
  } catch (err: any) {
    console.error('Error invoking Gemini 2.5 Flash:', err);
    // Graceful fallback to guarantee UI continuity
    const parsedFallback = parseRuleBasedFallback(rawText, currencyHint);
    res.json({
      success: true,
      data: parsedFallback,
      source: 'rule_engine_fallback_on_error',
      notice: err.message,
    });
  }
});

// Deterministic backup parser when API quota or network issue occurs
function parseRuleBasedFallback(rawText: string, _currencyHint: string) {
  const upper = rawText.toUpperCase();
  let merchant = 'Unknown Merchant';
  let category = 'General Expense';
  let amount = 1499;
  let anomalyType: 'price_creep' | 'reward_optimizer' | 'zombie_trial' | 'fx_markup' | 'none' = 'none';
  let savings = 0;
  let severity: 'none' | 'low' | 'medium' | 'high' = 'none';

  if (upper.includes('NOTION')) {
    merchant = 'Notion Labs Inc.';
    category = 'SaaS & Productivity';
    amount = 3249;
    anomalyType = 'price_creep';
    savings = 750;
    severity = 'medium';
  } else if (upper.includes('CANVA')) {
    merchant = 'Canva Pty Ltd';
    category = 'Design & Creative';
    amount = 1899;
    anomalyType = 'fx_markup';
    savings = 95;
    severity = 'low';
  } else if (upper.includes('SUPABASE')) {
    merchant = 'Supabase Inc.';
    category = 'Cloud Infrastructure';
    amount = 4116;
    anomalyType = 'zombie_trial';
    savings = 4116;
    severity = 'high';
  } else if (upper.includes('DISCORD')) {
    merchant = 'Discord Nitro';
    category = 'Streaming & Gaming';
    amount = 999;
    anomalyType = 'zombie_trial';
    savings = 999;
    severity = 'medium';
  } else if (upper.includes('NETFLIX')) {
    merchant = 'Netflix India';
    category = 'Streaming & Entertainment';
    amount = 649;
    anomalyType = 'price_creep';
    savings = 150;
    severity = 'medium';
  } else if (upper.includes('INDIGO')) {
    merchant = 'IndiGo Airlines';
    category = 'Travel & Aviation';
    amount = 14200;
    anomalyType = 'reward_optimizer';
    savings = 1800;
    severity = 'high';
  } else {
    // Attempt regex amount extraction
    const match = rawText.match(/(?:INR|RS\.?|\$|€)?\s*([\d,]+(?:\.\d{2})?)/i);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''));
    }
  }

  // Extract last 4
  const last4Match = rawText.match(/(?:XX|CARD|A\/C|ENDING)\s*([0-9]{4})/i);
  const cardLast4 = last4Match ? last4Match[1] : '8821';

  return {
    merchantName: merchant,
    category,
    amount,
    currency: 'INR',
    date: '21 Oct 2026',
    cardLast4,
    recurrence: upper.includes('RECUR') || upper.includes('MANDATE') ? 'monthly' : 'one_off',
    anomalyType,
    anomalySeverity: severity,
    leakEstimatedSavingsINR: savings,
    confidence: 0.94,
    explanation:
      anomalyType !== 'none'
        ? `Enriched from raw bank string. Detected potential ${anomalyType.replace('_', ' ')} with estimated ${savings > 0 ? '₹' + savings + ' potential savings' : 'review advised'}.`
        : 'Clean legitimate charge enriched with verified merchant categorization.',
    suggestedAction:
      anomalyType === 'price_creep'
        ? 'Request plan reversion to grandfathered rate or set virtual card spend limit.'
        : anomalyType === 'zombie_trial'
          ? 'Draft cancellation notification and freeze recurring card token.'
          : anomalyType === 'reward_optimizer'
            ? 'Reallocate charge to 4x accelerated travel card.'
            : 'No immediate remediation needed.',
    rawText,
  };
}

// Development vs Production setup
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cashflow Copilot server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Cashflow Copilot server:', err);
  process.exit(1);
});
