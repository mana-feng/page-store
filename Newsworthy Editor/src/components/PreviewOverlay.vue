<template>
    <!-- fullscream preview overlay -->
    <div class="preview-mask" @click.self="$emit('exit')">
        <div class="toolbar">
            <!-- exit buttom -->
            <button @click="$emit('exit')">Exit</button>

            <!-- device type -->
            <select v-model="selectedId">
                <option v-for="d in store.devices" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>

            <!-- output html file -->
            <button @click="exportHtml">Output HTML</button>
        </div>

        <!-- preview area -->
        <div class="viewport">
            <div class="device-shell" :style="shellStyle">
                <iframe class="device-iframe" :srcdoc="htmlForIframe"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
            </div>
        </div>



    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editorStore'

// receive html string to display in iframe
const props = defineProps({
    html: { type: String, required: true },
})

const emit = defineEmits(['exit'])
const store = useEditorStore()
const selectedId = computed({
    get: () => store.selectedDeviceId,
    set: (id) => store.selectDevice(id)
})

// control max text width in different device
const htmlForIframe = computed(() => {
    const mode = store.currentDevice.mode
    const caps = {
        pc: '65ch',
        tablet: '45ch',
        mobile: '30ch',
    }
    const css = `:root{ --device-text-max: ${caps[mode] || '65ch'}; }`
    return props.html.includes('</head>')
        ? props.html.replace('</head>', `<style id="device-overrides">${css}</style></head>`)
        : `<style id="device-overrides">${css}</style>` + props.html
})

// desktop:fullscreen; tablet pc/mobile: fixed width, full height
const shellStyle = computed(() => {
    const { w, mode } = store.currentDevice
    if (mode === 'pc') {
        return {
            width: '100%',
            height: '100%',
            transform: 'none',
            boxShadow: 'none',
            borderRadius: '0',
            background: 'transparent',
            padding: '0',
        }
    }
    return {
        width: w + 'px',
        height: '100vh',
        transform: 'none',
        boxShadow: '0 12px 48px rgba(0,0,0,.45)',
        borderRadius: '16px',
        background: '#000',
        padding: '18px',
    }
})

function exportHtml() {
  // Get current html
  const content = props.html

  // Using Blob to treat content as html file
  const blob = new Blob([content], { type: 'text/html' })

  // Generate download link
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  // Output file name
  a.download = 'preview.html'
  a.click()

  // Release resource
  URL.revokeObjectURL(url)
}

</script>

<style scoped>
.preview-mask {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 8px;
    background: #0b0e14e6;
}

.toolbar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px;
    background: #11141a;
    color: #e5e7eb;
    border-bottom: 1px solid #222;
}

.viewport {
    position: relative;
    background: #0f131a;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
}

.device-iframe {
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
    border-radius: 12px;
    display: block;
}
</style>
