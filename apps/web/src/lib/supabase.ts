/**
 * Solisys v2.0 — Supabase Client Mock / Offline Fallback
 * src/lib/supabase.ts
 *
 * Designed to provide full offline-first functionality, mock auth triggers,
 * and CRUD operations mapped directly to LocalStorage keys as an offline fallback
 * before a physical Supabase project is connected in Phase 2.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key-12345';

console.log('[Solisys Supabase Client] Initialized with credentials:', {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY.substring(0, 8) + '...',
  mode: 'Offline-First Mock Fallback'
});

export interface User {
  id: string;
  email: string;
  isGuest: boolean;
  createdAt: string;
}

export interface Session {
  user: User | null;
  access_token: string;
  expires_in: number;
}

class MockAuth {
  private listeners: ((event: string, session: Session | null) => void)[] = [];
  private currentSession: Session | null = null;

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    try {
      const stored = localStorage.getItem('solisys-auth-session');
      if (stored) {
        this.currentSession = JSON.parse(stored);
      } else {
        // Default to a local guest session if none exists
        this.setGuestSession();
      }
    } catch {
      this.setGuestSession();
    }
  }

  private setGuestSession() {
    this.currentSession = {
      user: {
        id: 'guest-user-local',
        email: 'guest@solisys.local',
        isGuest: true,
        createdAt: new Date().toISOString(),
      },
      access_token: 'mock-guest-token-123',
      expires_in: 3600 * 24 * 365, // 1 year
    };
  }

  async getSession() {
    return { data: { session: this.currentSession }, error: null };
  }

  async getUser() {
    return { data: { user: this.currentSession?.user || null }, error: null };
  }

  async signInWithOtp(params: { email: string; options?: { shouldCreateUser?: boolean } }) {
    console.log(`[Mock Auth] Sending Magic Link OTP to: ${params.email}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      data: { user: null, session: null },
      error: null,
      message: 'Mock magic link sent successfully! (Check developer console)'
    };
  }

  async verifyOtp(params: { email: string; token: string; type: 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email' }) {
    console.log(`[Mock Auth] Verifying OTP ${params.token} for ${params.email}`);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (params.token === '123456' || params.token === '000000') {
      const newSession: Session = {
        user: {
          id: 'user-' + Math.random().toString(36).substring(2, 9),
          email: params.email,
          isGuest: false,
          createdAt: new Date().toISOString(),
        },
        access_token: 'mock-jwt-token-' + Date.now(),
        expires_in: 3600,
      };

      this.currentSession = newSession;
      localStorage.setItem('solisys-auth-session', JSON.stringify(newSession));
      this.triggerListeners('SIGNED_IN', newSession);

      return { data: { session: newSession, user: newSession.user }, error: null };
    }

    return {
      data: { session: null, user: null },
      error: { message: 'Invalid OTP code. Try using "123456" as a mock bypass code.' }
    };
  }

  async signInAnonymously() {
    console.log('[Mock Auth] Initiating guest login mode...');
    await new Promise(resolve => setTimeout(resolve, 400));
    this.setGuestSession();
    localStorage.setItem('solisys-auth-session', JSON.stringify(this.currentSession));
    this.triggerListeners('SIGNED_IN', this.currentSession);
    return { data: { session: this.currentSession, user: this.currentSession?.user }, error: null };
  }

  async signOut() {
    console.log('[Mock Auth] Signing out user...');
    this.currentSession = null;
    localStorage.removeItem('solisys-auth-session');
    this.setGuestSession(); // Re-establish guest fallback
    this.triggerListeners('SIGNED_OUT', null);
    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    this.listeners.push(callback);
    // Immediately fire with current state
    callback('INITIAL_SESSION', this.currentSession);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private triggerListeners(event: string, session: Session | null) {
    this.listeners.forEach(l => l(event, session));
  }
}

class MockQueryBuilder {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private getItems(): any[] {
    const key = this.tableName === 'projects' ? 'solarProjects' : `solisys_${this.tableName}`;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveItems(items: any[]) {
    const key = this.tableName === 'projects' ? 'solarProjects' : `solisys_${this.tableName}`;
    localStorage.setItem(key, JSON.stringify(items));
  }

  async select(columns = '*') {
    // Artificial latency to match cloud environment
    await new Promise(resolve => setTimeout(resolve, 200));
    const items = this.getItems();
    return { data: items, error: null };
  }

  async insert(item: any) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const items = this.getItems();
    const newItem = {
      ...item,
      id: item.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      createdAt: item.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    items.push(newItem);
    this.saveItems(items);
    return { data: [newItem], error: null };
  }

  async update(changes: any) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return {
      eq: (key: string, value: any) => {
        const items = this.getItems();
        let updatedItem: any = null;
        const nextItems = items.map(item => {
          if (item[key] === value) {
            updatedItem = { ...item, ...changes, lastUpdated: new Date().toISOString() };
            return updatedItem;
          }
          return item;
        });
        this.saveItems(nextItems);
        return Promise.resolve({ data: updatedItem ? [updatedItem] : [], error: null });
      }
    };
  }

  async delete() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      eq: (key: string, value: any) => {
        const items = this.getItems();
        const nextItems = items.filter(item => item[key] !== value);
        this.saveItems(nextItems);
        return Promise.resolve({ data: null, error: null });
      }
    };
  }
}

export const supabase = {
  auth: new MockAuth(),
  from: (table: string) => new MockQueryBuilder(table),
};

export function createClient(url: string, key: string) {
  return supabase;
}
