<template>
    <div class="editor-layout">
        <Headerbar class="header" />
        <CanvasArea ref="canvasArea" class="canvas" />
        <Sidebar class="sidebar" 
            @add-section="L_addSection" 
            @open-storage="showStorageManager = true" 
            @open-settings="showSettings = true" />
        <PreviewOverlay v-if="store.isPreview" :html="htmlDoc" @exit="store.stopPreview" />
        
        <!-- Storage Manager Modal -->
        <StorageManager v-if="showStorageManager" @close="showStorageManager = false" />
        
        <!-- Settings Panel Modal -->
        <SettingsPanel v-if="showSettings" @close="showSettings = false" />
    </div>
</template>

<script setup>
import PreviewOverlay from './PreviewOverlay.vue'
import { buildHtml } from '@/utils/buildHtml'
import Headerbar from './HeaderBar.vue'
import CanvasArea from './WorkCanvas.vue'
import Sidebar from './SideBar.vue'
import StorageManager from './StorageManager.vue'
import SettingsPanel from './SettingsPanel.vue'
import { useEditorStore } from '../stores/editorStore';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const store = useEditorStore()
const canvasArea = ref(null)
const showStorageManager = ref(false)
const showSettings = ref(false)

const htmlDoc = computed(() => buildHtml(store.sections))

const L_addSection = () => {
    store.addSection()
}

// press ESC to exit preview mode
function onKey(e) {
    if (e.key === 'Escape' && store.isPreview) store.stopPreview()
}

// Listen for open-settings event
const handleOpenSettings = () => {
    showSettings.value = true
}

onMounted(() => {
    window.addEventListener('keydown', onKey)
    document.addEventListener('open-settings', handleOpenSettings)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKey)
    document.removeEventListener('open-settings', handleOpenSettings)
})

</script>

<style scoped>
.editor-layout {
    height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr 200px;
    grid-template-areas:
        "header header"
        "canvas sidebar";
    background-color: #fafafa;
}

.header {
    grid-area: header;
}

.canvas {
    grid-area: canvas;
}

.sidebar {
    grid-area: sidebar;
}

.canvas {
    overflow: auto;
    border-top: 1px solid #eee;
}

.sidebar {
    overflow: auto;
    border-left: 1px solid #eee;
    background-color: #f6d4d4;
}
</style>
