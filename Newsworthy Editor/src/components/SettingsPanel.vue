<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="settings-modal">
      <div class="modal-header">
        <h2>⚙️ GitHub Pages Settings</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="info-box">
          <p>
            <strong>📌 Important:</strong> GitHub Pages is required for saving your work. 
            Please configure your GitHub repository settings below.
          </p>
        </div>

        <form @submit.prevent="handleSave" class="settings-form">
          <div class="form-group">
            <label for="github-token">
              <span class="label-text">GitHub Personal Access Token</span>
              <span class="required">*</span>
            </label>
            <input
              id="github-token"
              v-model="formData.token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              required
            />
            <small class="help-text">
              Create a token at: 
              <a href="https://github.com/settings/tokens" target="_blank" rel="noopener">
                GitHub Settings → Developer settings → Personal access tokens
              </a>
              <br />Required permissions: <code>repo</code> (Full control of private repositories)
            </small>
          </div>

          <div class="form-group">
            <label for="github-owner">
              <span class="label-text">Repository Owner (Username/Organization)</span>
              <span class="required">*</span>
            </label>
            <input
              id="github-owner"
              v-model="formData.owner"
              type="text"
              placeholder="your-username"
              required
            />
            <small class="help-text">Your GitHub username or organization name</small>
          </div>

          <div class="form-group">
            <label for="github-repo">
              <span class="label-text">Repository Name</span>
              <span class="required">*</span>
            </label>
            <input
              id="github-repo"
              v-model="formData.repo"
              type="text"
              placeholder="my-pages-repo"
              required
            />
            <small class="help-text">The repository where pages will be stored</small>
          </div>

          <div class="form-group">
            <label for="github-branch">
              <span class="label-text">Branch</span>
              <span class="required">*</span>
            </label>
            <input
              id="github-branch"
              v-model="formData.branch"
              type="text"
              placeholder="gh-pages"
              required
            />
            <small class="help-text">Usually 'gh-pages' or 'main'</small>
          </div>

          <div class="form-group">
            <label for="base-url">
              <span class="label-text">Base URL</span>
            </label>
            <input
              id="base-url"
              v-model="formData.baseUrl"
              type="text"
              placeholder="https://your-username.github.io/repo-name"
            />
            <small class="help-text">
              Your GitHub Pages URL (e.g., https://username.github.io/repo-name)
            </small>
          </div>

          <div class="button-group">
            <button type="button" class="btn btn-test" @click="handleTest" :disabled="testing">
              {{ testing ? '🔄 Testing...' : '🧪 Test Connection' }}
            </button>
            <button type="submit" class="btn btn-save" :disabled="saving">
              {{ saving ? '💾 Saving...' : '💾 Save Settings' }}
            </button>
          </div>

          <div v-if="testResult" class="result-box" :class="testResult.success ? 'success' : 'error'">
            {{ testResult.message }}
          </div>
        </form>

        <div class="divider"></div>

        <div class="current-config">
          <h3>Current Configuration Status</h3>
          <div v-if="currentConfig" class="config-display">
            <div class="config-item">
              <span class="config-label">Repository:</span>
              <span class="config-value">{{ currentConfig.owner }}/{{ currentConfig.repo }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">Branch:</span>
              <span class="config-value">{{ currentConfig.branch }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">Base URL:</span>
              <span class="config-value">{{ currentConfig.baseUrl || 'Not set' }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">Status:</span>
              <span class="config-value status-active">✅ Configured</span>
            </div>
          </div>
          <div v-else class="config-display">
            <p class="no-config">⚠️ No GitHub configuration found. Please configure above to enable saving.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['close'])

const formData = ref({
  token: '',
  owner: '',
  repo: '',
  branch: 'gh-pages',
  baseUrl: ''
})

const currentConfig = ref(null)
const testing = ref(false)
const saving = ref(false)
const testResult = ref(null)

const API_BASE = 'http://localhost:3001/api'

onMounted(async () => {
  await loadCurrentConfig()
})

const loadCurrentConfig = async () => {
  try {
    const response = await fetch(`${API_BASE}/settings/github`)
    if (response.ok) {
      const data = await response.json()
      if (data.configured) {
        currentConfig.value = data.config
        // Pre-fill form with current values (except token for security)
        formData.value.owner = data.config.owner
        formData.value.repo = data.config.repo
        formData.value.branch = data.config.branch
        formData.value.baseUrl = data.config.baseUrl || ''
      }
    }
  } catch (error) {
    console.error('Failed to load current config:', error)
  }
}

const handleTest = async () => {
  testResult.value = null
  testing.value = true

  try {
    const response = await fetch(`${API_BASE}/settings/github/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })

    const data = await response.json()
    
    if (response.ok && data.success) {
      testResult.value = {
        success: true,
        message: '✅ Connection successful! GitHub API is working correctly.'
      }
    } else {
      testResult.value = {
        success: false,
        message: `❌ Connection failed: ${data.error || 'Unknown error'}`
      }
    }
  } catch (error) {
    testResult.value = {
      success: false,
      message: `❌ Connection failed: ${error.message}`
    }
  } finally {
    testing.value = false
  }
}

const handleSave = async () => {
  testResult.value = null
  saving.value = true

  try {
    const response = await fetch(`${API_BASE}/settings/github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })

    const data = await response.json()

    if (response.ok) {
      alert('✅ Settings saved successfully!')
      await loadCurrentConfig()
      // Clear token field for security
      formData.value.token = ''
    } else {
      alert(`❌ Failed to save settings: ${data.error}`)
    }
  } catch (error) {
    alert(`❌ Failed to save settings: ${error.message}`)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.settings-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 28px;
  overflow-y: auto;
}

.info-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-box p {
  margin: 0;
  color: #1e40af;
  font-size: 14px;
  line-height: 1.6;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #ef4444;
}

.form-group input {
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.help-text {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.help-text a {
  color: #667eea;
  text-decoration: none;
}

.help-text a:hover {
  text-decoration: underline;
}

.help-text code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-test {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #d1d5db;
}

.btn-test:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.result-box {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 12px;
}

.result-box.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.result-box.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #e5e7eb, transparent);
  margin: 32px 0;
}

.current-config h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.config-display {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.config-item:last-child {
  border-bottom: none;
}

.config-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.config-value {
  font-size: 14px;
  color: #1f2937;
  font-family: 'Courier New', monospace;
}

.status-active {
  color: #059669;
  font-weight: 700;
}

.no-config {
  text-align: center;
  color: #f59e0b;
  font-size: 14px;
  margin: 0;
}
</style>

