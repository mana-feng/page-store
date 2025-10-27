<template>
  <div class="storage-manager">
    <div class="manager-header">
      <h2>📚 Storage Manager</h2>
      <button @click="closeManager" class="close-btn">✕</button>
    </div>

    <!-- GitHub Status -->
    <div class="github-status" :class="{ connected: githubConnected }">
      <span class="status-icon">{{ githubConnected ? '✓' : '⚠' }}</span>
      <span>GitHub Pages: {{ githubConnected ? 'Connected' : 'Not Configured' }}</span>
      <span v-if="githubConnected" class="github-info">
        ({{ githubOwner }}/{{ githubRepo }})
      </span>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="🔍 Search pages..."
          @input="handleSearch"
        />
      </div>
      <button @click="handlePullAllFromGitHub" class="btn btn-pull" :disabled="!githubConnected">
        ⬇️ Pull All from GitHub
      </button>
      <button @click="showGroupDialog = true" class="btn btn-primary">
        ➕ New Group
      </button>
    </div>

    <!-- Pages Section -->
    <div class="pages-section">
      <div class="section-header">
        <h3>Pages ({{ pages.length }})</h3>
        
        <!-- Group Filter Dropdown -->
        <div class="filter-controls">
          <div class="filter-dropdown" v-if="groups.length > 0">
            <div class="dropdown-trigger" @click="toggleGroupDropdown" :class="{ open: isGroupDropdownOpen }">
              <div class="selected-group">
                <span class="filter-icon">🏷️</span>
                <span class="group-text">
                  <span v-if="filterGroupId === null" class="all-text">All Groups</span>
                  <span v-else class="group-name">
                    <span class="color-dot" :style="{ backgroundColor: selectedGroup?.color }"></span>
                    {{ selectedGroup?.name }}
                  </span>
                </span>
              </div>
              <span class="dropdown-arrow">▼</span>
            </div>
            
            <transition name="dropdown">
              <div v-if="isGroupDropdownOpen" class="dropdown-menu">
                <div 
                  class="dropdown-item" 
                  :class="{ active: filterGroupId === null }"
                  @click="selectGroupFromDropdown(null)"
                >
                  <span class="item-icon">📚</span>
                  <span class="item-text">All Groups</span>
                  <span class="item-count">{{ totalPagesCount }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <div 
                  v-for="group in groups" 
                  :key="group.id"
                  class="dropdown-item"
                  :class="{ active: filterGroupId === group.id }"
                  @click="selectGroupFromDropdown(group.id)"
                >
                  <span class="color-dot" :style="{ backgroundColor: group.color }"></span>
                  <span class="item-text">{{ group.name }}</span>
                  <span class="item-count">{{ group.page_count }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item manage-item" @click="openGroupManager">
                  <span class="item-icon">⚙️</span>
                  <span class="item-text">Manage Groups</span>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <div class="view-options">
          <button 
            @click="viewMode = 'grid'" 
            :class="{ active: viewMode === 'grid' }"
            class="icon-btn"
          >
            ⊞
          </button>
          <button 
            @click="viewMode = 'list'" 
            :class="{ active: viewMode === 'list' }"
            class="icon-btn"
          >
            ☰
          </button>
        </div>
      </div>

      <div v-if="pages.length === 0" class="empty-state">
        <p>📄 No pages yet. Create your first page in the editor!</p>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="pages-grid">
        <div 
          v-for="page in pages" 
          :key="page.id" 
          class="page-card"
          draggable="true"
          @dragstart="handleDragStart($event, page)"
          @dragover.prevent
          @drop="handleDrop($event, page)"
        >
          <div class="page-preview" v-if="page.preview_image">
            <img :src="page.preview_image" :alt="page.title" />
          </div>
          <div class="page-preview placeholder" v-else>
            <span>📄</span>
          </div>
          <div class="page-info">
            <h4>{{ page.title }}</h4>
            <div class="page-meta">
              <span v-if="page.group_name" class="group-badge" :style="{ backgroundColor: page.group_color }">
                {{ page.group_name }}
              </span>
              <span class="date">{{ formatDate(page.updated_at) }}</span>
            </div>
            <div class="page-actions">
              <button @click="openPage(page)" class="icon-btn" title="Open">🔗</button>
              <button @click="copyIframeCode(page, $event)" class="icon-btn" title="Copy Iframe Code">📋</button>
              <button @click="editPageDialog(page)" class="icon-btn" title="Edit">✏️</button>
              <button @click="downloadPage(page)" class="icon-btn" title="Download">💾</button>
              <button @click="deletePage(page.id)" class="icon-btn delete" title="Delete">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="pages-list">
        <div 
          v-for="page in pages" 
          :key="page.id" 
          class="page-row"
          draggable="true"
          @dragstart="handleDragStart($event, page)"
          @dragover.prevent
          @drop="handleDrop($event, page)"
        >
          <div class="page-row-content">
            <span class="drag-handle">⋮⋮</span>
            <div class="page-main">
              <h4>{{ page.title }}</h4>
              <span class="filename">{{ page.filename }}</span>
            </div>
            <span v-if="page.group_name" class="group-badge" :style="{ backgroundColor: page.group_color }">
              {{ page.group_name }}
            </span>
            <span class="date">{{ formatDate(page.updated_at) }}</span>
            <div class="page-actions">
              <button @click="openPage(page)" class="icon-btn" title="Open">🔗</button>
              <button @click="copyIframeCode(page, $event)" class="icon-btn" title="Copy Iframe Code">📋</button>
              <button @click="editPageDialog(page)" class="icon-btn" title="Edit">✏️</button>
              <button @click="downloadPage(page)" class="icon-btn" title="Download">💾</button>
              <button @click="deletePage(page.id)" class="icon-btn delete" title="Delete">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Group Management Dialog -->
    <div v-if="showGroupDialog" class="modal-overlay" @click.self="closeGroupDialog">
      <div class="modal-content group-manager-modal">
        <h3>Manage Groups</h3>
        
        <!-- Create/Edit Form -->
        <div class="group-form-section">
          <h4>{{ editingGroup ? 'Edit Group' : 'Create New Group' }}</h4>
          <form @submit.prevent="saveGroup">
            <div class="form-row">
              <div class="form-group">
                <label>Group Name *</label>
                <input v-model="groupForm.name" type="text" required />
              </div>
              <div class="form-group">
                <label>Color</label>
                <input v-model="groupForm.color" type="color" />
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="groupForm.description" rows="2"></textarea>
            </div>
            <div class="form-actions">
              <button v-if="editingGroup" type="button" @click="cancelEditGroup" class="btn btn-secondary">
                Cancel Edit
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingGroup ? '✓ Update' : '➕ Create' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Groups List -->
        <div class="groups-list-section" v-if="groups.length > 0">
          <h4>Existing Groups ({{ groups.length }})</h4>
          <div class="groups-list">
            <div 
              v-for="group in groups" 
              :key="group.id"
              class="group-item"
              :class="{ editing: editingGroup && editingGroup.id === group.id }"
            >
              <div class="group-color-bar" :style="{ backgroundColor: group.color }"></div>
              <div class="group-info">
                <strong>{{ group.name }}</strong>
                <span class="group-desc">{{ group.description || 'No description' }}</span>
                <span class="group-count">{{ group.page_count }} pages</span>
              </div>
              <div class="group-item-actions">
                <button @click="editGroup(group)" class="icon-btn" title="Edit">✏️</button>
                <button @click="deleteGroup(group.id)" class="icon-btn delete" title="Delete">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="closeGroupDialog" class="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Page Edit Dialog -->
    <div v-if="showPageDialog" class="modal-overlay" @click.self="closePageDialog">
      <div class="modal-content">
        <h3>Edit Page</h3>
        <form @submit.prevent="savePage">
          <div class="form-group">
            <label>Title *</label>
            <input v-model="pageForm.title" type="text" required />
          </div>
          <div class="form-group">
            <label>Filename *</label>
            <input v-model="pageForm.filename" type="text" required />
          </div>
          <div class="form-group">
            <label>Group</label>
            <select v-model="pageForm.group_id">
              <option :value="null">No Group</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="closePageDialog" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const API_BASE_URL = 'http://localhost:3001/api';

// State
const githubConnected = ref(false);
const githubOwner = ref('');
const githubRepo = ref('');
const groups = ref([]);
const pages = ref([]);
const searchQuery = ref('');
const filterGroupId = ref(null);
const viewMode = ref('grid');
const showGroupDialog = ref(false);
const showPageDialog = ref(false);
const editingGroup = ref(null);
const editingPage = ref(null);
const draggedPage = ref(null);
const isGroupDropdownOpen = ref(false);

const groupForm = ref({
  name: '',
  description: '',
  color: '#3b82f6'
});

const pageForm = ref({
  title: '',
  filename: '',
  group_id: null
});

const emit = defineEmits(['close']);

// Computed
const selectedGroup = computed(() => {
  if (filterGroupId.value === null) return null;
  return groups.value.find(g => g.id === filterGroupId.value);
});

const totalPagesCount = computed(() => {
  // Sum up page_count from all groups
  return groups.value.reduce((total, group) => total + (group.page_count || 0), 0);
});

// Methods
// Helper function to build full GitHub URL from relative path
function buildGitHubUrl(relativePath) {
  if (!relativePath || !githubOwner.value || !githubRepo.value) {
    return null;
  }
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  // Build full URL from relative path
  return `https://${githubOwner.value}.github.io/${githubRepo.value}/${relativePath}`;
}

async function checkGitHubStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/github/status`);
    const data = await response.json();
    githubConnected.value = data.configured;
    githubOwner.value = data.owner || '';
    githubRepo.value = data.repo || '';
  } catch (error) {
    console.error('Failed to check GitHub status:', error);
  }
}

async function loadGroups() {
  try {
    const response = await fetch(`${API_BASE_URL}/groups`);
    groups.value = await response.json();
  } catch (error) {
    console.error('Failed to load groups:', error);
  }
}

async function loadPages() {
  try {
    let url = `${API_BASE_URL}/pages`;
    const params = new URLSearchParams();
    
    if (filterGroupId.value) {
      params.append('group_id', filterGroupId.value);
    }
    if (searchQuery.value) {
      params.append('search', searchQuery.value);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    pages.value = await response.json();
  } catch (error) {
    console.error('Failed to load pages:', error);
  }
}

function handleSearch() {
  loadPages();
}

function editGroup(group) {
  editingGroup.value = group;
  groupForm.value = {
    name: group.name,
    description: group.description || '',
    color: group.color || '#3b82f6'
  };
  showGroupDialog.value = true;
}

async function saveGroup() {
  try {
    const url = editingGroup.value 
      ? `${API_BASE_URL}/groups/${editingGroup.value.id}`
      : `${API_BASE_URL}/groups`;
    
    const method = editingGroup.value ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupForm.value)
    });
    
    if (response.ok) {
      await loadGroups();
      closeGroupDialog();
    }
  } catch (error) {
    console.error('Failed to save group:', error);
    alert('Failed to save group');
  }
}

async function deleteGroup(id) {
  if (!confirm('Delete this group? Pages in this group will not be deleted.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await loadGroups();
      await loadPages();
    }
  } catch (error) {
    console.error('Failed to delete group:', error);
    alert('Failed to delete group');
  }
}

function editPageDialog(page) {
  editingPage.value = page;
  pageForm.value = {
    title: page.title,
    filename: page.filename,
    group_id: page.group_id
  };
  showPageDialog.value = true;
}

async function savePage() {
  try {
    const response = await fetch(`${API_BASE_URL}/pages/${editingPage.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageForm.value)
    });
    
    if (response.ok) {
      await loadPages();
      closePageDialog();
    }
  } catch (error) {
    console.error('Failed to save page:', error);
    alert('Failed to save page');
  }
}

async function deletePage(id) {
  if (!confirm('Delete this page? This will also remove it from GitHub Pages.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await loadPages();
    }
  } catch (error) {
    console.error('Failed to delete page:', error);
    alert('Failed to delete page');
  }
}

function openPage(page) {
  const fullUrl = buildGitHubUrl(page.github_url);
  if (fullUrl) {
    window.open(fullUrl, '_blank');
  } else {
    alert('GitHub URL not available');
  }
}

function downloadPage(page) {
  const blob = new Blob([page.html_content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = page.filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyIframeCode(page, event) {
  const fullUrl = buildGitHubUrl(page.github_url);
  if (!fullUrl) {
    alert('GitHub URL not available for this page');
    return;
  }
  
  const iframeCode = `<iframe 
  src="${fullUrl}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
  title="${page.title}">
</iframe>`;
  
  try {
    await navigator.clipboard.writeText(iframeCode);
    
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✓';
    button.style.background = '#10b981';
    button.style.color = 'white';
    button.style.borderColor = '#10b981';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
      button.style.color = '';
      button.style.borderColor = '';
    }, 2000);
    
    console.log('Iframe code copied:', iframeCode);
  } catch (error) {
    console.error('Failed to copy iframe code:', error);
    prompt('Copy this iframe code:', iframeCode);
  }
}

function handleDragStart(event, page) {
  draggedPage.value = page;
  event.dataTransfer.effectAllowed = 'move';
}

async function handleDrop(event, targetPage) {
  if (!draggedPage.value || draggedPage.value.id === targetPage.id) {
    return;
  }
  
  const draggedIndex = pages.value.findIndex(p => p.id === draggedPage.value.id);
  const targetIndex = pages.value.findIndex(p => p.id === targetPage.id);
  
  // Reorder locally
  const newPages = [...pages.value];
  const [removed] = newPages.splice(draggedIndex, 1);
  newPages.splice(targetIndex, 0, removed);
  
  // Update sort orders
  const updates = newPages.map((page, index) => ({
    id: page.id,
    sort_order: index
  }));
  
  try {
    await fetch(`${API_BASE_URL}/pages/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages: updates })
    });
    
    pages.value = newPages;
  } catch (error) {
    console.error('Failed to reorder pages:', error);
  }
  
  draggedPage.value = null;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function closeGroupDialog() {
  showGroupDialog.value = false;
  editingGroup.value = null;
  groupForm.value = {
    name: '',
    description: '',
    color: '#3b82f6'
  };
}

function cancelEditGroup() {
  editingGroup.value = null;
  groupForm.value = {
    name: '',
    description: '',
    color: '#3b82f6'
  };
}

function closePageDialog() {
  showPageDialog.value = false;
  editingPage.value = null;
  pageForm.value = {
    title: '',
    filename: '',
    group_id: null
  };
}

function selectGroup(groupId) {
  if (filterGroupId.value === groupId) {
    filterGroupId.value = null;
  } else {
    filterGroupId.value = groupId;
  }
  loadPages();
}

function toggleGroupDropdown() {
  isGroupDropdownOpen.value = !isGroupDropdownOpen.value;
}

function selectGroupFromDropdown(groupId) {
  filterGroupId.value = groupId;
  isGroupDropdownOpen.value = false;
  loadPages();
}

function openGroupManager() {
  isGroupDropdownOpen.value = false;
  showGroupDialog.value = true;
}

function clearGroupFilter() {
  filterGroupId.value = null;
  loadPages();
}

function getGroupName(groupId) {
  const group = groups.value.find(g => g.id === groupId);
  return group ? group.name : '';
}

// GitHub Pull All function
const handlePullAllFromGitHub = async () => {
  // Check if GitHub is configured
  if (!githubConnected.value) {
    alert('⚠️ GitHub Pages is not configured!\n\nPlease configure GitHub Pages settings first.')
    return
  }

  try {
    // Pull all files from GitHub
    const pullResponse = await fetch(`${API_BASE_URL}/github/pull-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!pullResponse.ok) {
      const error = await pullResponse.json()
      throw new Error(error.error)
    }
    
    const pullData = await pullResponse.json()
    
    if (!pullData.success) {
      alert(`❌ Pull failed: ${pullData.message}`)
      return
    }
    
    if (pullData.files.length === 0) {
      alert('📭 No HTML files found in GitHub repository.')
      return
    }
    
    // Show success message
    const fileList = pullData.fileTitles.join(', ')
    alert(`✅ Successfully pulled ${pullData.files.length} files from GitHub!\n\n📄 Files: ${fileList}\n\nAll content has been loaded into the editor.`)
    
    // Refresh the pages list to show any new content
    await loadPages()
    
  } catch (error) {
    console.error('Pull all from GitHub error:', error)
    alert(`❌ Pull failed: ${error.message}`)
  }
}

function closeManager() {
  emit('close');
}

onMounted(() => {
  checkGitHubStatus();
  loadGroups();
  loadPages();
});
</script>

<style scoped>
.storage-manager {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.manager-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
}

.close-btn {
  background: #ef4444;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #dc2626;
}

.github-status {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  display: flex;
  align-items: center;
  gap: 8px;
}

.github-status.connected {
  background: #d1fae5;
  border-color: #10b981;
}

.status-icon {
  font-size: 18px;
}

.github-info {
  color: #6b7280;
  font-size: 14px;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.group-filter {
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-pull {
  background: #d4e8f1;
  border: 1px solid #b8d0e8;
  color: #1e3a5e;
}

.btn-pull:hover:not(:disabled) {
  background: #c0d8e8;
}

.btn-pull:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.groups-section {
  margin-bottom: 32px;
}

.groups-section h3 {
  margin-bottom: 16px;
  color: #1f2937;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.group-card {
  border: 2px solid;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
}

.group-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.group-card.active {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
  border-width: 3px;
}

.group-card.active::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  background: #10b981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.group-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-header h4 {
  margin: 0;
  font-size: 16px;
}

.group-actions {
  display: flex;
  gap: 4px;
}

.group-body {
  padding: 12px 16px;
}

.group-body p {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 14px;
}

.page-count {
  font-size: 12px;
  color: #9ca3af;
}

.group-filter-status {
  margin-top: 16px;
  padding: 12px 16px;
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.group-filter-status span {
  color: #1e40af;
  font-size: 14px;
}

.group-filter-status strong {
  font-weight: 600;
}

.btn-clear-filter {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-clear-filter:hover {
  background: #2563eb;
}

.pages-section {
  margin-top: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-header h3 {
  margin: 0;
  color: #1f2937;
}

/* Filter Controls */
.filter-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

.filter-dropdown {
  position: relative;
  min-width: 220px;
}

/* Dropdown Trigger */
.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  gap: 12px;
}

.dropdown-trigger:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.dropdown-trigger.open {
  border-color: #3b82f6;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.selected-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.filter-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.group-text {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.all-text {
  color: #64748b;
}

.group-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
}

.dropdown-arrow {
  font-size: 10px;
  color: #64748b;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.dropdown-trigger.open .dropdown-arrow {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.dropdown-item:hover {
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
}

.dropdown-item.active {
  background: linear-gradient(90deg, #dbeafe 0%, #bfdbfe 100%);
  font-weight: 600;
}

.dropdown-item.active::before {
  content: '✓';
  position: absolute;
  left: -8px;
  font-size: 14px;
  color: #3b82f6;
  font-weight: bold;
}

.item-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  font-size: 14px;
  color: #334155;
}

.dropdown-item.active .item-text {
  color: #1e40af;
}

.item-count {
  font-size: 12px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.dropdown-item.active .item-count {
  background: #3b82f6;
  color: white;
}

.dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
  margin: 4px 0;
}

.manage-item {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-weight: 500;
  border-top: 2px solid #e2e8f0;
}

.manage-item:hover {
  background: linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%);
}

.manage-item .item-text {
  color: #3b82f6;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
}

.dropdown-enter-from {
  opacity: 0;
  transform: scaleY(0.8) translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.8) translateY(-10px);
}

.view-options {
  display: flex;
  gap: 4px;
}

.icon-btn {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #f3f4f6;
}

.icon-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.icon-btn.delete:hover {
  background: #fee2e2;
  border-color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  font-size: 16px;
}

.pages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.page-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  cursor: move;
  transition: all 0.2s;
}

.page-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.page-preview {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-preview.placeholder span {
  font-size: 48px;
  opacity: 0.3;
}

.page-info {
  padding: 16px;
}

.page-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #1f2937;
}

.page-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.group-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.date {
  font-size: 12px;
  color: #9ca3af;
}

.page-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.pages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-row {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: move;
  transition: all 0.2s;
}

.page-row:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-row-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.drag-handle {
  color: #9ca3af;
  cursor: grab;
  font-size: 18px;
}

.page-main {
  flex: 1;
}

.page-main h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #1f2937;
}

.filename {
  font-size: 13px;
  color: #6b7280;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #1f2937;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input[type="color"] {
  height: 40px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* Group Manager Modal Styles */
.group-manager-modal {
  max-width: 700px;
  max-height: 85vh;
}

.group-form-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

.group-form-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1f2937;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row .form-group {
  margin-bottom: 0;
}

.form-row .form-group:last-child {
  width: 100px;
}

.groups-list-section {
  margin-top: 24px;
}

.groups-list-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #1f2937;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.group-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.group-item.editing {
  background: #eff6ff;
  border-color: #3b82f6;
}

.group-color-bar {
  width: 4px;
  height: 48px;
  border-radius: 2px;
  flex-shrink: 0;
}

.group-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-info strong {
  font-size: 14px;
  color: #1f2937;
}

.group-desc {
  font-size: 13px;
  color: #6b7280;
}

.group-count {
  font-size: 12px;
  color: #9ca3af;
}

.group-item-actions {
  display: flex;
  gap: 4px;
}

.modal-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}
</style>

