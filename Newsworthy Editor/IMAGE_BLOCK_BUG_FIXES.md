# 🐛 Add Image Block Bug Fixes Report

## 修复时间
2025-10-26

## 修复的 Bug 列表

### ✅ Bug #1: 按钮缺少禁用状态检查
**文件**: `src/components/SideBar.vue`

**问题**: 
- "Add Img Block" 按钮没有检查是否已选择 section
- 用户可以在没有 section 的情况下打开文件选择器，但图片无法添加
- 造成用户困惑，体验不佳

**修复**:
```vue
<!-- Before -->
<button class="btn" @click="$emit('add-img')">+ Add Img Block</button>

<!-- After -->
<button class="btn" @click="$emit('add-img')" :disabled="!store.currSection">+ Add Img Block</button>
```

**影响**: 
- 按钮现在会在没有选择 section 时自动禁用
- 提供清晰的视觉反馈，与 "Add Text Block" 行为一致

---

### ✅ Bug #2: 图片加载失败没有错误处理
**文件**: `src/stores/editorStore.js`

**问题**:
- `addImageBlock()` 函数只处理了 `onload` 事件
- 没有 `onerror` 处理
- 如果图片损坏或格式不支持，用户没有任何反馈

**修复**:
```javascript
// Added error handling
img.onerror = () => {
    alert('❌ Failed to load image. Please try another file.');
    console.error('Image load error:', src);
};
```

**额外改进**:
- 添加了 `_blobUrl` 属性来跟踪 blob URL，便于后续清理
- 在没有选择 section 时显示警告提示

**影响**:
- 用户现在会收到清晰的错误提示
- 开发者可以在控制台看到详细的错误信息

---

### ✅ Bug #3: 替换图片时的内存泄漏
**文件**: `src/components/SideBar.vue` - `replaceImage()` 函数

**问题**:
- 每次替换图片时创建新的 blob URL
- 没有释放旧的 blob URL
- 没有重新计算图片尺寸和宽高比
- 长期使用会导致内存泄漏

**修复**:
```javascript
function replaceImage() {
  // ... file picker setup ...
  
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
  
  // Load image to get natural dimensions
  const img = new Image()
  img.onload = () => {
    const naturalW = img.naturalWidth || 300
    const naturalH = img.naturalHeight || 300
    const ratio = naturalW / naturalH || 1
    
    // Update block with new image
    blk.src = url
    blk._blobUrl = url
    blk.aspectRatio = ratio
    
    // Recalculate dimensions maintaining aspect ratio
    if (blk.keepRatio) {
      blk.height = Math.round(blk.width / ratio)
    }
  }
  
  img.onerror = () => {
    URL.revokeObjectURL(url)
    alert('❌ Failed to load image. Please try another file.')
  }
  
  img.src = url
}
```

**影响**:
- 修复内存泄漏问题
- 替换图片时自动重新计算宽高比
- 保持图片显示正确，不会失真

---

### ✅ Bug #4: 删除时没有清理 Blob URL
**文件**: `src/stores/editorStore.js` - `deleteSelected()` 函数

**问题**:
- 删除 section 或 image block 时没有释放 blob URL
- 造成内存泄漏

**修复**:
```javascript
// Clean up blob URLs when deleting section
const section = sections.value.find(s => s.id === selected.value.sectionId)

// Clean up section background blob URL
if (section?.props?._blobUrl && section.props._blobUrl.startsWith('blob:')) {
  try { URL.revokeObjectURL(section.props._blobUrl) } catch { ; }
}

// Clean up all image blocks' blob URLs
section?.blocks?.forEach(block => {
  if (block.type === 'image' && block._blobUrl && block._blobUrl.startsWith('blob:')) {
    try { URL.revokeObjectURL(block._blobUrl) } catch { ; }
  }
})

// Similar cleanup for individual block deletion
```

**影响**:
- 防止内存泄漏
- 正确释放浏览器资源

---

### ✅ Bug #5: Blob URL 导出问题
**文件**: `src/stores/editorStore.js` 和 `src/components/VisualEditor.vue`

**问题 1**: Blob URL 在导出后无效
- 用户上传的图片使用 blob URL
- 导出 HTML 后，blob URL 会失效
- 导出的 HTML 文件无法显示图片

**问题 2**: 使用 Base64 导致文件过大
- 原代码使用 `FileReader.readAsDataURL()` 转换为 base64
- Base64 会使文件大小增加约 33%
- 多张图片会让 HTML 文件巨大

**修复**:

**第一步 - 使用 Blob URL 而不是 Base64**:
```javascript
// src/components/VisualEditor.vue
const handleAddImage = () => {
  // ... file picker ...
  
  // Before: 使用 base64
  // const reader = new FileReader()
  // reader.onload = ev => {
  //     store.addImageBlock(ev.target.result)
  // }
  // reader.readAsDataURL(file)
  
  // After: 使用 blob URL
  const url = URL.createObjectURL(file)
  store.addImageBlock(url)
}
```

**第二步 - 导出时转换 Blob URL 为 Base64**:
```javascript
// src/stores/editorStore.js
const blobUrlToBase64 = async (blobUrl) => {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Failed to convert blob URL to base64:', err);
    return blobUrl;
  }
};

const exportToHTML = async () => {
  // Clone sections and convert all blob URLs to base64
  const sectionsClone = JSON.parse(JSON.stringify(sections.value));
  
  for (const section of sectionsClone) {
    // Convert section background
    if (section.props?.bgImg && section.props.bgImg.startsWith('blob:')) {
      section.props.bgImg = await blobUrlToBase64(section.props.bgImg);
    }
    
    // Convert image blocks
    if (section.blocks) {
      for (const block of section.blocks) {
        if (block.type === 'image' && block.src && block.src.startsWith('blob:')) {
          block.src = await blobUrlToBase64(block.src);
        }
      }
    }
  }
  
  // Generate HTML with converted images...
};
```

**第三步 - 更新异步函数调用**:
```javascript
// All export functions are now async
const downloadHTML = async () => {
  const htmlContent = await exportToHTML();
  // ...
};

const generateIframeCode = async () => {
  const htmlContent = await exportToHTML();
  // ...
};

// src/components/SideBar.vue
const htmlContent = await store.generateHTML()
```

**影响**:
- ✅ 编辑时使用 blob URL，性能更好，内存占用更少
- ✅ 导出时自动转换为 base64，确保图片在导出的 HTML 中正常显示
- ✅ 两全其美：编辑时高效，导出时完整

---

## 总结

### 修改的文件
1. `src/components/SideBar.vue` - 按钮禁用、图片替换优化
2. `src/stores/editorStore.js` - 错误处理、内存管理、导出优化
3. `src/components/VisualEditor.vue` - 改用 blob URL

### 性能提升
- ✅ 消除内存泄漏
- ✅ 编辑时性能更好（blob URL vs base64）
- ✅ 更好的错误处理和用户反馈

### 用户体验改进
- ✅ 按钮状态更清晰
- ✅ 错误提示更友好
- ✅ 图片替换更智能
- ✅ 导出的 HTML 文件可正常使用

### 技术改进
- ✅ 正确的资源清理
- ✅ 异步操作处理
- ✅ 完整的错误处理链

## 测试建议

1. **添加图片**:
   - [ ] 在没有 section 时按钮应该被禁用
   - [ ] 添加正常图片应该成功
   - [ ] 添加损坏的文件应该显示错误提示

2. **替换图片**:
   - [ ] 替换图片应该保持宽高比（如果启用）
   - [ ] 多次替换应该不会造成内存泄漏

3. **删除操作**:
   - [ ] 删除图片 block 应该清理资源
   - [ ] 删除 section 应该清理所有图片资源

4. **导出功能**:
   - [ ] 导出的 HTML 应该能正常显示所有图片
   - [ ] GitHub Pages 上传应该成功
   - [ ] 下载的 HTML 文件应该可以独立使用

## 向后兼容性

- ✅ 所有更改向后兼容
- ✅ 现有功能不受影响
- ✅ 用户数据不会丢失

