import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResendClient(): Resend {
  if (resendInstance) return resendInstance;

  // Multi-environment API key retrieval (Vercel Node environment vs Supabase Edge Deno environment)
  const apiKey = (typeof process !== 'undefined' && process.env?.RESEND_API_KEY)
    || (globalThis as any).Deno?.env?.get?.('RESEND_API_KEY')
    || (import.meta as any).env?.VITE_RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[Solisys Email] RESEND_API_KEY is missing. Utilizing Mock Resend Client for offline operations.');
    return {
      emails: {
        send: async (payload: unknown) => {
          console.log('[Solisys Email MOCK SEND SUCCESS]', JSON.stringify(payload, null, 2));
          return { data: { id: 'mock_' + Math.random().toString(36).substr(2, 9) }, error: null };
        }
      }
    } as unknown as Resend;
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}
