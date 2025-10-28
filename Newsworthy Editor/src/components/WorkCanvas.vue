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
        <div v-if="blk.type === 'text'" class="text-wrapper"
          :style="{ maxWidth: blk.props?.width || '65ch', width: '100%', margin: '0 auto' }">
          <TipTapBlock v-model="blk.html" @focused="(ed) => {
            store.selectBlock(section.id, blk.id, blk.type);
            store.setActiveEditor(ed);
          }" />
        </div>

        <!-- Image Block -->
        <figure v-else-if="blk.type === 'image'" class="image-block">
          <div class="image-grid">
            <div
              v-for="(img, i) in (Array.isArray(blk.images) ? blk.images : [blk])"
              :key="img.id || i"
              class="image-cell"
              :class="{
                'image-selected':
                  store.selected?.type === 'image' &&
                  store.selected?.blockId === blk.id &&
                  store.selected?.imageIndex === i,
                  'caption-right': img.captionPosition === 'right',
                  'caption-bubble': img.captionPosition === 'bubble',
                  'bubble-anim': img.captionPosition === 'bubble' && img.captionBubbleAnimated,
              }"
              @click.stop="store.selectBlock(section.id, blk.id, 'image', i)"
            >
              <img
                :src="img.src"
                :style="{
                  width: (img.width || 300) + 'px',
                  height: (img.height || 300) + 'px',
                  objectFit: img.keepRatio ? 'contain' : 'fill',
                  objectPosition: 'center',
                  maxWidth: '100%'
                }"
              />
              <figcaption v-if="img.caption" class="image-caption">
                {{ img.caption }}
              </figcaption>
            </div>
          </div>
        </figure>

        <!-- Fullwidth Image Block -->
        <figure
          v-else-if="blk.type === 'fullwidth-image'"
          class="fullwidth-image-block"
          :class="{
            'caption-bubble': blk.image.captionPosition === 'bubble',
            'bubble-anim': blk.image.captionPosition === 'bubble' && blk.image.captionBubbleAnimated,
          }"
          @click.stop="store.selectBlock(section.id, blk.id, 'fullwidth-image')"
        >
          <img
            :src="blk.image.src"
            class="fullwidth-image"
            :style="{
              width: '100%',
              display: 'block',
              objectFit: blk.image.mode === 'fixed' ? 'cover' : 'contain',
              height: blk.image.mode === 'fixed'
                ? blk.image.height + 'px'
                : 'auto',
            }"
          />
          <figcaption
            v-if="blk.image.caption"
            class="image-caption"
          >
            {{ blk.image.caption }}
          </figcaption>
        </figure>

        <!-- Float Image Block -->
        <figure
          v-else-if="blk.type === 'float-image'"
          class="float-image-block"
          :class="{
            'caption-right': blk.image.captionPosition === 'right',
            'caption-bubble': blk.image.captionPosition === 'bubble',
            'bubble-anim': blk.image.captionPosition === 'bubble' && blk.image.captionBubbleAnimated,
          }"
          @click.self.stop="store.selectBlock(section.id, blk.id, 'float-image')"
        >
          <div
            class="float-img-wrapper"
            :style="{
              width: blk.image.widthPercent + '%',
              float: blk.image.align,
              margin: blk.image.align === 'left' ? '0 16px 8px 0' : '0 0 8px 16px'
            }"
            @click.stop="store.selectBlock(section.id, blk.id, 'float-image', null, 'image')"
          >
            <img :src="blk.image.src" />

            <figcaption
              v-if="blk.image.caption"
              class="image-caption"
            >
              {{ blk.image.caption }}
            </figcaption>
          </div>

          <div class="float-image-text" @click.stop>
            <TipTapBlock
              v-model="blk.text"
              @focused="(ed) => {
                store.selectBlock(section.id, blk.id, 'float-image', null, 'text')
                store.setActiveEditor(ed)
              }"
            />
          </div>
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
import TextAlign from '@tiptap/extension-text-align';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/vue-3';

const store = useEditorStore()
const canvasRef = ref(null)

// TipTap
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: el => el.style.fontSize || null,
            renderHTML: attrs => {
              if (!attrs.fontSize) return {}
              return { style: `font-size: ${attrs.fontSize}` }
            }
          }
        }
      }
    ]
  }
})

const FontFamily = Extension.create({
  name: 'fontFamily',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: el => el.style.fontFamily || null,
            renderHTML: attrs => {
              if (!attrs.fontFamily) return {}
              return { style: `font-family: ${attrs.fontFamily}` }
            }
          }
        }
      }
    ]
  }
})

const DropcapStyle = Extension.create({
  name: 'dropcapStyle',
  addGlobalAttributes() {
    const attr = k => ({
      default: null,
      parseHTML: el => el.style?.[k] || null,
      renderHTML: attrs => (attrs[k] ? { style: `${k}: ${attrs[k]}` } : {}),
    })
    return [{
      types: ['textStyle'],
      attributes: {
        float: attr('float'),
        display: attr('display'),
        lineHeight: attr('lineHeight'),
        marginRight: attr('marginRight'),
        marginTop: attr('marginTop'),
        fontWeight: attr('fontWeight'),
      },
    }]
  },
})

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
          TextAlign.configure({
            types: ['paragraph', 'heading'],
            alignments: ['left', 'center'] //only allow left and center align
          }),
          TextStyle,
          Color,
          FontSize,
          FontFamily,
          DropcapStyle,
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
  const h = p.height || 800
  const style = {
    width: '100%',
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
</script>

<style scoped>
.canvas-area {
  width: 100%;
  height: 100%;
  background-color: #b9b9b9;
  overflow-y: auto;

  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.section-block {
  width: 100%;
  flex-shrink: 0;
  min-height: 200px;
  box-sizing: border-box;
  border-top: 2px solid #e0e0e0;
  padding-top: 16px;
}

.section-block img,
.section-block video {
  max-width: 100%;
  height: auto;
  display: block;
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

.image-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.image-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}


.image-cell.caption-right {
  flex-direction: row;
  align-items: center;
}


.image-cell.caption-right .image-caption {
  margin-left: 8px;
  margin-top: 0;
  text-align: left;
  max-width: 180px;
}

.image-cell.caption-bubble {
  position: relative;
}

.image-cell.caption-bubble .image-caption {
  display: none;
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 0.85rem;
  line-height: 1.3;
  padding: 6px 10px;
  border-radius: 8px;
  max-width: 80%;
  text-align: left;
  pointer-events: none;
  transition: opacity 0.2s ease;
  opacity: 0;
  z-index: 2;
}

.image-cell.caption-bubble:hover .image-caption {
  display: block;
  opacity: 1;
}

.image-selected {
  outline: 2px solid #8ab4ff;
  outline-offset: 2px;
}

.image-caption {
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
  text-align: center;
  font-style: italic;
}

.image-cell.caption-bubble.bubble-anim .image-caption {
  display: block;
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px);
  transition: opacity .2s ease, transform .2s ease, visibility 0s linear .2s;
}

.image-cell.caption-bubble.bubble-anim:hover .image-caption {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity .2s ease, transform .2s ease, visibility 0s;
}

.fullwidth-image-block {
  width: 100%;
  display: block;
  position: relative;
  margin: 12px 0;
}

.fullwidth-image.auto {
  width: 100%;
  height: auto;
  display: block;
}

.fullwidth-image.fixed {
  width: 100%;
  display: block;
  object-fit: cover;
}

.fullwidth-caption {
  font-size: 0.9rem;
  color: #666;
  margin-top: 6px;
  text-align: center;
  font-style: italic;
}

/* same as image part */

.fullwidth-image-block .image-caption {
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
  text-align: center;
  font-style: italic;
}

.fullwidth-image-block.caption-bubble {
  position: relative;
}

.fullwidth-image-block.caption-bubble .image-caption {
  display: none;
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 0.85rem;
  line-height: 1.3;
  padding: 6px 10px;
  border-radius: 8px;
  max-width: 80%;
  text-align: left;
  pointer-events: none;
  transition: opacity 0.2s ease;
  opacity: 0;
  z-index: 2;
}

.fullwidth-image-block.caption-bubble:hover .image-caption {
  display: block;
  opacity: 1;
}

.fullwidth-image-block.caption-bubble.bubble-anim .image-caption {
  display: block;
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px);
  transition: opacity .2s ease, transform .2s ease, visibility 0s linear .2s;
}

.fullwidth-image-block.caption-bubble.bubble-anim:hover .image-caption {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity .2s ease, transform .2s ease, visibility 0s;
}

/* Float Image Block */
.float-image-block {
  display: block;
  margin: 1em 0;
  overflow: hidden;
}

.float-img-wrapper {
  display: block;
  max-width: 70%;
}

.float-image-block img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
}

.float-image-text {
  overflow: hidden;
  font-size: 1rem;
  line-height: 1.6;
}

.image-caption {
  font-size: 0.85rem;
  color: #666;
  margin: 4px 0 0;
}

.float-image-block.block-checked {
  outline: 2px solid #8ab4ff;
  outline-offset: 2px;
}

.float-image-text { overflow: hidden; }

/* float image caption */
.float-img-wrapper { position: relative; }

.float-image-block.caption-right .float-img-wrapper {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.float-image-block.caption-right .image-caption {
  margin-left: 8px;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
  text-align: left;
}

.float-image-block.caption-bubble {
  position: relative;
}

.float-image-block.caption-bubble .image-caption {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: none;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 0.85rem;
  line-height: 1.3;
  padding: 6px 10px;
  border-radius: 8px;
  max-width: 80%;
  text-align: left;
  pointer-events: none;
  transition: opacity 0.2s ease;
  opacity: 0;
  z-index: 2;
}

.float-image-block.caption-bubble:hover .image-caption {
  display: block;
  opacity: 1;
}

.float-image-block.caption-bubble.bubble-anim .image-caption {
  display: block;
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px);
  transition: opacity .2s ease, transform .2s ease, visibility 0s linear .2s;
}

.float-image-block.caption-bubble.bubble-anim:hover .image-caption {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity .2s ease, transform .2s ease, visibility 0s;
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

:deep(.ProseMirror) {
  display: block;
  overflow: visible;
}

:deep(.prose p) {
  margin: 0 0 1em !important;
  clear: none !important;
  line-height: 1.6;
}

:deep(.ProseMirror p) {
  margin: 0 0 1em;
  clear: none;
  line-height: 1.6;
}

</style>
