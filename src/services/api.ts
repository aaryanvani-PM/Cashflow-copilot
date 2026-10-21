import { ParsedTransactionResult } from '../types';

let cachedToken: string | null = null;

export async function getAuthToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }

  const stored = localStorage.getItem('copilot_jwt_token');
  if (stored) {
    cachedToken = stored;
    return stored;
  }

  try {
    const res = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Auth request failed: ${res.statusText}`);
    }
    const data = await res.json();
    cachedToken = data.token;
    localStorage.setItem('copilot_jwt_token', data.token);
    return data.token;
  } catch (err) {
    console.warn('Using client-side fallback JWT mock:', err);
    const mock = 'copilot_simulated_jwt_bearer_token';
    cachedToken = mock;
    return mock;
  }
}

export function resetAuthToken(): void {
  cachedToken = null;
  localStorage.removeItem('copilot_jwt_token');
}

export async function parseTransactionWithGemini(
  rawText: string,
  currencyHint: string = 'INR'
): Promise<{ success: boolean; data: ParsedTransactionResult; source: string }> {
  const token = await getAuthToken();

  const response = await fetch('/api/parse-transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rawText, currencyHint }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed with status ${response.status}`);
  }

  return response.json();
}

export async function checkServerHealth(): Promise<any> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: String(err) };
  }
}
