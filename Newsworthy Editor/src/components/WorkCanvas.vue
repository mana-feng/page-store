<template>
  <main class="canvas-area" ref="canvasRef" @click="store.notSelected">
    <div v-for="section in store.sections" :key="section.id" class="section-block"
      :class="{ 'checked': store.selected?.type === 'section' && store.selected?.sectionId === section.id }"
      :style="sectionStyle(section.props)" @click.stop="store.selectSection(section.id)">
      <!-- blocks -->
      <div v-for="blk in section.blocks" :key="blk.id" class="block-wrapper"
        :class="{ 'block-checked': store.selected?.type === blk.type && store.selected?.blockId === blk.id }"
        @click.stop="store.selectBlock(section.id, blk.id, blk.type)">
        <!-- Text Block -->
        <div v-if="blk.type === 'text'" class="text-wrpper"
          :style="{ maxWidth: blk.props?.width || '65ch', width: '100%', margin: '0 auto' }">
          <TipTapBlock v-model="blk.html" @focused="(ed) => {
            store.selectBlock(section.id, blk.id, blk.type);
            store.setActiveEditor(ed);
          }" />
        </div>

        <!-- Image Block -->
        <figure v-else-if="blk.type === 'image'" class="image-block">
          <img :src="blk.src" :style="{
            width: blk.width + 'px',
            height: blk.height + 'px',
            objectFit: blk.keepRatio ? 'contain' : 'fill',
            objectPosition: 'center',
            maxWidth: '100%'
          }" />
        </figure>

        <!-- Video Block -->
        <div v-else-if="blk.type === 'video'" class="video-block">
          <iframe 
            :width="blk.width" 
            :height="blk.height"
            :src="`https://www.youtube.com/embed/${blk.videoId}`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            :style="{
              maxWidth: '100%',
              borderRadius: '4px'
            }"
          ></iframe>
        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
import { useEditorStore } from '../stores/editorStore';
import { defineComponent, onMounted, onBeforeUnmount, watch, h, shallowRef, ref } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align';

const store = useEditorStore()
const canvasRef = ref(null)
const canvasWidth = ref(0)

onMounted(() => {
  if (canvasRef.value) {
    canvasWidth.value = canvasRef.value.clientWidth
  }
})

// TipTap
const TipTapBlock = defineComponent({
  name: 'TipTapBlock',
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue', 'focused'],
  setup(props, { emit }) {
    // Use responsive references to trigger re-rendering
    const editor = shallowRef(null)

    onMounted(() => {
      editor.value = new Editor({
        extensions: [
          StarterKit,
          // Link.configure({
          //   autolink: true,
          //   openOnClick: false,
          //   HTMLAttributes: {
          //     rel: 'noopener noreferrer',
          //     target: '_blank'
          //   }
          // }),
          TextAlign.configure({
            types: ['paragraph', 'heading'],
            alignments: ['left', 'center'] //only allow left and center align
          })
        ],
        content: props.modelValue || '<p></p>',
        onUpdate: ({ editor }) => {
          emit('update:modelValue', editor.getHTML())
        },
        onFocus: () => emit('focused', editor.value)
      })
      console.log('TipTap editor init:', editor.value)
    })

    // Synchronize content during external changes
    watch(() => props.modelValue, (v) => {
      const e = editor.value
      if (e && v !== e.getHTML()) {
        e.commands.setContent(v || '<p></p>', false)
      }
    })

    onBeforeUnmount(() => editor.value?.destroy())

    // Responsive rendering
    return () =>
      editor.value
        ? h(EditorContent, { editor: editor.value, class: 'prose max-w-none outline-none' })
        : null
  }
})

const sectionStyle = (p) => {
  const w = p.width || canvasWidth.value || 1200
  const h = p.height || 800
  const style = {
    width: w + 'px',
    minHeight: h + 'px',
    margin: '0 auto',
    boxSizing: 'border-box',
    position: 'relative',
    borderTop: '2px solid #e0e0e0',
    padding: '16px 0',
    overflow: 'visible', // image can fix section height, but limit at image part
    backgroundColor: p.background || '#ffffff',
  }



  if (p.bgType === 'img' && p.bgImg) {
    style.backgroundImage = `url(${p.bgImg})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
    style.backgroundRepeat = 'no-repeat'
  }

  return style
}

onBeforeUnmount(() => {
  if (canvasRef.value) {
    canvasWidth.value = canvasRef.value.clientWidth
  }
})
</script>

<style scoped>
.canvas-area {
  height: 100%;
  background-color: #b9b9b9;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.section-block {
  flex-shrink: 0;
  min-height: 200px;
  box-sizing: border-box;
  border-top: 2px solid #e0e0e0;
  padding-top: 16px;
}

/* highlight checked section */
.section-block.checked {
  outline: 2px solid #ffcaca;
  outline-offset: 2px;
}

.block-wrapper {
  padding: 10px 0;
}

.prose {
  background: transparent;
  border: 1px solid transparent;
  min-height: 50px;
  padding: 8px;
}

.block-checked {
  outline: 2px solid #8ab4ff;
  outline-offset: 2px;
}

.image-block {
  display: flex;
  justify-content: center;
  align-items: center;
}

.block-image {
  border-radius: 8px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.video-block {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}

.video-block iframe {
  border: none;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.text-wrapper {
  transition: max-width 0.25s ease;
  padding: 0.5rem 0;
}
</style>
