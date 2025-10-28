<!-- src/components/ImageSettingsPanel.vue -->
<template>
  <div class="mt-4 rounded bg-white/70 p-3">
    <div class="panel-header">{{ title || 'Image Settings' }}</div>

    <!-- normal image -->
    <div class="setting-item" v-if="!isFullWidth">
      <label>Width: {{ image.width ?? 300 }}px</label>
      <input
        type="range" min="50" max="1200" step="10"
        :value="image.width ?? 300"
        @input="$emit('updateWidth', $event.target.value)"
      />
    </div>

    <div class="setting-item" v-if="!isFullWidth">
      <label>Height: {{ image.height ?? 300 }}px</label>
      <input
        type="range" min="50" max="1200" step="10"
        :value="image.height ?? 300"
        @input="$emit('updateHeight', $event.target.value)"
      />
    </div>

    <div class="setting-item" v-if="!isFullWidth">
      <label class="inline-flex items-center gap-2">
        <input
          type="checkbox"
          :checked="!!image.keepRatio"
          @change="$emit('updateKeepRatio', $event.target.checked)"
        />
        Keep Aspect Ratio
      </label>
    </div>

    <!-- Full-Width image-->
    <div v-if="isFullWidth" class="setting-item">
      <label>Size Mode</label>
      <select
        :value="image.mode || 'auto'"
        @change="$emit('updateMode', $event.target.value)"
      >
        <option value="auto">Auto (fit by image ratio)</option>
        <option value="fixed">Fixed (crop with height)</option>
      </select>
    </div>

    <div v-if="isFullWidth && image.mode === 'fixed'" class="setting-item">
      <label>Height: {{ image.height || 400 }}px</label>
      <input
        type="range" min="120" max="1200" step="10"
        :value="image.height || 400"
        @input="$emit('updateHeight', $event.target.value)"
      />
    </div>

    <!-- Caption -->
    <div class="setting-item">
      <label>Caption</label>
      <textarea
        rows="2"
        :value="image.caption || ''"
        placeholder="Enter caption (optional)…"
        @input="$emit('updateCaption', $event.target.value)"
      />
    </div>

    <!-- Caption -->
    <div class="setting-item">
      <label>Caption Position</label>
      <select
        :value="image.captionPosition || 'bottom'"
        @change="$emit('updateCaptionPosition', $event.target.value)"
      >
        <option value="bottom">Below Image</option>
        <option value="right">Right of Image</option>
        <option value="bubble">Bubble on Hover</option>
      </select>
    </div>

    <!-- Bubble animate-->
    <div class="setting-item" v-if="image.captionPosition === 'bubble'">
      <label class="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          :checked="!!image.captionBubbleAnimated"
          @change="$emit('updateCaptionBubbleAnimated', $event.target.checked)"
        />
        Animate bubble
      </label>
    </div>

    <div class="flex gap-2">
      <button class="btn" @click="$emit('replaceImage')">Replace Image</button>
      <button class="btn btn-danger" @click="$emit('deleteImage')">Delete</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  model: { type: Object, required: true },
  title: { type: String, default: 'Image Settings' },
})

const image = computed(() => {
  const m = props.model || {}
  return m.image ?? m
})

const isFullWidth = computed(() => {
  const img = image.value || {}
  return Object.prototype.hasOwnProperty.call(img, 'mode')
})
</script>

<style scoped>
.panel-header { margin: 4px 0 10px; font-size: 13px; font-weight: 700; color: #374151; }
.setting-item { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; font-size: 12px; }
.btn { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; }
.btn-danger { border-color: #fecaca; background: #fee2e2; color: #b91c1c; }
</style>
