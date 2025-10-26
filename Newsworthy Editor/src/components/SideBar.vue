<template>
  <aside class="sidebar">
    <div class="side-title">Sidebar</div>

    <div class="btns">
      <button class="btn" @click="$emit('add-section')">+ Add New Section</button>
      <button class="btn" @click="store.addTextBlock" :disabled="!store.currSection">+ Add Text Block</button>
      <button class="btn" @click="$emit('add-img')" :disabled="!store.currSection">+ Add Img Block</button>
      <button class="btn" @click="$emit('add-parallax')">+ Add Parallax</button>
      <button class="btn btn-github" @click="handleSaveToGitHub">🚀 Save to GitHub Pages</button>
      <button class="btn btn-storage" @click="$emit('open-storage')">📚 Storage Manager</button>
      <button class="btn btn-settings" @click="$emit('open-settings')">⚙️ Settings</button>
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
    </div>
  </aside>
</template>


<script setup>
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editorStore'

const store = useEditorStore()
const curr = computed(() => store.currSection)

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
    const response = await fetch('http://localhost:3001/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        filename,
        html_content: htmlContent,
        group_id: null
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.github_url) {
        alert(`✅ Successfully saved to GitHub Pages!\n\n🌐 URL: ${data.github_url}\n\n📋 The URL has been copied to your clipboard.`)
        // Copy URL to clipboard
        navigator.clipboard.writeText(data.github_url).catch(() => {})
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
</style>
