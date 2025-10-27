<template>
  <aside class="sidebar">
    <div class="side-title">Sidebar</div>

    <div class="btns">
      <button class="btn" @click="$emit('add-section')">+ Add New Section</button>
      <button class="btn" @click="store.addTextBlock" :disabled="!store.currSection">+ Add Text Block</button>
      <button class="btn" @click="handleAddImage" :disabled="!store.currSection">+ Add Img Block</button>
      <button class="btn" @click="handleAddVideo" :disabled="!store.currSection">+ Add Video Block</button>
      <button class="btn" @click="$emit('add-parallax')">+ Add Parallax</button>
      <button class="btn btn-github" @click="handleSaveToGitHub">🚀 Save to GitHub Pages</button>
      <button class="btn btn-storage" @click="$emit('open-storage')">📚 Storage Manager</button>
      <button class="btn btn-settings" @click="$emit('open-settings')">⚙️ Settings</button>
    </div>

    <!-- Video URL Modal -->
    <div v-if="showVideoModal" class="modal-overlay" @click.self="closeVideoModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>🎬 Add YouTube Video</h3>
          <button class="modal-close" @click="closeVideoModal">×</button>
        </div>
        <div class="modal-body">
          <label class="modal-label">YouTube Video URL</label>
          <input 
            type="text" 
            v-model="videoUrl" 
            class="modal-input"
            placeholder="https://www.youtube.com/watch?v=..."
            @keyup.enter="confirmAddVideo"
            ref="videoUrlInput"
          />
          <div class="modal-hint">
            <p>Supported formats:</p>
            <ul>
              <li>🎥 Standard: https://www.youtube.com/watch?v=VIDEO_ID</li>
              <li>🔗 Short link: https://youtu.be/VIDEO_ID</li>
              <li>📱 Shorts: https://www.youtube.com/shorts/VIDEO_ID</li>
              <li>🔴 Live: https://www.youtube.com/live/VIDEO_ID</li>
              <li>📦 Embed: https://www.youtube.com/embed/VIDEO_ID</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn modal-btn-cancel" @click="closeVideoModal">Cancel</button>
          <button class="modal-btn modal-btn-confirm" @click="confirmAddVideo">Add Video</button>
        </div>
      </div>
    </div>

    <!-- Image URL Modal -->
    <div v-if="showImageModal" class="modal-overlay" @click.self="closeImageModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>🖼️ Add Image</h3>
          <button class="modal-close" @click="closeImageModal">×</button>
        </div>
        <div class="modal-body">
          <div class="image-source-tabs">
            <button 
              class="tab-btn" 
              :class="{ active: imageSourceTab === 'url' }"
              @click="imageSourceTab = 'url'"
            >
              🔗 URL
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: imageSourceTab === 'upload' }"
              @click="imageSourceTab = 'upload'"
            >
              📤 Upload
            </button>
          </div>

          <!-- URL Input Tab -->
          <div v-if="imageSourceTab === 'url'" class="tab-content">
            <label class="modal-label">Image URL</label>
            <input 
              type="text" 
              v-model="imageUrl" 
              class="modal-input"
              placeholder="https://example.com/image.jpg"
              @keyup.enter="confirmAddImage"
              ref="imageUrlInput"
            />
            <div class="modal-hint">
              <p>Enter a direct link to an image:</p>
              <ul>
                <li>https://example.com/photo.jpg</li>
                <li>https://example.com/image.png</li>
                <li>Supported: JPG, PNG, GIF, WebP, SVG</li>
              </ul>
            </div>
          </div>

          <!-- File Upload Tab -->
          <div v-if="imageSourceTab === 'upload'" class="tab-content">
            <label class="modal-label">Choose Image File</label>
            <div class="upload-area" @click="triggerFileInput">
              <div v-if="!selectedImageFile" class="upload-placeholder">
                <div class="upload-icon">📁</div>
                <p class="upload-text">Click to select an image</p>
                <p class="upload-subtext">or drag and drop here</p>
              </div>
              <div v-else class="upload-preview">
                <img :src="imagePreviewUrl" alt="Preview" class="preview-image" />
                <p class="file-name">{{ selectedImageFile.name }}</p>
                <button class="change-file-btn" @click.stop="triggerFileInput">Change File</button>
              </div>
            </div>
            <input 
              type="file" 
              ref="imageFileInput" 
              accept="image/*"
              style="display: none"
              @change="handleFileSelect"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn modal-btn-cancel" @click="closeImageModal">Cancel</button>
          <button class="modal-btn modal-btn-confirm" @click="confirmAddImage">Add Image</button>
        </div>
      </div>
    </div>

    <div class="details">
      <div class="detail-title">Detail Editing Area</div>

      <!-- notselected -->
      <div v-if="!store.selected.type" class="empty">
        Choose a section/text block/img block in Canvas to get editing tools.
      </div>

      <!-- get section editing tools -->
      <div v-else-if="store.selected.type === 'section'" class="section-panel">
        <div class="panel-header">Section Setting</div>

        <div class="setting-item">
          <label>Background Type</label>
          <select v-model="bgTypeProxy">
            <option value="color">Color</option>
            <option value="img">Image</option>
          </select>
        </div>

        <div class="setting-item" v-if="bgTypeProxy === 'color'">
          <label>Background Color</label>
          <input type="color" v-model="bgColorProxy" />
        </div>

        <div class="setting-item" v-if="bgTypeProxy === 'img'">
          <label>Upload Image</label>
          <input type="file" accept="image/*" @change="onImageUpload" />
          <div class="thumb" v-if="curr?.props.bgImg">
            <span>Preview:</span>
            <div class="thumb-box" :style="{ backgroundImage: `url(${curr.props.bgImg})` }"></div>
            <button class="danger-btn" @click="clearImage">Remove</button>
          </div>
        </div>

        <label class="setting-item">
          <span>Height(px)</span>
          <input type="number" min="200" :value="store.currSection?.props.height || 800"
            @input="store.setSecHeight($event.target.value)" />
        </label>

        <button class="danger-btn" @click="store.deleteSelected">Delete</button>
      </div>

      <!-- get text block editing tools -->
      <div v-else-if="store.selected.type === 'text'" class="mt-4 rounded bg-white/70 p-3">
        <div class="tool-card">
          <div class="tool-title">Text Style</div>
          <div class="seg">
            <button class="seg-btn" title="Title" aria-label="Title"
              :class="{ active: store.activeEditor?.isActive('heading', { level: 1 }) }" @click="setHeading(1)">
              T
            </button>

            <button class="seg-btn" title="Subtitle" aria-label="Subtitle"
              :class="{ active: store.activeEditor?.isActive('heading', { level: 2 }) }" @click="setHeading(2)">
              S
            </button>

            <button class="seg-btn" title="Body" aria-label="Body" :class="{
              active:
                !store.activeEditor?.isActive('heading', { level: 1 }) &&
                !store.activeEditor?.isActive('heading', { level: 2 })
            }" @click="setParagraph">
              B
            </button>
          </div>
        </div>

        <div class="tool-card">
          <div class="tool-title">Text Align</div>
          <div class="seg">
            <button class="seg-btn" title="Left" aria-label="Left" :class="{ active: isActiveAlign('left') }"
              @click="setAlign('left')">
              Left
            </button>
            <button class="seg-btn" title="Center" aria-label="Center" :class="{ active: isActiveAlign('center') }"
              @click="setAlign('center')">
              Center
            </button>
          </div>
        </div>

        <div class="tool-card">
          <div class="tool-title">Font Formatting</div>
          <div class="seg">
            <button class="seg-btn" title="Bold" aria-label="Bold"
              :class="{ active: store.activeEditor?.isActive('bold') }" @click="toggleBold">
              <strong>B</strong>
            </button>
            <button class="seg-btn" title="Italic" aria-label="Italic"
              :class="{ active: store.activeEditor?.isActive('italic') }" @click="toggleItalic">
              <em>I</em>
            </button>
          </div>
        </div>

        <div class="tool-card">
          <div class="tool-title">Set Link</div>
          <div class="seg">
            <button class="seg-btn" title="Insert Link" aria-label="Insert Link" @click="setLink">
              Insert
            </button>
            <button class="seg-btn" title="Remove Link" aria-label="Remove Link" @click="unsetLink">
              Remove
            </button>
          </div>
        </div>

        <div class="delete-wrapper">
          <button class="delete-btn small" @click="store.deleteSelected">Delete</button>
        </div>
      </div>

      <!-- get image block editing tools -->
      <div v-else-if="store.selected.type === 'image'" class="mt-4 rounded bg-white/70 p-3">
        <div class="panel-header">Image Settings</div>

        <div class="setting-item">
          <label>Width (px)</label>
          <input type="number" min="50" :value="store.currBlock?.width || 300"
            @input="store.setImgWidth($event.target.value)" />
        </div>

        <div class="setting-item">
          <label>Height (px)</label>
          <input type="number" min="50" :value="store.currBlock?.height || 300"
            @input="store.setImgHeight($event.target.value)" />
        </div>

        <div class="setting-item">
          <label>
            <input type="checkbox" :checked="store.currBlock?.keepRatio"
              @change="store.setImgKeepRatio($event.target.checked)" />
            Keep Aspect Ratio
          </label>
        </div>

        <div class="flex gap-2">
          <button class="btn" @click="replaceImage">Replace Image</button>
          <button class="btn btn-danger" @click="store.deleteSelected">Delete Image</button>
        </div>
      </div>

      <!-- get video block editing tools -->
      <div v-else-if="store.selected.type === 'video'" class="mt-4 rounded bg-white/70 p-3">
        <div class="panel-header">Video Settings</div>

        <div class="setting-item">
          <label>YouTube URL</label>
          <input type="text" :value="store.currBlock?.url || ''"
            @input="store.setVideoUrl($event.target.value)"
            placeholder="https://www.youtube.com/watch?v=..." />
          <small style="display: block; margin-top: 4px; color: #666;">
            Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
          </small>
        </div>

        <div class="setting-item">
          <label>Width (px)</label>
          <input type="number" min="200" :value="store.currBlock?.width || 560"
            @input="store.setVideoWidth($event.target.value)" />
        </div>

        <div class="setting-item">
          <label>Height (px)</label>
          <input type="number" min="150" :value="store.currBlock?.height || 315"
            @input="store.setVideoHeight($event.target.value)" />
        </div>

        <div class="setting-item">
          <label>
            <input type="checkbox" :checked="store.currBlock?.keepRatio"
              @change="store.setVideoKeepRatio($event.target.checked)" />
            Keep Aspect Ratio (16:9)
          </label>
        </div>

        <div class="flex gap-2">
          <button class="btn btn-danger" @click="store.deleteSelected">Delete Video</button>
        </div>
      </div>
    </div>
  </aside>
</template>


<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editorStore'

const store = useEditorStore()
const curr = computed(() => store.currSection)

// GitHub configuration
const githubOwner = ref('')
const githubRepo = ref('')

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

// Fetch GitHub configuration on mount
async function fetchGitHubConfig() {
  try {
    const response = await fetch('http://localhost:3001/api/github/status');
    const data = await response.json();
    if (data.configured) {
      githubOwner.value = data.owner || '';
      githubRepo.value = data.repo || '';
    }
  } catch (error) {
    console.error('Failed to fetch GitHub config:', error);
  }
}

onMounted(() => {
  fetchGitHubConfig();
})

function setHeading(level) {
  store.activeEditor?.chain().focus().setHeading({ level }).run()
}

function setParagraph() {
  store.activeEditor?.chain().focus().setParagraph().run()
}

function toggleBold() {
  store.activeEditor?.chain().focus().toggleBold().run()
}

function toggleItalic() {
  store.activeEditor?.chain().focus().toggleItalic().run()
}

function setAlign(align) {
  store.activeEditor?.chain().focus().setTextAlign(align).run()
}

function isActiveAlign(align) {
  return !!store.activeEditor?.isActive({ TextAlign: align })
}

function setLink() {
  const url = prompt('Enter URL:')
  if (url == null) return
  store.activeEditor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function unsetLink() {
  store.activeEditor?.chain().focus().unsetLink().run()
}

function replaceImage() {
  const imgPicker = document.createElement('input')
  imgPicker.type = 'file'
  imgPicker.accept = 'image/*'
  imgPicker.onchange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const blk = store.currBlock
    if (!blk || blk.type !== 'image') return
    
    // Clean up old blob URL if exists
    if (blk._blobUrl && blk._blobUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(blk._blobUrl)
      } catch (err) {
        console.warn('Failed to revoke old blob URL:', err)
      }
    }
    
    // Create new blob URL
    const url = URL.createObjectURL(file)
    
    // Load image to get natural dimensions and update block
    const img = new Image()
    img.onload = () => {
      const naturalW = img.naturalWidth || 300
      const naturalH = img.naturalHeight || 300
      const ratio = naturalW / naturalH || 1
      
      // Update block with new image
      blk.src = url
      blk._blobUrl = url
      blk.aspectRatio = ratio
      
      // Recalculate dimensions maintaining aspect ratio if enabled
      if (blk.keepRatio) {
        // Keep current width, adjust height based on new ratio
        blk.height = Math.round(blk.width / ratio)
      }
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      alert('❌ Failed to load image. Please try another file.')
    }
    
    img.src = url
  }
  imgPicker.click()
}

const bgTypeProxy = computed({
  get: () => curr.value?.props?.bgType ?? 'color',
  set: (val) => store.setSecType(val)
})

const bgColorProxy = computed({
  get: () => curr.value?.props?.background ?? '#ffffff',
  set: (val) => store.setSecBg(val)
})

const onImageUpload = (e) => {
  if (!curr.value) return
  const file = e.target.files?.[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  store.setSecBgImg(url)
}

const clearImage = () => {
  if (!curr.value) return
  store.setSecBgImg('')
  store.setSecType('color')
}

// Handle adding video block
// Video modal state
const showVideoModal = ref(false)
const videoUrl = ref('')
const videoUrlInput = ref(null)

const handleAddVideo = () => {
  showVideoModal.value = true
  videoUrl.value = ''
  // Focus input after modal opens
  nextTick(() => {
    videoUrlInput.value?.focus()
  })
}

const closeVideoModal = () => {
  showVideoModal.value = false
  videoUrl.value = ''
}

const confirmAddVideo = () => {
  console.log('🎬 confirmAddVideo called, videoUrl:', videoUrl.value);
  
  if (!videoUrl.value.trim()) {
    alert('⚠️ Please enter a YouTube URL')
    return
  }
  
  console.log('🎬 Calling store.addVideoBlock with:', videoUrl.value.trim());
  store.addVideoBlock(videoUrl.value.trim())
  console.log('🎬 Closing video modal');
  closeVideoModal()
}

// Handle adding image block
// Image modal state
const showImageModal = ref(false)
const imageSourceTab = ref('url') // 'url' or 'upload'
const imageUrl = ref('')
const imageUrlInput = ref(null)
const imageFileInput = ref(null)
const selectedImageFile = ref(null)
const imagePreviewUrl = ref('')

const handleAddImage = () => {
  showImageModal.value = true
  imageSourceTab.value = 'url'
  imageUrl.value = ''
  selectedImageFile.value = null
  imagePreviewUrl.value = ''
  // Focus input after modal opens
  nextTick(() => {
    if (imageSourceTab.value === 'url') {
      imageUrlInput.value?.focus()
    }
  })
}

const closeImageModal = () => {
  showImageModal.value = false
  imageUrl.value = ''
  selectedImageFile.value = null
  if (imagePreviewUrl.value && imagePreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
  imagePreviewUrl.value = ''
}

const triggerFileInput = () => {
  imageFileInput.value?.click()
}

const handleFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  // Clean up previous preview URL
  if (imagePreviewUrl.value && imagePreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
  
  selectedImageFile.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
}

const confirmAddImage = () => {
  let imageSrc = ''
  
  if (imageSourceTab.value === 'url') {
    const url = imageUrl.value.trim()
    if (!url) {
      alert('⚠️ Please enter a valid image URL!')
      return
    }
    
    // Basic URL validation
    try {
      new URL(url)
      imageSrc = url
    } catch (error) {
      alert('⚠️ Please enter a valid URL!')
      return
    }
  } else if (imageSourceTab.value === 'upload') {
    if (!selectedImageFile.value) {
      alert('⚠️ Please select an image file!')
      return
    }
    
    imageSrc = imagePreviewUrl.value
  }
  
  if (imageSrc) {
    store.addImageBlock(imageSrc)
    closeImageModal()
  }
}

const handleSaveToGitHub = async () => {
  if (store.sections.length === 0) {
    alert('⚠️ Please add content before saving!')
    return
  }
  
  // Check if GitHub is configured
  try {
    const configCheck = await fetch('http://localhost:3001/api/settings/github')
    const configData = await configCheck.json()
    
    if (!configData.configured) {
      const shouldConfigure = confirm(
        '⚠️ GitHub Pages is not configured!\n\n' +
        'You must configure GitHub Pages settings before saving.\n\n' +
        'Click OK to open Settings.'
      )
      if (shouldConfigure) {
        // Emit event to open settings
        document.dispatchEvent(new CustomEvent('open-settings'))
      }
      return
    }
  } catch (error) {
    alert('❌ Failed to check GitHub configuration. Please ensure the backend server is running.')
    return
  }
  
  const title = prompt('📝 Enter page title:', 'My Page')
  if (!title) return
  
  const filename = prompt('📄 Enter filename (without .html):', title.replace(/\s+/g, '-').toLowerCase())
  if (!filename) return
  
  try {
    const htmlContent = await store.generateHTML()
    // Save sections data for future editing
    const sectionsData = JSON.parse(JSON.stringify(store.sections))
    
    const response = await fetch('http://localhost:3001/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        filename,
        html_content: htmlContent,
        sections_data: sectionsData,
        group_id: null
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.github_url) {
        const fullUrl = buildGitHubUrl(data.github_url);
        if (fullUrl) {
          alert(`✅ Successfully saved to GitHub Pages!\n\n🌐 URL: ${fullUrl}\n\n📋 The URL has been copied to your clipboard.`)
          // Copy URL to clipboard
          navigator.clipboard.writeText(fullUrl).catch(() => {})
        } else {
          alert('✅ Saved to database, but GitHub Pages URL is not available.')
        }
      } else {
        alert('✅ Saved to database, but GitHub Pages URL is not available.')
      }
    } else {
      const error = await response.json()
      alert(`❌ Save failed: ${error.error}`)
    }
  } catch (error) {
    console.error('Save to GitHub error:', error)
    alert('❌ Save failed. Please ensure the backend server is running.')
  }
}


// Helper function to load HTML content into editor
const loadHTMLIntoEditor = async (htmlContent) => {
  try {
    // This is a simplified version - you might need to implement proper HTML parsing
    // For now, we'll create a basic section with the HTML content
    store.addSection()
    const currentSection = store.currSection
    if (currentSection) {
      // Add the HTML content as a text block
      store.addTextBlock()
      const textBlock = currentSection.blocks[currentSection.blocks.length - 1]
      if (textBlock && textBlock.editor) {
        // Set the HTML content in the editor
        textBlock.editor.commands.setContent(htmlContent)
      }
    }
  } catch (error) {
    console.error('Error loading HTML into editor:', error)
    throw error
  }
}

</script>

<style scoped>
/* Sidebar layout */
.sidebar {
  height: 100%;
  padding: 16px 18px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #fff;
}

.side-title {
  margin: 0 0 8px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #222;
}

/* Top area button */
.btns {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d8c3c3;
  border-radius: 10px;
  background-color: #f7e6e6;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:hover {
  background-color: #f0d4d4;
}

.btn:active {
  transform: scale(0.98);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-storage {
  background-color: #e4d4f1;
  border-color: #d0b8e8;
  color: #5e1e5e;
}

.btn-storage:hover {
  background-color: #d8c0e8;
}

.btn-github {
  background-color: #ffd4e4;
  border-color: #ffb8d0;
  color: #5e1e3a;
}

.btn-github:hover {
  background-color: #ffc0d8;
}

.btn-settings {
  background-color: #e8e8e8;
  border-color: #d0d0d0;
  color: #333;
}

.btn-settings:hover {
  background-color: #d8d8d8;
}



/* Detail buttons */
.details {
  margin-top: 4px;
  padding: 14px 14px 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  background-color: #fafafa;
}

.detail-title {
  margin: 0 0 12px;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.empty {
  padding: 10px 8px;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  text-align: center;
  font-size: 13px;
  color: #6b7280;
}

/* Generic field blocks */
.panel-header {
  margin: 12px 0 8px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}

.setting-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 12px;
}

.setting-item>span {
  font-weight: 600;
  color: #374151;
}

/* Form controls */
.details input[type="text"],
.details input[type="number"],
.details select,
.details textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #111827;
  font-size: 13px;
  box-sizing: border-box;
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;
}

.details input[type="color"] {
  width: 36px;
  height: 26px;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

/* Base danger button (legacy) */
.danger-btn {
  padding: 10px 12px;
  border: 1px solid #ef4444;
  color: #b91c1c;
  cursor: pointer;
  font-weight: 600;
}

/* Image preview */
.thumb {
  display: grid;
  gap: 8px;
}

.thumb-box {
  width: 100%;
  height: 120px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
}


/* Section panel */
.section-panel {
  padding: 12px;
  border: 1px solid #ececec;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .03);
}

.section-panel .panel-header {
  margin: 4px 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}

.section-panel .setting-item {
  gap: 8px;
  margin-bottom: 12px;
}

.section-panel .setting-item span {
  width: 100%;
  text-align: center;
  font-weight: 600;
}

.section-panel .setting-item select,
.section-panel .setting-item input[type="number"],
.section-panel .setting-item input[type="text"],
.section-panel .setting-item textarea {
  border-radius: 8px;
  border-color: #d1d5db;
}

.section-panel .setting-item select:focus,
.section-panel .setting-item input[type="number"]:focus,
.section-panel .setting-item input[type="text"]:focus,
.section-panel .setting-item textarea:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(147, 197, 253, .25);
}

.section-panel .setting-item input[type="color"] {
  width: 40px;
  height: 28px;
  border-radius: 8px;
}

.section-panel .thumb>span {
  font-size: 12px;
  color: #6b7280;
}

.section-panel .danger-btn {
  display: block;
  width: fit-content;
  margin: 10px auto 0;
  padding: 6px 14px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fee2e2;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #b91c1c;
  transition: background .2s ease, transform .1s ease;
}

.section-panel .danger-btn:hover {
  background: #fecaca;
}

.section-panel .danger-btn:active {
  transform: scale(0.98);
}

.section-panel .thumb .danger-btn {
  margin: 4px 0 0;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}

/* Tool card */
.tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 10px;
  border: 1px solid #ececec;
  border-radius: 10px;
  background: #fff;
}

.tool-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

/* Segmented buttons */
.seg {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.seg-btn {
  min-width: 36px;
  padding: 4px 10px;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  transition: background .15s ease;
}

.seg-btn+.seg-btn {
  border-left: 1px solid #d1d5db;
}

.seg-btn:hover {
  background: #e5e7eb;
}

.seg-btn.active {
  background: #e0e7ff;
  font-weight: 600;
}

/* Text block delete */
.delete-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 8px;
}

.delete-btn.small {
  padding: 4px 12px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fee2e2;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #b91c1c;
  transition: background .2s ease, transform .1s ease;
}

.delete-btn.small:hover {
  background: #fecaca;
}

.delete-btn.small:active {
  transform: scale(0.97);
}

/* Video Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to bottom, #f9fafb, #ffffff);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 28px;
  line-height: 1;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 24px;
}

.modal-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  color: #111827;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-input::placeholder {
  color: #9ca3af;
}

.modal-hint {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f0f9ff;
  border-left: 3px solid #3b82f6;
  border-radius: 8px;
}

.modal-hint p {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #1e40af;
}

.modal-hint ul {
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
}

.modal-hint li {
  margin: 4px 0;
  font-size: 12px;
  color: #1e40af;
  font-family: 'Courier New', monospace;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn-cancel {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.modal-btn-cancel:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.modal-btn-confirm {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.modal-btn-confirm:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.modal-btn-confirm:active {
  transform: translateY(0);
}

/* Image Modal Tab Styles */
.image-source-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 10px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tab-btn:hover:not(.active) {
  color: #374151;
}

.tab-content {
  animation: fadeIn 0.2s ease;
}

/* Upload Area Styles */
.upload-area {
  margin-top: 12px;
  padding: 32px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 48px;
  opacity: 0.6;
}

.upload-text {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.upload-subtext {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.upload-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.file-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  word-break: break-all;
}

.change-file-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-file-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}
</style>
