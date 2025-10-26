import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Create settings table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export const configStore = {
  // Get a setting by key
  get: (key) => {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key);
    return row ? JSON.parse(row.value) : null;
  },

  // Set a setting
  set: (key, value) => {
    const stmt = db.prepare(`
      INSERT INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET 
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(key, JSON.stringify(value));
  },

  // Delete a setting
  delete: (key) => {
    const stmt = db.prepare('DELETE FROM settings WHERE key = ?');
    stmt.run(key);
  },

  // Get all settings
  getAll: () => {
    const stmt = db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all();
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = JSON.parse(row.value);
    });
    return settings;
  }
};

// GitHub configuration helpers
export const githubConfig = {
  get: () => {
    return configStore.get('github_config');
  },

  set: (config) => {
    configStore.set('github_config', config);
  },

  isConfigured: () => {
    const config = githubConfig.get();
    return config && config.token && config.owner && config.repo && config.branch;
  },

  getConfig: () => {
    const config = githubConfig.get();
    if (!config) {
      return null;
    }
    return {
      token: config.token,
      owner: config.owner,
      repo: config.repo,
      branch: config.branch || 'gh-pages',
      baseUrl: config.baseUrl || `https://${config.owner}.github.io/${config.repo}`
    };
  }
};

export default { configStore, githubConfig };


