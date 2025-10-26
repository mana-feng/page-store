import { Octokit } from 'octokit';
import { githubConfig } from './config-store.js';

/**
 * Get Octokit instance with current configuration
 * @returns {Octokit|null}
 */
function getOctokit() {
  const config = githubConfig.getConfig();
  if (!config || !config.token) {
    return null;
  }
  return new Octokit({ auth: config.token });
}

/**
 * Get current GitHub configuration
 * @returns {Object|null}
 */
function getConfig() {
  return githubConfig.getConfig();
}

/**
 * Upload HTML file to GitHub repository
 * @param {string} filename - Name of the HTML file
 * @param {string} content - HTML content
 * @param {Date} customDate - Optional custom date for folder structure (defaults to now)
 * @returns {Promise<string>} - GitHub Pages URL
 */
export async function uploadToGitHub(filename, content, customDate = null) {
  const octokit = getOctokit();
  const config = getConfig();
  
  if (!octokit || !config) {
    throw new Error('GitHub is not configured. Please configure GitHub settings first.');
  }

  const { owner, repo, branch, baseUrl } = config;

  try {
    // Ensure filename ends with .html
    if (!filename.endsWith('.html')) {
      filename += '.html';
    }

    // Sanitize filename
    filename = filename.replace(/[^a-zA-Z0-9-_.]/g, '-');

    // Generate date-based folder structure: YYYY/MM/
    const date = customDate || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const datePath = `${year}/${month}`;
    
    // Construct full path with date folders
    const path = `${datePath}/${filename}`;
    
    // Check if file already exists
    let sha = null;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });
      sha = data.sha;
    } catch (error) {
      // File doesn't exist, which is fine
      if (error.status !== 404) {
        throw error;
      }
    }

    // Create or update file
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: sha ? `Update ${filename}` : `Add ${filename}`,
      content: Buffer.from(content).toString('base64'),
      branch,
      ...(sha && { sha })
    });

    // Construct GitHub Pages URL with date path
    const githubPagesUrl = `${baseUrl}/${path}`;
    
    return {
      url: githubPagesUrl,
      commit: response.data.commit.sha,
      filename: path  // Return full path including date folders
    };
  } catch (error) {
    console.error('GitHub upload error:', error);
    throw new Error(`Failed to upload to GitHub: ${error.message}`);
  }
}

/**
 * Delete file from GitHub repository
 * @param {string} filename - Name of the file to delete
 * @returns {Promise<void>}
 */
export async function deleteFromGitHub(filename) {
  const octokit = getOctokit();
  const config = getConfig();
  
  if (!octokit || !config) {
    throw new Error('GitHub is not configured. Please configure GitHub settings first.');
  }

  const { owner, repo, branch } = config;

  try {
    // Get file SHA
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filename,
      ref: branch
    });

    // Delete file
    await octokit.rest.repos.deleteFile({
      owner,
      repo,
      path: filename,
      message: `Delete ${filename}`,
      sha: data.sha,
      branch
    });

    return { success: true };
  } catch (error) {
    console.error('GitHub delete error:', error);
    throw new Error(`Failed to delete from GitHub: ${error.message}`);
  }
}

/**
 * Recursively get all HTML files from a directory
 * @param {Octokit} octokit - Octokit instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name
 * @param {string} path - Current path
 * @returns {Promise<Array>} - Array of file paths
 */
async function getFilesRecursively(octokit, owner, repo, branch, path = '') {
  const files = [];
  
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    });

    // Handle single file case
    if (!Array.isArray(data)) {
      if (data.name.endsWith('.html')) {
        files.push(data);
      }
      return files;
    }

    // Process each item in directory
    for (const item of data) {
      if (item.type === 'file' && item.name.endsWith('.html')) {
        files.push(item);
      } else if (item.type === 'dir') {
        // Recursively get files from subdirectory
        const subFiles = await getFilesRecursively(octokit, owner, repo, branch, item.path);
        files.push(...subFiles);
      }
    }
  } catch (error) {
    console.error(`Error reading path ${path}:`, error.message);
  }

  return files;
}

/**
 * List all HTML files in the repository (recursively)
 * @returns {Promise<Array>} - Array of file objects
 */
export async function listGitHubFiles() {
  const octokit = getOctokit();
  const config = getConfig();
  
  if (!octokit || !config) {
    throw new Error('GitHub is not configured. Please configure GitHub settings first.');
  }

  const { owner, repo, branch, baseUrl } = config;

  try {
    const files = await getFilesRecursively(octokit, owner, repo, branch, '');

    return files.map(file => ({
      name: file.name,
      path: file.path,  // Full path including folders
      url: `${baseUrl}/${file.path}`,
      size: file.size,
      sha: file.sha
    }));
  } catch (error) {
    console.error('GitHub list error:', error);
    throw new Error(`Failed to list GitHub files: ${error.message}`);
  }
}

/**
 * Rename file in GitHub repository
 * @param {string} oldFilename - Current filename (can include path)
 * @param {string} newFilename - New filename (without path)
 * @param {string} content - File content
 * @param {Date} customDate - Optional custom date for folder structure
 * @returns {Promise<Object>}
 */
export async function renameInGitHub(oldFilename, newFilename, content, customDate = null) {
  try {
    // Upload with new name (will use current date or provided date for path)
    const uploadResult = await uploadToGitHub(newFilename, content, customDate);
    
    // Delete old file (oldFilename might include path like "2024/10/file.html")
    await deleteFromGitHub(oldFilename);
    
    return uploadResult;
  } catch (error) {
    console.error('GitHub rename error:', error);
    throw new Error(`Failed to rename in GitHub: ${error.message}`);
  }
}

/**
 * Check if GitHub configuration is valid
 * @returns {Promise<boolean>}
 */
export async function validateGitHubConfig() {
  const octokit = getOctokit();
  const config = getConfig();
  
  if (!octokit || !config) {
    return false;
  }

  const { owner, repo } = config;

  try {
    // Try to get repo info
    await octokit.rest.repos.get({
      owner,
      repo
    });

    return true;
  } catch (error) {
    console.error('GitHub validation error:', error);
    return false;
  }
}

/**
 * Test GitHub configuration with provided credentials
 * @param {Object} testConfig - Configuration to test
 * @returns {Promise<Object>}
 */
export async function testGitHubConfig(testConfig) {
  try {
    const { token, owner, repo } = testConfig;
    
    if (!token || !owner || !repo) {
      return { success: false, error: 'Missing required configuration' };
    }

    const testOctokit = new Octokit({ auth: token });
    
    // Try to get repo info
    await testOctokit.rest.repos.get({
      owner,
      repo
    });

    return { success: true };
  } catch (error) {
    console.error('GitHub test error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to connect to GitHub'
    };
  }
}

