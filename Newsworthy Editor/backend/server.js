import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { groupOperations, pageOperations, groupsJsonOperations } from './database.js';
import { 
  uploadToGitHub, 
  deleteFromGitHub, 
  listGitHubFiles, 
  renameInGitHub,
  validateGitHubConfig,
  testGitHubConfig,
  getFileFromGitHub,
  syncWithGitHub,
  getAllFilesFromGitHub,
  pullAllFromGitHub,
  uploadGroupsJson,
  downloadGroupsJson
} from './github.js';
import { githubConfig } from './config-store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============ HELPER FUNCTIONS ============

async function syncGroupsToGitHub() {
  try {
    const config = githubConfig.getConfig();
    if (!config || !config.token) {
      console.log('⚠️  GitHub not configured, skipping groups sync');
      return;
    }

    const jsonString = groupsJsonOperations.exportToJsonString();
    await uploadGroupsJson(jsonString);
    console.log('✅ Groups synced to GitHub');
  } catch (error) {
    console.error('❌ Failed to sync groups to GitHub:', error.message);
    throw error;
  }
}

async function pullGroupsFromGitHub() {
  try {
    const result = await downloadGroupsJson();
    
    if (!result.success) {
      if (result.notFound) {
        console.log('ℹ️  No groups.json found on GitHub');
        return { success: true, message: 'No groups found', stats: null };
      }
      throw new Error(result.message || 'Failed to download groups');
    }

    const stats = groupsJsonOperations.importFromJson(result.data);
    console.log('✅ Groups pulled from GitHub:', stats);
    
    return { success: true, stats };
  } catch (error) {
    console.error('❌ Failed to pull groups from GitHub:', error.message);
    throw error;
  }
}

async function smartSyncGroups() {
  try {
    const config = githubConfig.getConfig();
    if (!config || !config.token) {
      throw new Error('GitHub not configured');
    }

    console.log('🔄 Starting smart sync...');

    const localJson = groupsJsonOperations.exportToJson();
    console.log(`📤 Local groups: ${localJson.groups.length} groups`);

    let githubJson = null;
    let hasGitHubJson = false;
    
    try {
      const result = await downloadGroupsJson();
      if (result.success && result.data) {
        githubJson = result.data;
        hasGitHubJson = true;
        console.log(`📥 GitHub groups: ${githubJson.groups.length} groups`);
      }
    } catch (error) {
      console.log('ℹ️  No groups.json on GitHub yet, will create new one');
      githubJson = { version: '1.0', groups: [] };
    }

    const mergedGroups = new Map();
    
    for (const group of localJson.groups) {
      mergedGroups.set(group.name, {
        ...group,
        source: 'local'
      });
    }
    
    if (hasGitHubJson && githubJson.groups) {
      for (const group of githubJson.groups) {
        if (!mergedGroups.has(group.name)) {
          mergedGroups.set(group.name, {
            ...group,
            source: 'github'
          });
        }
      }
    }

    const mergedJson = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      groups: Array.from(mergedGroups.values()).map(({ source, ...group }) => group)
    };
    
    console.log(`🔀 Merged result: ${mergedJson.groups.length} groups`);

    const needsUpload = !hasGitHubJson || 
      JSON.stringify(sortGroupsJson(githubJson)) !== JSON.stringify(sortGroupsJson(mergedJson));

    if (!needsUpload) {
      console.log('✅ No changes detected, skipping upload');
      return {
        success: true,
        action: 'no_change',
        message: 'Groups are already in sync',
        stats: {
          local: localJson.groups.length,
          github: githubJson?.groups?.length || 0,
          merged: mergedJson.groups.length
        }
      };
    }

    // Step 5: Upload merged JSON to GitHub
    console.log('📤 Changes detected, uploading to GitHub...');
    const mergedJsonString = JSON.stringify(mergedJson, null, 2);
    await uploadGroupsJson(mergedJsonString);
    
    // Step 6: Import merged data back to local database to keep everything in sync
    const importStats = groupsJsonOperations.importFromJson(mergedJson);
    
    console.log('✅ Smart sync completed successfully');
    
    return {
      success: true,
      action: 'synced',
      message: 'Groups synced successfully',
      stats: {
        local: localJson.groups.length,
        github: githubJson?.groups?.length || 0,
        merged: mergedJson.groups.length,
        import: importStats
      }
    };

  } catch (error) {
    console.error('❌ Smart sync failed:', error.message);
    throw error;
  }
}

/**
 * Helper function to sort groups JSON for comparison
 * Ensures consistent ordering for accurate comparison
 */
function sortGroupsJson(json) {
  if (!json || !json.groups) return json;
  
  return {
    version: json.version,
    groups: [...json.groups].sort((a, b) => {
      // Sort by name for consistent comparison
      return a.name.localeCompare(b.name);
    })
  };
}

// ============ API ENDPOINTS ============

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
app.post('/api/groups', async (req, res) => {
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
    
    // Note: Auto-sync disabled. Use "Push to GitHub" button to sync manually.
    
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update group
app.put('/api/groups/:id', async (req, res) => {
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
    
    // Note: Auto-sync disabled. Use "Push to GitHub" button to sync manually.
    
    res.json(updatedGroup);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete group
app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    groupOperations.delete.run(id);
    
    // Note: Auto-sync disabled. Use "Push to GitHub" button to sync manually.
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manually sync groups to GitHub
app.post('/api/groups/sync/push', async (req, res) => {
  try {
    await syncGroupsToGitHub();
    res.json({ success: true, message: 'Groups synced to GitHub successfully' });
  } catch (error) {
    console.error('Sync groups to GitHub error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pull groups from GitHub and update database
app.post('/api/groups/sync/pull', async (req, res) => {
  try {
    const result = await pullGroupsFromGitHub();
    res.json(result);
  } catch (error) {
    console.error('Pull groups from GitHub error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Smart sync groups (export → pull → merge → compare → upload if changed)
app.post('/api/groups/sync/smart', async (req, res) => {
  try {
    const result = await smartSyncGroups();
    res.json(result);
  } catch (error) {
    console.error('Smart sync groups error:', error);
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
    const { title, filename, html_content, sections_data, group_id, preview_image } = req.body;
    
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
      sections_data: sections_data ? JSON.stringify(sections_data) : null,
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
    const { title, filename, html_content, sections_data, group_id, sort_order, preview_image } = req.body;

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
      sections_data: sections_data !== undefined ? (sections_data ? JSON.stringify(sections_data) : null) : existingPage.sections_data,
      preview_image: preview_image !== undefined ? preview_image : existingPage.preview_image
    });

    const updatedPage = pageOperations.getById.get(id);
    res.json(updatedPage);
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update page by filename (for updating from editor)
app.put('/api/pages/by-filename/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { title, html_content, sections_data } = req.body;

    const existingPage = pageOperations.getByFilename.get(filename);
    if (!existingPage) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Update content in GitHub
    let githubUrl = existingPage.github_url;
    if (html_content) {
      try {
        const githubResult = await uploadToGitHub(
          filename, 
          html_content
        );
        githubUrl = githubResult.url;
      } catch (error) {
        console.error('GitHub update failed:', error);
        // Continue with database update even if GitHub fails
      }
    }

    // Update database
    pageOperations.update.run({
      id: existingPage.id,
      title: title || existingPage.title,
      filename: existingPage.filename,
      github_url: githubUrl,
      group_id: existingPage.group_id,
      sort_order: existingPage.sort_order,
      html_content: html_content || existingPage.html_content,
      sections_data: sections_data !== undefined ? (sections_data ? JSON.stringify(sections_data) : null) : existingPage.sections_data,
      preview_image: existingPage.preview_image
    });

    const updatedPage = pageOperations.getById.get(existingPage.id);
    res.json(updatedPage);
  } catch (error) {
    console.error('Update page by filename error:', error);
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

    // Delete from GitHub - use github_url which contains the full path (e.g., "2025/10/filename.html")
    if (page.github_url) {
      try {
        await deleteFromGitHub(page.github_url);
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

// Get specific file content from GitHub
app.get('/api/github/file/:path(*)', async (req, res) => {
  try {
    const { path } = req.params;
    const fileData = await getFileFromGitHub(decodeURIComponent(path));
    res.json(fileData);
  } catch (error) {
    console.error('Get GitHub file error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all files with content from GitHub
app.get('/api/github/files/all', async (req, res) => {
  try {
    const files = await getAllFilesFromGitHub();
    res.json(files);
  } catch (error) {
    console.error('Get all GitHub files error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/github/pull-all', async (req, res) => {
  try {
    // NOTE: Groups sync is now handled separately via the Smart Sync button
    // We don't pull groups here to reduce GitHub API calls and Actions triggers
    
    const result = await pullAllFromGitHub();
    
    if (!result.success) {
      return res.json(result);
    }
    
    if (result.files.length === 0) {
      return res.json({
        ...result,
        groupsStats
      });
    }
    
    // Save each file to database
    const savedFiles = [];
    const errors = [];
    
    for (const file of result.files) {
      try {
        // Use filename without extension as title (more reliable than HTML <title> tag)
        const title = file.name.replace('.html', '');
        
        // Check if file already exists by filename
        const existingPages = pageOperations.getAll.all();
        const existingPage = existingPages.find(p => p.filename === file.name);
        
        if (existingPage) {
          // Update existing page
          pageOperations.update.run({
            id: existingPage.id,
            title: title,
            filename: file.name,
            github_url: file.url,
            group_id: existingPage.group_id, // Preserve existing group assignment
            sort_order: 0,
            html_content: file.content,
            sections_data: null,
            preview_image: null
          });
          console.log(`Updated existing page: ${file.name}`);
        } else {
          // Create new page
          const insertResult = pageOperations.create.run({
            title: title,
            filename: file.name,
            github_url: file.url,
            group_id: null, // No group assigned for pulled files
            sort_order: 0,
            html_content: file.content,
            sections_data: null,
            preview_image: null
          });
          console.log(`Created new page: ${file.name} with ID: ${insertResult.lastInsertRowid}`);
        }
        
        savedFiles.push({
          name: file.name,
          title: title,
          url: file.url
        });
        
      } catch (error) {
        console.error(`Failed to save file ${file.name}:`, error);
        errors.push({
          file: file.name,
          error: error.message
        });
      }
    }
    
    // Return success response with saved files info
    res.json({
      success: true,
      message: `Successfully pulled and saved ${savedFiles.length} files from GitHub`,
      files: savedFiles,
      fileTitles: savedFiles.map(f => f.title),
      errors: errors,
      combinedContent: result.combinedContent
    });
    
  } catch (error) {
    console.error('GitHub pull all error:', error);
    res.status(500).json({ 
      error: 'Failed to pull all files from GitHub',
      details: error.message 
    });
  }
});

// Sync file with GitHub
app.post('/api/github/sync', async (req, res) => {
  try {
    const { filePath, localContent } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const syncResult = await syncWithGitHub(filePath, localContent);
    res.json(syncResult);
  } catch (error) {
    console.error('GitHub sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pull file from GitHub (download and load into editor)
app.post('/api/github/pull', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const fileData = await getFileFromGitHub(filePath);
    
    // Extract title from HTML content
    const titleMatch = fileData.content.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : fileData.name.replace('.html', '');
    
    // Extract filename from path
    const filename = fileData.name;
    
    res.json({
      success: true,
      fileData,
      title,
      filename,
      content: fileData.content
    });
  } catch (error) {
    console.error('GitHub pull error:', error);
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

