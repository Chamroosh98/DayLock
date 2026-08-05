export interface PasteMetadata {
  id: string;
  createdAt: number; // Unix timestamp in seconds
  expiresAt: number; // Unix timestamp in seconds (0 or Infinity if never)
  kind?: string;
  title?: string;
  burnAfterRead?: boolean;
}

const LOCAL_STORAGE_KEY = 'dlock_pastes_metadata';

// Initial sample data if local storage is fresh
const SAMPLE_PASTES: PasteMetadata[] = [
  {
    id: 'sample-1',
    createdAt: Math.floor(Date.now() / 1000) - 3600,
    expiresAt: Math.floor(Date.now() / 1000) + 7200, // Expires in 2h (< 24h)
    kind: 'text',
    title: 'Encrypted Config',
  },
  {
    id: 'sample-2',
    createdAt: Math.floor(Date.now() / 1000) - 1800,
    expiresAt: Math.floor(Date.now() / 1000) + 14400, // Expires in 4h (< 24h)
    kind: 'text',
    title: 'Secret Keys Backup',
  },
  {
    id: 'sample-3',
    createdAt: Math.floor(Date.now() / 1000) - 86400,
    expiresAt: Math.floor(Date.now() / 1000) + 172800, // Expires in 2 days (< 7d)
    kind: 'file',
    title: 'Encrypted Archive.zip',
  },
  {
    id: 'sample-4',
    createdAt: Math.floor(Date.now() / 1000) - 172800,
    expiresAt: Math.floor(Date.now() / 1000) + 432000, // Expires in 5 days (< 7d)
    kind: 'stego',
    title: 'Stego Image Payload',
  },
  {
    id: 'sample-5',
    createdAt: Math.floor(Date.now() / 1000) - 259200,
    expiresAt: Math.floor(Date.now() / 1000) + 1209600, // Expires in 14 days (< 30d)
    kind: 'voice',
    title: 'Voice Note Dispatch',
  },
  {
    id: 'sample-6',
    createdAt: Math.floor(Date.now() / 1000) - 432000,
    expiresAt: Math.floor(Date.now() / 1000) + 2160000, // Expires in 25 days (< 30d)
    kind: 'e2e',
    title: 'Secure Channel Message',
  },
];

export const getStoredPastes = (): PasteMetadata[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      // Seed initial sample pastes
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_PASTES));
      return SAMPLE_PASTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to parse paste storage', e);
    return SAMPLE_PASTES;
  }
};

export const savePasteMetadata = (paste: PasteMetadata): void => {
  try {
    const pastes = getStoredPastes();
    // Prepend new paste and limit list to 100
    const updated = [paste, ...pastes.filter((p) => p.id !== paste.id)].slice(0, 100);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save paste metadata', e);
  }
};

export const purgeExpiredPastes = (): { purgedCount: number; remainingCount: number } => {
  try {
    const pastes = getStoredPastes();
    const now = Math.floor(Date.now() / 1000);
    
    // Keep pastes that are not expired (expiresAt === 0 or expiresAt > now)
    const validPastes = pastes.filter((p) => !p.expiresAt || p.expiresAt > now);
    const purgedCount = pastes.length - validPastes.length;

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validPastes));
    return { purgedCount, remainingCount: validPastes.length };
  } catch (e) {
    console.error('Failed to purge expired pastes', e);
    return { purgedCount: 0, remainingCount: 0 };
  }
};

export interface ExpiryMetrics {
  next24h: number;
  next7d: number;
  next30d: number;
  totalActive: number;
}

export const getPasteExpiryMetrics = (): ExpiryMetrics => {
  const pastes = getStoredPastes();
  const now = Math.floor(Date.now() / 1000);

  let next24h = 0;
  let next7d = 0;
  let next30d = 0;
  let totalActive = 0;

  pastes.forEach((p) => {
    if (!p.expiresAt) return;
    const diff = p.expiresAt - now;

    if (diff > 0) {
      totalActive++;
      if (diff <= 86400) {
        next24h++;
      }
      if (diff <= 86400 * 7) {
        next7d++;
      }
      if (diff <= 86400 * 30) {
        next30d++;
      }
    }
  });

  return { next24h, next7d, next30d, totalActive };
};
