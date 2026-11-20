// server/services/cacheService.js
import Redis from 'ioredis';

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.redisClient = null;
    this.isRedisReady = false;
    this.redisAttempted = false;

    this.initRedis();
  }

  initRedis() {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;

    if (!redisUrl && !redisHost) {
      console.log('[CacheService] No Redis configuration found. Using in-memory cache.');
      return;
    }

    try {
      this.redisAttempted = true;
      const options = {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('[CacheService] Redis retry limit reached. Falling back to in-memory cache.');
            return null; // Stop retrying
          }
          return Math.min(times * 200, 1000);
        },
        enableOfflineQueue: false,
        connectTimeout: 2000
      };

      this.redisClient = redisUrl ? new Redis(redisUrl, options) : new Redis({ host: redisHost, port: process.env.REDIS_PORT || 6379, ...options });

      this.redisClient.on('connect', () => {
        this.isRedisReady = true;
        console.log('[CacheService] Connected to Redis successfully.');
      });

      this.redisClient.on('error', (err) => {
        this.isRedisReady = false;
        console.warn(`[CacheService] Redis notice (${err.message}). Active mode: In-Memory.`);
      });

      this.redisClient.on('close', () => {
        this.isRedisReady = false;
      });
    } catch (err) {
      this.isRedisReady = false;
      console.warn('[CacheService] Failed to initialise Redis client. Falling back to in-memory cache:', err.message);
    }
  }

  async get(key) {
    if (this.isRedisReady && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw !== null) {
          return JSON.parse(raw);
        }
        return null;
      } catch (err) {
        console.warn(`[CacheService] Redis GET error for "${key}". Falling back to memory:`, err.message);
      }
    }

    // In-Memory Fallback
    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key, value, ttlSeconds = 60) {
    const serialized = JSON.stringify(value);

    if (this.isRedisReady && this.redisClient) {
      try {
        if (ttlSeconds > 0) {
          await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(key, serialized);
        }
        return true;
      } catch (err) {
        console.warn(`[CacheService] Redis SET error for "${key}":`, err.message);
      }
    }

    // In-Memory Fallback
    const expiresAt = ttlSeconds > 0 ? Date.now() + (ttlSeconds * 1000) : null;
    this.memoryCache.set(key, { value, expiresAt });

    // Periodic cleanup guard if map grows too large
    if (this.memoryCache.size > 2000) {
      this.cleanExpiredMemoryKeys();
    }

    return true;
  }

  async del(key) {
    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {
        console.warn(`[CacheService] Redis DEL error for "${key}":`, err.message);
      }
    }
    this.memoryCache.delete(key);
    return true;
  }

  async delPattern(pattern) {
    // pattern e.g. "admin:users*"
    if (this.isRedisReady && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (err) {
        console.warn(`[CacheService] Redis delPattern error for "${pattern}":`, err.message);
      }
    }

    // In-memory pattern deletion
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    return true;
  }

  async flush() {
    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch (err) {
        console.warn('[CacheService] Redis flush error:', err.message);
      }
    }
    this.memoryCache.clear();
    return true;
  }

  cleanExpiredMemoryKeys() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }

  getStatus() {
    return {
      type: this.isRedisReady ? 'redis' : 'memory',
      isRedisConnected: this.isRedisReady,
      memoryKeysCount: this.memoryCache.size
    };
  }
}

export const cache = new CacheService();
export default cache;
