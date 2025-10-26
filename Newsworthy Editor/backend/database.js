import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initDatabase() {
  // Create groups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT DEFAULT '#3b82f6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create pages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      filename TEXT NOT NULL UNIQUE,
      github_url TEXT,
      group_id INTEGER,
      sort_order INTEGER DEFAULT 0,
      html_content TEXT NOT NULL,
      preview_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
    )
  `);

  // Create index for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_pages_group_id ON pages(group_id);
    CREATE INDEX IF NOT EXISTS idx_pages_sort_order ON pages(sort_order);
  `);

  console.log('✅ Database initialized successfully');
}

// Initialize on module load
initDatabase();

// Group operations
export const groupOperations = {
  create: db.prepare(`
    INSERT INTO groups (name, description, color)
    VALUES (@name, @description, @color)
  `),
  
  getAll: db.prepare(`
    SELECT g.*, COUNT(p.id) as page_count
    FROM groups g
    LEFT JOIN pages p ON g.id = p.group_id
    GROUP BY g.id
    ORDER BY g.name
  `),
  
  getById: db.prepare(`
    SELECT * FROM groups WHERE id = ?
  `),
  
  update: db.prepare(`
    UPDATE groups 
    SET name = @name, description = @description, color = @color, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `),
  
  delete: db.prepare(`
    DELETE FROM groups WHERE id = ?
  `)
};

// Page operations
export const pageOperations = {
  create: db.prepare(`
    INSERT INTO pages (title, filename, github_url, group_id, sort_order, html_content, preview_image)
    VALUES (@title, @filename, @github_url, @group_id, @sort_order, @html_content, @preview_image)
  `),
  
  getAll: db.prepare(`
    SELECT p.*, g.name as group_name, g.color as group_color
    FROM pages p
    LEFT JOIN groups g ON p.group_id = g.id
    ORDER BY p.sort_order ASC, p.created_at DESC
  `),
  
  getById: db.prepare(`
    SELECT p.*, g.name as group_name
    FROM pages p
    LEFT JOIN groups g ON p.group_id = g.id
    WHERE p.id = ?
  `),
  
  getByGroup: db.prepare(`
    SELECT * FROM pages
    WHERE group_id = ?
    ORDER BY sort_order ASC, created_at DESC
  `),
  
  update: db.prepare(`
    UPDATE pages
    SET title = @title, filename = @filename, github_url = @github_url, 
        group_id = @group_id, sort_order = @sort_order, 
        html_content = @html_content, preview_image = @preview_image,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `),
  
  updateSortOrder: db.prepare(`
    UPDATE pages SET sort_order = @sort_order, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `),
  
  delete: db.prepare(`
    DELETE FROM pages WHERE id = ?
  `),
  
  search: db.prepare(`
    SELECT p.*, g.name as group_name
    FROM pages p
    LEFT JOIN groups g ON p.group_id = g.id
    WHERE p.title LIKE @query OR p.filename LIKE @query
    ORDER BY p.updated_at DESC
  `)
};

export default db;

