import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { groupOperations, pageOperations } from './database.js';
import { 
  uploadToGitHub, 
  deleteFromGitHub, 
  listGitHubFiles, 
  renameInGitHub,
  validateGitHubConfig,
  testGitHubConfig
} from './github.js';
import { githubConfig } from './config-store.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GitHub configuration check
app.get('/api/github/status', async (req, res) => {
  try {
    const isValid = await validateGitHubConfig();
    const config = githubConfig.getConfig();
    res.json({ 
      configured: isValid,
      owner: config?.owner,
      repo: config?.repo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SETTINGS ENDPOINTS ============

// Get GitHub settings
app.get('/api/settings/github', (req, res) => {
  try {
    const config = githubConfig.getConfig();
    if (config) {
      // Don't send the token back for security
      res.json({
        configured: true,
        config: {
          owner: config.owner,
          repo: config.repo,
          branch: config.branch,
          baseUrl: config.baseUrl
        }
      });
    } else {
      res.json({ configured: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save GitHub settings
app.post('/api/settings/github', async (req, res) => {
  try {
    const { token, owner, repo, branch, baseUrl } = req.body;

    if (!token || !owner || !repo || !branch) {
      return res.status(400).json({ 
        error: 'Missing required fields: token, owner, repo, branch' 
      });
    }

    // Test the configuration first
    const testResult = await testGitHubConfig({ token, owner, repo });
    if (!testResult.success) {
      return res.status(400).json({ 
        error: `Invalid GitHub configuration: ${testResult.error}` 
      });
    }

    // Save configuration
    githubConfig.set({
      token,
      owner,
      repo,
      branch,
      baseUrl: baseUrl || `https://${owner}.github.io/${repo}`
    });

    res.json({ 
      success: true, 
      message: 'GitHub configuration saved successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test GitHub configuration
app.post('/api/settings/github/test', async (req, res) => {
  try {
    const { token, owner, repo } = req.body;

    if (!token || !owner || !repo) {
      return res.status(400).json({ 
        error: 'Missing required fields: token, owner, repo' 
      });
    }

    const result = await testGitHubConfig({ token, owner, repo });
    
    if (result.success) {
      res.json({ success: true, message: 'Connection successful' });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ GROUP ENDPOINTS ============

// Get all groups
app.get('/api/groups', (req, res) => {
  try {
    const groups = groupOperations.getAll.all();
    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create group
app.post('/api/groups', (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const result = groupOperations.create.run({
      name,
      description: description || null,
      color: color || '#3b82f6'
    });

    const newGroup = groupOperations.getById.get(result.lastInsertRowid);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update group
app.put('/api/groups/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    groupOperations.update.run({
      id: parseInt(id),
      name,
      description: description || null,
      color: color || '#3b82f6'
    });

    const updatedGroup = groupOperations.getById.get(id);
    res.json(updatedGroup);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete group
app.delete('/api/groups/:id', (req, res) => {
  try {
    const { id } = req.params;
    groupOperations.delete.run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ PAGE ENDPOINTS ============

// Get all pages
app.get('/api/pages', (req, res) => {
  try {
    const { group_id, search } = req.query;
    
    let pages;
    if (search) {
      pages = pageOperations.search.all({ query: `%${search}%` });
    } else if (group_id) {
      pages = pageOperations.getByGroup.all(group_id);
    } else {
      pages = pageOperations.getAll.all();
    }
    
    res.json(pages);
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single page
app.get('/api/pages/:id', (req, res) => {
  try {
    const { id } = req.params;
    const page = pageOperations.getById.get(id);
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create page and upload to GitHub
app.post('/api/pages', async (req, res) => {
  try {
    const { title, filename, html_content, group_id, preview_image } = req.body;
    
    if (!title || !filename || !html_content) {
      return res.status(400).json({ 
        error: 'Title, filename, and HTML content are required' 
      });
    }

    // Upload to GitHub
    let githubUrl = null;
    try {
      const githubResult = await uploadToGitHub(filename, html_content);
      githubUrl = githubResult.url;
    } catch (error) {
      console.error('GitHub upload failed:', error);
      // Continue even if GitHub upload fails
    }

    // Get max sort order
    const allPages = pageOperations.getAll.all();
    const maxSortOrder = allPages.length > 0 
      ? Math.max(...allPages.map(p => p.sort_order || 0)) 
      : 0;

    // Save to database
    const result = pageOperations.create.run({
      title,
      filename: filename.endsWith('.html') ? filename : `${filename}.html`,
      github_url: githubUrl,
      group_id: group_id || null,
      sort_order: maxSortOrder + 1,
      html_content,
      preview_image: preview_image || null
    });

    const newPage = pageOperations.getById.get(result.lastInsertRowid);
    res.status(201).json(newPage);
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update page
app.put('/api/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, filename, html_content, group_id, sort_order, preview_image } = req.body;

    const existingPage = pageOperations.getById.get(id);
    if (!existingPage) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // If filename changed, rename in GitHub
    let githubUrl = existingPage.github_url;
    if (filename && filename !== existingPage.filename) {
      try {
        const githubResult = await renameInGitHub(
          existingPage.filename, 
          filename, 
          html_content || existingPage.html_content
        );
        githubUrl = githubResult.url;
      } catch (error) {
        console.error('GitHub rename failed:', error);
      }
    } else if (html_content) {
      // Just update content
      try {
        const githubResult = await uploadToGitHub(
          existingPage.filename, 
          html_content
        );
        githubUrl = githubResult.url;
      } catch (error) {
        console.error('GitHub update failed:', error);
      }
    }

    // Update database
    pageOperations.update.run({
      id: parseInt(id),
      title: title || existingPage.title,
      filename: filename || existingPage.filename,
      github_url: githubUrl,
      group_id: group_id !== undefined ? group_id : existingPage.group_id,
      sort_order: sort_order !== undefined ? sort_order : existingPage.sort_order,
      html_content: html_content || existingPage.html_content,
      preview_image: preview_image !== undefined ? preview_image : existingPage.preview_image
    });

    const updatedPage = pageOperations.getById.get(id);
    res.json(updatedPage);
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update multiple pages sort order
app.post('/api/pages/reorder', (req, res) => {
  try {
    const { pages } = req.body; // Array of { id, sort_order }
    
    if (!Array.isArray(pages)) {
      return res.status(400).json({ error: 'Pages array is required' });
    }

    pages.forEach(({ id, sort_order }) => {
      pageOperations.updateSortOrder.run({ id, sort_order });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Reorder pages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete page
app.delete('/api/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const page = pageOperations.getById.get(id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Delete from GitHub
    if (page.filename) {
      try {
        await deleteFromGitHub(page.filename);
      } catch (error) {
        console.error('GitHub delete failed:', error);
        // Continue even if GitHub delete fails
      }
    }

    // Delete from database
    pageOperations.delete.run(id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List files from GitHub
app.get('/api/github/files', async (req, res) => {
  try {
    const files = await listGitHubFiles();
    res.json(files);
  } catch (error) {
    console.error('List GitHub files error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

