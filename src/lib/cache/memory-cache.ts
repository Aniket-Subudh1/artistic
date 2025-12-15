interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class MemoryCache {
  private static instance: MemoryCache;
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number = 50; 
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.cache = new Map();
    
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.clearExpired(), 3 * 60 * 1000);
    }
  }

  static getInstance(): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache();
    }
    return MemoryCache.instance;
  }


  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    // Implement LRU - remove oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttlMinutes * 60 * 1000,
    });
  }

 
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Check if data has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }


  private clearExpired(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      console.log(`[Cache] Cleared ${expiredCount} expired entries`);
    }
  }

  getSize(): number {
    return this.cache.size;
  }

  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      maxSize: this.maxSize,
      utilization: ((this.cache.size / this.maxSize) * 100).toFixed(1) + '%',
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

export const memoryCache = MemoryCache.getInstance();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    memoryCache.destroy();
  });
}
