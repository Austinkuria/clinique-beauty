import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cache from './cacheService.js';
import { supabase } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'system_settings.json');

const DEFAULT_SETTINGS = {
  site_title: 'Clinique Beauty',
  site_currency: 'KES',
  flash_sale_active: 'true',
  flash_sale_ends_at: null,
  theme_mode: 'light',
  theme_variant: 'pink',
  enable_animations: true,
  compact_sidebar: false,
  standard_shipping_fee: 0,
  express_shipping_fee: 1299,
  overnight_shipping_fee: 2499,
  vat_percentage: 16,
  mpesa_paybill: '174379',
  mpesa_consumer_key: '',
  stripe_publishable_key: 'pk_test_sample',
  mailchimp_api_key: 'mc_sample'
};

class SettingsService {
  constructor() {
    this._ensureDataDir();
  }

  _ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(SETTINGS_FILE)) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
      }
    } catch (err) {
      console.warn('[SettingsService] Could not initialize settings file directory:', err.message);
    }
  }

  async getSettings() {
    const cacheKey = 'system:settings:all';
    const cached = await cache.get(cacheKey);
    if (cached && typeof cached === 'object') {
      return cached;
    }

    let loadedSettings = { ...DEFAULT_SETTINGS };

    // 1. Read from persistent local file
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const fileContent = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        loadedSettings = { ...loadedSettings, ...parsed };
      }
    } catch (readErr) {
      console.warn('[SettingsService] Failed to read file settings:', readErr.message);
    }

    // 2. Try Supabase system_settings table if accessible
    if (supabase) {
      try {
        const { data, error } = await supabase.from('system_settings').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          data.forEach(item => {
            try {
              loadedSettings[item.key] = JSON.parse(item.value);
            } catch {
              loadedSettings[item.key] = item.value;
            }
          });
        }
      } catch (dbErr) {
        // Table does not exist in schema cache; silent fallback
      }
    }

    // Cache settings
    await cache.set(cacheKey, loadedSettings, 300);
    return loadedSettings;
  }

  async updateSettings(newSettings, io = null) {
    const current = await this.getSettings();
    const merged = { ...current, ...newSettings };

    // 1. Persist to local disk
    try {
      this._ensureDataDir();
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (writeErr) {
      console.error('[SettingsService] Failed writing settings to disk:', writeErr.message);
    }

    // 2. Persist to Supabase if system_settings table exists
    if (supabase) {
      try {
        for (const [key, value] of Object.entries(newSettings)) {
          const stringVal = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
          await supabase.from('system_settings').upsert({
            key,
            value: stringVal,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        }
      } catch {
        // Silent fallback
      }
    }

    // 3. Update Redis/In-memory Cache
    const cacheKey = 'system:settings:all';
    await cache.set(cacheKey, merged, 300);

    // 4. Broadcast real-time change to all connected clients
    if (io) {
      io.emit('admin:settings_updated', merged);
    }

    return merged;
  }

  async resetSettings(io = null) {
    const fresh = { ...DEFAULT_SETTINGS };

    // 1. Save defaults to disk
    try {
      this._ensureDataDir();
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(fresh, null, 2), 'utf-8');
    } catch (writeErr) {
      console.error('[SettingsService] Failed writing reset settings to disk:', writeErr.message);
    }

    // 2. Invalidate and update cache
    const cacheKey = 'system:settings:all';
    await cache.set(cacheKey, fresh, 300);

    // 3. Broadcast real-time event
    if (io) {
      io.emit('admin:settings_updated', fresh);
    }

    return fresh;
  }
}

export default new SettingsService();
