<template>
    <div class="editor-layout">
        <Headerbar class="header" />
        <CanvasArea ref="canvasArea" class="canvas" />
        <!-- To prevent errors, wrap the "addSection" function as a local function "L_addSection". -->
        <Sidebar class="sidebar" @add-section="L_addSection" @add-img="handleAddImage" @open-storage="showStorageManager = true" @open-settings="showSettings = true" />
        
        <!-- Storage Manager Modal -->
        <StorageManager v-if="showStorageManager" @close="showStorageManager = false" />
        
        <!-- Settings Panel Modal -->
        <SettingsPanel v-if="showSettings" @close="showSettings = false" />
    </div>
</template>

<script setup>
import Headerbar from './HeaderBar.vue'
import CanvasArea from './WorkCanvas.vue'
import Sidebar from './SideBar.vue'
import StorageManager from './StorageManager.vue'
import SettingsPanel from './SettingsPanel.vue'
import { useEditorStore } from '../stores/editorStore';
import { ref, onMounted, onUnmounted } from 'vue';

const store = useEditorStore()
const canvasArea = ref(null)
const imgPicker = ref(null)
const showStorageManager = ref(false)
const showSettings = ref(false)

const L_addSection = () => {
    store.addSection()
}

// Listen for open-settings event
const handleOpenSettings = () => {
    showSettings.value = true
}

onMounted(() => {
    document.addEventListener('open-settings', handleOpenSettings)
})

onUnmounted(() => {
    document.removeEventListener('open-settings', handleOpenSettings)
})
//add image
const handleAddImage = () => {
    const picker = document.createElement('input')
    picker.type = 'file'
    picker.accept = 'image/*'
    picker.onchange = e => {
        const file = e.target.files[0]
        if (!file) return
        
        // Use blob URL instead of base64 for better performance
        const url = URL.createObjectURL(file)
        store.addImageBlock(url)
    }
    picker.click()
}

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
