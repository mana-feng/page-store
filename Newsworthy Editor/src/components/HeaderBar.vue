<template>
    <header class="header-bar">
        <h1 class="header-title">Immersive Long Form Multimedia Article Editor</h1>
        <div class="actions">
            <button class="preview-btn" @click="store.togglePreview">Preview</button>
        </div>
    </header>
</template>

<script setup>
import { useEditorStore } from '@/stores/editorStore'
const store = useEditorStore()
</script>

<style scoped>
.header-bar {
    background-color: #c77a7a;
    color: #111;
    padding: 16px 24px;
    border-bottom: 1px solid #b86e6e;
    display: flex;
    align-items: center;
    justify-content: center;
    justify-content: space-between;
    position: relative;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.header-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-align: center;
    flex: 1;
    text-shadow: 1px 1px 0 #fff4;
    ;
}

.actions {
    display: flex;
    align-items: center;
}

.preview-btn {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: #8b4444;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    transition: background 0.2s ease, transform 0.1s ease;
}

.preview-btn:hover {
    background: #9c5151;
    /* lighter on hover */
    transform: translateY(-1px);
}

.preview-btn:active {
    background: #7c3e3e;
    /* pressed tone */
    transform: translateY(0);
}
</style>