import { defineStore } from "pinia";
import { ref, computed, shallowRef } from "vue";

export const useEditorStore = defineStore('editor', () => {
    // stored all sections
    const sections = ref([])

    // selected object
    const selected = ref({
        type: null, // section/text/img/video
        sectionId: null,
        blockId: null, // id of imgblock or text block
        imageIndex: null, // only for mult images
        part: null, // float block
    })

    // current selected TipTap editor
    const activeEditor = shallowRef(null)
    const setActiveEditor = (ed) => {
        activeEditor.value = ed
    }

    // add a empty new section
    const addSection = () => {
        sections.value.push({
            id: Date.now(),
            type: 'section',
            blocks: [], // the info stored for blocks
            props: {
                height: 300,
                bgType: 'color',
                background: '#ffffff',
                bgImg: '',
                bgVideo: '',
                _blobUrl: '',
            }
        })
    }

    // add a text block
    const addTextBlock = () => {
        const sec = currSection.value;
        if (!sec) return;
        const newBlock = {
            id: Date.now(),
            type: 'text',
            html: '<p>New text block…</p>',
            align: 'left',
            props: {
                width: '65ch'
            }
        };
        sec.blocks.push(newBlock);
        selected.value = { type: 'text', sectionId: sec.id, blockId: newBlock.id };
    };

    const addImageBlock = (src) => {
        const sec = currSection.value;
        if (!sec) {
            alert('⚠️ Please select a section first!');
            return;
        }

      const imgEl = new Image()
      imgEl.onload = () => {
        const naturalW = imgEl.naturalWidth || 300
        const naturalH = imgEl.naturalHeight || 300
        const ratio = naturalW / naturalH || 1

        const imageObj = {
          id: Date.now() + Math.random(),
          src,
          width: Math.min(300, naturalW),
          height: Math.min(300, naturalH),
          aspectRatio: ratio,
          keepRatio: true,
          caption: '',
          captionPosition: 'bottom',
          captionBubbleAnimated: false,

        }

        const blk = currBlock.value
        if (blk && blk.type === 'image') {
          ensureImagesArray(blk)
          if (blk.images.length < 4) {
            blk.images.push(imageObj)
            selected.value = { type: 'image', sectionId: sec.id, blockId: blk.id, imageIndex: blk.images.length - 1 }
            return
          }
        }

        const newBlock = {
          id: Date.now(),
          type: 'image',
          images: [imageObj],
          layout: 'inline'
        }
        sec.blocks.push(newBlock)
        selected.value = { type: 'image', sectionId: sec.id, blockId: newBlock.id, imageIndex: 0 }
      }
      imgEl.src = src
    };

    // Helper function to extract YouTube video ID from various URL formats
    const extractYouTubeId = (url) => {
        if (!url) return null;
        
        // Remove whitespace
        url = url.trim();
        
        // Pattern 1: https://www.youtube.com/watch?v=VIDEO_ID (standard video)
        let match = url.match(/[?&]v=([^&]+)/);
        if (match) return match[1];
        
        // Pattern 2: https://youtu.be/VIDEO_ID (short link)
        match = url.match(/youtu\.be\/([^?&]+)/);
        if (match) return match[1];
        
        // Pattern 3: https://www.youtube.com/embed/VIDEO_ID (embed)
        match = url.match(/youtube\.com\/embed\/([^?&]+)/);
        if (match) return match[1];
        
        // Pattern 4: https://www.youtube.com/v/VIDEO_ID (old format)
        match = url.match(/youtube\.com\/v\/([^?&]+)/);
        if (match) return match[1];
        
        // Pattern 5: https://www.youtube.com/shorts/VIDEO_ID (YouTube Shorts)
        match = url.match(/youtube\.com\/shorts\/([^?&]+)/);
        if (match) return match[1];
        
        // Pattern 6: https://www.youtube.com/live/VIDEO_ID (live streams)
        match = url.match(/youtube\.com\/live\/([^?&]+)/);
        if (match) return match[1];
        
        // Pattern 7: https://m.youtube.com/... (mobile links)
        match = url.match(/m\.youtube\.com\/watch\?v=([^&]+)/);
        if (match) return match[1];
        
        // If it's just the video ID (11 characters)
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            return url;
        }
        
        return null;
    };

    // Add a video block
    const addVideoBlock = (url) => {
        console.log('🎬 addVideoBlock called with URL:', url);
        
        const sec = currSection.value;
        console.log('📋 Current section:', sec);
        
        if (!sec) {
            alert('⚠️ Please select a section first!');
            return;
        }

        // Extract YouTube video ID
        const videoId = extractYouTubeId(url);
        console.log('🆔 Extracted video ID:', videoId);
        
        if (!videoId) {
            alert('❌ Invalid YouTube URL. Please enter a valid YouTube video link.');
            return;
        }

        // Default 16:9 aspect ratio for videos
        const defaultWidth = 560;
        const defaultHeight = 315;

        const newBlock = {
            id: Date.now(),
            type: 'video',
            url: url,
            videoId: videoId,
            width: defaultWidth,
            height: defaultHeight,
            aspectRatio: 16 / 9,
            keepRatio: true,
        };

        console.log('✅ Adding video block:', newBlock);
        sec.blocks.push(newBlock);
        selected.value = { type: 'video', sectionId: sec.id, blockId: newBlock.id };
        console.log('✅ Video block added successfully');
    };

    // change img
    const setImgKeepRatio = (v) => {
      const img = currImage.value
      if (!img) return
      img.keepRatio = !!v
    }

    const setImgWidth = (w) => {
      const img = currImage.value
      if (!img) return
      const width = Math.max(1, parseInt(w || 0, 10))
      if (img.keepRatio && img.aspectRatio) {
        img.width = width
        img.height = Math.round(width / img.aspectRatio)
      } else {
        img.width = width
      }
    }

    const setImgHeight = (h) => {
      const img = currImage.value
      if (!img) return
      const height = Math.max(1, parseInt(h || 0, 10))
      if (img.keepRatio && img.aspectRatio) {
        img.height = height
        img.width = Math.round(height * img.aspectRatio)
      } else {
        img.height = height
      }
    };

    const setImgCaption = (text) => {
      const img = currImage.value
      if (!img) return
      img.caption = text ?? ''
    }

    const setImgCaptionPosition = (pos) => {
      const img = currImage.value
      if (!img) return
      img.captionPosition = pos
    }

    const setImgCaptionBubbleAnimated = (v) => {
      const img = currImage.value
      if (!img) return
      img.captionBubbleAnimated = !!v
    }
    // Video block controls
    const setVideoUrl = (url) => {
        const blk = currBlock.value;
        if (!blk || blk.type !== 'video') return;
        
        const videoId = extractYouTubeId(url);
        if (!videoId) {
            alert('❌ Invalid YouTube URL');
            return;
        }
        
        blk.url = url;
        blk.videoId = videoId;
    };

    const setVideoWidth = (w) => {
        const blk = currBlock.value;
        if (!blk || blk.type !== 'video') return;
        const width = Math.max(1, parseInt(w || 0, 10));
        if (blk.keepRatio && blk.aspectRatio) {
            blk.width = width;
            blk.height = Math.round(width / blk.aspectRatio);
        } else {
            blk.width = width;
        }
    };

    const setVideoHeight = (h) => {
        const blk = currBlock.value;
        if (!blk || blk.type !== 'video') return;
        const height = Math.max(1, parseInt(h || 0, 10));
        if (blk.keepRatio && blk.aspectRatio) {
            blk.height = height;
            blk.width = Math.round(height * blk.aspectRatio);
        } else {
            blk.height = height;
        }
    };

    const setVideoKeepRatio = (v) => {
        const blk = currBlock.value;
        if (!blk || blk.type !== 'video') return;
        blk.keepRatio = !!v;
    };

    // when user click section
    const selectSection = (sectionId) => {
      selected.value = { type: 'section', sectionId, blockId: null, imageIndex: null, part: null };
    }

    // click text or img block
    const selectBlock = (sectionId, blockId, blockType, imageIndex = null, part = null) => {
      selected.value = { type: blockType, sectionId, blockId, imageIndex, part };

      console.log('selectBlock:', { sectionId, blockId, blockType, imageIndex, part });
      console.log('store.selected after set:', JSON.parse(JSON.stringify(selected.value)));

    }

    // click nothing
    const notSelected = () => {
      selected.value = { type: null, sectionId: null, blockId: null, imageIndex: null, part: null };
      activeEditor.value = null;
    }


    // get section
    const currSection = computed(() => {
        if (!selected.value.sectionId)
            return null;
        return sections.value.find(s => s.id === selected.value.sectionId) || null;
    })

    // change background type
    const setSecType = (type) => {
        if (!currSection.value)
            return;
        currSection.value.props.bgType = type;
    }

    // change background color of section
    const setSecBg = (color) => {
        if (!currSection.value)
            return;
        currSection.value.props.background = color;
        currSection.value.props.bgType = 'color';
    }

    // change section height
    const setSecHeight = (h) => {
        if (!currSection.value)
            return;
        currSection.value.props.height = h;
    }

    // get img
    const setSecBgImg = (url) => {
        const s = currSection.value;
        if (!s)
            return;
        if (s.props._blobUrl && s._blobUrl !== url && s.props._blobUrl.startsWith('blob:')) {
            try { URL.revokeObjectURL(s._blobUrl) } catch { ; }
        }

        s.props.bgImg = url;
        s.props.bgType = 'img'
        s.props._blobUrl = url && url.startsWith('blob:') ? url : ''
    }

    const revokeAllBlobs = () => {
        sections.value.forEach(s => {
            const u = s.props?._blobUrl
            if (u && u.startsWith('blob:')) {
                try { URL.revokeObjectURL(u) } catch { ; }
                s.props._blobUrl = ''
            }
        })
    }

    const currImage = computed(() => {
      const blk = currBlock.value
      if (!blk || blk.type !== 'image') return null

      if (!Array.isArray(blk.images)) return blk

      const idx = selected.value.imageIndex ?? 0
      return blk.images[idx] || null
    })

    const ensureImagesArray = (blk) => {
      if (!blk || blk.type !== 'image') return
      if (Array.isArray(blk.images)) {
        blk.images.forEach(img => {
          if (img && img.captionPosition == null) {
            img.captionPosition = 'bottom'
          }
        })
        return
      }

      const { src, width, height, aspectRatio, keepRatio, caption, captionPosition, captionBubbleAnimated } = blk
      const img = src ? {
        id: Date.now(),
        src,
        width,
        height,
        aspectRatio,
        keepRatio,
        caption: caption || '',
        captionPosition: captionPosition || 'bottom',
        captionBubbleAnimated: captionBubbleAnimated || false,
      } : null

      blk.images = img ? [img] : []

      delete blk.src
      delete blk.width
      delete blk.height
      delete blk.aspectRatio
      delete blk.keepRatio
      delete blk.caption
      delete blk.captionPosition
    }

      const addFullWidthImageBlock = (src) => {
        const sec = currSection.value
        if (!sec) return

        const imgEl = new Image()
        imgEl.onload = () => {
          const naturalW = imgEl.naturalWidth || 1
          const naturalH = imgEl.naturalHeight || 1
          const aspectRatio = naturalW / naturalH

          const blk = {
            id: Date.now(),
            type: 'fullwidth-image',
            image: {
              id: Date.now() + Math.random(),
              src,
              aspectRatio,
              captionPosition: 'bottom',
              captionBubbleAnimated: false,
              mode: 'auto',
              height: 400,      // only in mode='fixed'
              caption: '',
            }
          }

          sec.blocks.push(blk)
          selected.value = { type: 'fullwidth-image', sectionId: sec.id, blockId: blk.id }
        }
        imgEl.src = src
      }

      const setFullWidthImgMode = (mode) => {
        const blk = currBlock.value
        if (blk && blk.type === 'fullwidth-image') {
          blk.image.mode = mode === 'fixed' ? 'fixed' : 'auto'
        }
      }

      const setFullWidthImgHeight = (h) => {
        const blk = currBlock.value
        if (blk && blk.type === 'fullwidth-image') {
          blk.image.height = Math.max(50, parseInt(h || 0, 10))
        }
      }

      const setFullWidthImgCaption = (text) => {
        const blk = currBlock.value
        if (blk && blk.type === 'fullwidth-image') {
          blk.image.caption = text ?? ''
        }
      }

      const setFullWidthImgCaptionPosition = (pos) => {
        const blk = currBlock.value
        if (blk && blk.type === 'fullwidth-image') blk.image.captionPosition = pos
      }

      const setFullWidthImgCaptionBubbleAnimated = (v) => {
        const blk = currBlock.value
        if (blk && blk.type === 'fullwidth-image') blk.image.captionBubbleAnimated = !!v
      }

      // Float Image Block
      const addFloatImageBlock = (src) => {
        const sec = currSection.value;
        if (!sec) return;

        const blk = {
          id: Date.now(),
          type: 'float-image',
          image: {
            id: Date.now() + Math.random(),
            src,
            align: 'right',
            widthPercent: 45,
            keepRatio: true,
            aspectRatio: 1,
            caption: '',
          },
          text: '<p>Enter your text here…</p>',
        };

        sec.blocks.push(blk);
        selected.value = { type: 'float-image', sectionId: sec.id, blockId: blk.id };
      };

      const setFloatImgAlign = (align) => {
        const blk = currBlock.value;
        if (blk && blk.type === 'float-image') blk.image.align = align;
      };

      // change float image width
      const setFloatImgWidth = (w) => {
        const blk = currBlock.value;
        if (!blk || blk.type !== 'float-image') return;
        const n = Number(w);
        const clamped = Math.max(20, Math.min(70, isNaN(n) ? 45 : n));
        blk.image.widthPercent = clamped;
      };


      // change float image caption
      const setFloatImgCaption = (text) => {
        const blk = currBlock.value;
        if (blk && blk.type === 'float-image') blk.image.caption = text ?? '';
      };

      // set float image caption position
      const setFloatImgCaptionPosition = (pos) => {
        const blk = currBlock.value
        if (!blk || blk.type !== 'float-image') return
        blk.image.captionPosition = pos
      }

      // animate
      const setFloatImgCaptionBubbleAnimated = (v) => {
        const blk = currBlock.value
        if (!blk || blk.type !== 'float-image') return
        blk.image.captionBubbleAnimated = !!v
      }

      const setFloatImgText = (html) => {
        const blk = currBlock.value;
        if (blk && blk.type === 'float-image') blk.text = html ?? '';
      };


    // delete selected
      const deleteSelected = () => {
        if (!selected.value.type) return

        if (selected.value.type === 'section') {
          sections.value = sections.value.filter(s => s.id !== selected.value.sectionId)
          selected.value = { type: null, sectionId: null, blockId: null, imageIndex: null }
          return
        }

        const sec = currSection.value
        if (!sec) return

        const blk = currBlock.value
        if (!blk) return

        if (selected.value.type === 'image' && Array.isArray(blk.images) && selected.value.imageIndex != null) {
          blk.images.splice(selected.value.imageIndex, 1)
          if (blk.images.length === 0) {
            sec.blocks = sec.blocks.filter(b => b.id !== blk.id)
            selected.value = { type: 'section', sectionId: sec.id, blockId: null, imageIndex: null }
          } else {
            selected.value.imageIndex = Math.min(selected.value.imageIndex, blk.images.length - 1)
          }
          return
        }

        sec.blocks = sec.blocks.filter(b => b.id !== selected.value.blockId)
        selected.value = { type: 'section', sectionId: sec.id, blockId: null, imageIndex: null }
      }


    // get block
    const currBlock = computed(() => {
        const sec = currSection.value
        if (!sec || !selected.value.blockId) return null
        return sec.blocks?.find(b => b.id === selected.value.blockId) || null
    })

    // Preview
    const isPreview = ref(false)

    const devices = ref([
        { id: 'pc', name: 'PC', mode: 'pc' },
        { id: 'tablet', name: 'Tablet PC', w: 768, mode: 'tablet' },
        { id: 'mobile', name: 'Mobile', w: 393, mode: 'mobile' },
    ])

    const selectedDeviceId = ref('desktop')

    const currentDevice = computed(() => {
        return devices.value.find(d => d.id === selectedDeviceId.value) || devices.value[0]
    })

    function runPreview() { isPreview.value = true }
    function stopPreview() { isPreview.value = false }
    function togglePreview() { isPreview.value = !isPreview.value }
    function selectDevice(id) { selectedDeviceId.value = id }
    // Helper function to convert blob URL to base64
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
            return blobUrl; // Fallback to original URL
        }
    };

    const exportToHTML = async () => {
        // Convert all blob URLs to base64 before export
        const sectionsClone = JSON.parse(JSON.stringify(sections.value));
        
        for (const section of sectionsClone) {
            // Convert section background image if it's a blob URL
            if (section.props?.bgImg && section.props.bgImg.startsWith('blob:')) {
                section.props.bgImg = await blobUrlToBase64(section.props.bgImg);
            }
            
            // Convert image blocks if they use blob URLs
            if (section.blocks) {
                for (const block of section.blocks) {
                    if (block.type === 'image' && block.src && block.src.startsWith('blob:')) {
                        block.src = await blobUrlToBase64(block.src);
                    }
                    // Video blocks don't need conversion as they use YouTube embed URLs
                }
            }
        }
        
        let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
    <title>Exported Article</title>
    <!-- 
        NOTE: To view YouTube videos properly, please:
        1. Use a local web server (e.g., python -m http.server, Live Server extension)
        2. OR upload this file to a web hosting service
        3. Opening directly with file:// protocol may block videos due to browser security
    -->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #b9b9b9;
            padding: 0;
            margin: 0;
        }
        .article-container {
            width: 100%;
            background-color: #b9b9b9;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .section {
            margin: 0 auto;
            box-sizing: border-box;
            position: relative;
            border-top: 2px solid #e0e0e0;
            padding: 16px 20px;
            overflow: visible;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }
        .text-block {
            max-width: 65ch;
            width: 100%;
            margin: 10px auto;
            padding: 8px;
        }
        .text-block h1 {
            font-size: 2em;
            font-weight: 700;
            margin: 0.67em 0;
            line-height: 1.2;
        }
        .text-block h2 {
            font-size: 1.5em;
            font-weight: 700;
            margin: 0.83em 0;
            line-height: 1.3;
        }
        .text-block p {
            font-size: 1em;
            line-height: 1.6;
            margin: 1em 0;
        }
        .text-block strong {
            font-weight: 700;
        }
        .text-block em {
            font-style: italic;
        }
        .text-block a {
            color: #2563eb;
            text-decoration: underline;
        }
        .text-block a:hover {
            color: #1d4ed8;
        }
        .text-block ul, .text-block ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        .text-block li {
            margin: 0.5em 0;
        }
        .image-block {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 10px 0;
        }
        .image-block img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
        }
        .video-block {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 10px 0;
        }
        .video-block iframe {
            max-width: 100%;
            border: none;
            border-radius: 4px;
        }
        .text-align-left {
            text-align: left;
        }
        .text-align-center {
            text-align: center;
        }
        .info-banner {
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 12px 20px;
            margin: 0;
            text-align: center;
            font-size: 14px;
            line-height: 1.5;
            width: 100%;
        }
        .info-banner a {
            color: #004085;
            text-decoration: underline;
        }
        .close-banner {
            background: transparent;
            border: none;
            color: #856404;
            font-size: 20px;
            cursor: pointer;
            float: right;
            padding: 0;
            margin: -4px 0 0 10px;
        }
    </style>
    <script>
        function closeBanner() {
            document.getElementById('info-banner').style.display = 'none';
        }
        
        // Load YouTube video - handles both file:// and http:// protocols
        function loadYouTubeVideo(videoId, width, height) {
            const container = document.getElementById('video-' + videoId);
            if (!container) return;
            
            const fallback = container.querySelector('.video-fallback');
            const iframe = container.querySelector('.video-iframe');
            
            // Check if we're on file:// protocol
            if (window.location.protocol === 'file:') {
                // Open YouTube in new tab as fallback
                window.open('https://www.youtube.com/watch?v=' + videoId, '_blank');
            } else {
                // We're on http/https, show iframe
                if (fallback) fallback.style.display = 'none';
                if (iframe) {
                    iframe.style.display = 'block';
                    // Auto-play when clicked
                    const currentSrc = iframe.src;
                    if (currentSrc.indexOf('autoplay') === -1) {
                        iframe.src = currentSrc + '?autoplay=1';
                    }
                }
            }
        }
        
        // Auto-detect environment and show appropriate version
        window.addEventListener('load', function() {
            const isFileProtocol = window.location.protocol === 'file:';
            
            if (isFileProtocol) {
                // Show warning banner
                const banner = document.getElementById('info-banner');
                if (banner) banner.style.display = 'block';
                
                // Keep showing fallback thumbnails (already visible by default)
            } else {
                // We're on a web server, try to show iframes directly
                const iframes = document.querySelectorAll('.video-iframe');
                const fallbacks = document.querySelectorAll('.video-fallback');
                
                // Try to show iframes, but keep fallbacks as clickable option
                // This provides best UX: clickable thumbnails that load videos on demand
            }
        });
    </script>
</head>
<body>
    <div id="info-banner" class="info-banner" style="display: none;">
        <button class="close-banner" onclick="closeBanner()">&times;</button>
        <strong>ℹ️ File Mode:</strong> Click video thumbnails to watch on YouTube. 
        For embedded playback, use a <strong>local web server</strong> (<code>python -m http.server</code>) 
        or <strong>upload to web hosting</strong>.
    </div>
    <div class="article-container">
`;

        sectionsClone.forEach(section => {
            const sectionProps = section.props || {};
            const width = sectionProps.width || 1200;
            const minHeight = sectionProps.height || 800;
            const bgColor = sectionProps.background || '#ffffff';
            const bgImg = sectionProps.bgImg || '';
            const bgType = sectionProps.bgType || 'color';

            let sectionStyle = `width: ${width}px; min-height: ${minHeight}px;`;
            
            if (bgType === 'img' && bgImg) {
                sectionStyle += ` background-image: url('${bgImg}');`;
            } else {
                sectionStyle += ` background-color: ${bgColor};`;
            }

            htmlContent += `        <section class="section" style="${sectionStyle}">\n`;

            section.blocks.forEach(block => {
                if (block.type === 'text') {
                    const blockWidth = block.props?.width || '65ch';
                    htmlContent += `            <div class="text-block" style="max-width: ${blockWidth};">\n`;
                    htmlContent += `                ${block.html || '<p></p>'}\n`;
                    htmlContent += `            </div>\n`;
                } else if (block.type === 'image') {
                    const imgWidth = block.width || 300;
                    const imgHeight = block.height || 300;
                    const objectFit = block.keepRatio ? 'contain' : 'fill';
                    htmlContent += `            <figure class="image-block">\n`;
                    htmlContent += `                <img src="${block.src}" style="width: ${imgWidth}px; height: ${imgHeight}px; object-fit: ${objectFit}; object-position: center;" alt="Image" />\n`;
                    htmlContent += `            </figure>\n`;
                } else if (block.type === 'video') {
                    const videoWidth = block.width || 560;
                    const videoHeight = block.height || 315;
                    const videoId = block.videoId;
                    htmlContent += `            <div class="video-block" id="video-${videoId}">\n`;
                    // Fallback: Show thumbnail with play button that links to YouTube
                    htmlContent += `                <div class="video-fallback" style="position: relative; width: ${videoWidth}px; height: ${videoHeight}px; max-width: 100%; background: #000; border-radius: 4px; cursor: pointer;" onclick="loadYouTubeVideo('${videoId}', ${videoWidth}, ${videoHeight})">\n`;
                    htmlContent += `                    <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="Video thumbnail" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'" />\n`;
                    htmlContent += `                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 48px; background: rgba(255,0,0,0.9); border-radius: 12px; cursor: pointer;">\n`;
                    htmlContent += `                        <svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg>\n`;
                    htmlContent += `                    </div>\n`;
                    htmlContent += `                    <div style="position: absolute; bottom: 8px; left: 8px; right: 8px; color: white; font-size: 12px; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">Click to play video</div>\n`;
                    htmlContent += `                </div>\n`;
                    // Also include iframe (will work on web servers)
                    htmlContent += `                <iframe class="video-iframe" width="${videoWidth}" height="${videoHeight}" src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" style="display: none; max-width: 100%; border-radius: 4px;"></iframe>\n`;
                    htmlContent += `            </div>\n`;
                }
            });

            htmlContent += `        </section>\n`;
        });

        htmlContent += `    </div>
</body>
</html>`;

        return htmlContent;
    };

    const downloadHTML = async () => {
        const htmlContent = await exportToHTML();
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `article_${new Date().getTime()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const generateIframeCode = async () => {
        const htmlContent = await exportToHTML();
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const iframeCode = `<iframe 
    src="${url}" 
    width="100%" 
    height="600" 
    frameborder="0" 
    style="border: none; max-width: 100%;"
    sandbox="allow-same-origin allow-scripts"
></iframe>`;
        
        return iframeCode;
    };

    const copyIframeCode = async () => {
        const iframeCode = await generateIframeCode();
        try {
            await navigator.clipboard.writeText(iframeCode);
            return true;
        } catch (err) {
            console.error('Failed to copy iframe code:', err);
            return false;
        }
    };

    const generateHTML = exportToHTML;

    // Clear all sections
    const clearAllSections = () => {
        // Revoke all blob URLs before clearing
        revokeAllBlobs();
        sections.value = [];
        selected.value = { type: null, sectionId: null, blockId: null };
        activeEditor.value = null;
    };

    // Load sections data from saved page
    const loadSections = (sectionsData) => {
        try {
            console.log('🔄 Loading sections data...', sectionsData);
            
            // Clear existing content first
            clearAllSections();
            
            // Parse and load sections data
            if (typeof sectionsData === 'string') {
                console.log('📝 Parsing JSON string...');
                sectionsData = JSON.parse(sectionsData);
            }
            
            if (Array.isArray(sectionsData)) {
                console.log(`📦 Found ${sectionsData.length} sections to load`);
                
                // Deep clone the sections data to ensure reactivity
                const clonedSections = JSON.parse(JSON.stringify(sectionsData));
                
                // Restore blob URLs for images and backgrounds
                clonedSections.forEach((section, idx) => {
                    console.log(`  Section ${idx + 1}:`, {
                        id: section.id,
                        blocks: section.blocks?.length || 0,
                        bgType: section.props?.bgType
                    });
                    
                    // Restore background blob URL if exists
                    if (section.props && section.props.bgType === 'image' && section.props.bgImg) {
                        // The bgImg should be a data URL or external URL, it will work as is
                    }
                    
                    // Restore blocks
                    if (section.blocks) {
                        section.blocks.forEach((block, bidx) => {
                            console.log(`    Block ${bidx + 1}:`, {
                                type: block.type,
                                hasHtml: block.type === 'text' && !!block.html,
                                htmlLength: block.type === 'text' ? block.html?.length : 'N/A'
                            });
                            
                            // Images should have their src intact
                            if (block.type === 'image' && block.src) {
                                // The src should be a data URL or external URL, it will work as is
                            }
                        });
                    }
                });
                
                sections.value = clonedSections;
                console.log('✅ Loaded sections data:', sections.value.length, 'sections');
                console.log('📊 Final sections state:', JSON.parse(JSON.stringify(sections.value)));
            } else {
                console.error('❌ Invalid sections data format:', typeof sectionsData);
            }
        } catch (error) {
            console.error('❌ Failed to load sections:', error);
            alert('Failed to load page content into editor');
        }
    };

    return {
        // Core data
        sections,
        selected,
        
        // Section operations
        addSection,
        selectSection,
        currSection,
        setSecType,
        setSecBg,
        setSecHeight,
        setSecBgImg,
        revokeAllBlobs,
        
        // Block operations
        addTextBlock,
        addImageBlock,
        addVideoBlock,
        addFullWidthImageBlock,
        addFloatImageBlock,
        selectBlock,
        currBlock,
        deleteSelected,
        notSelected,
        
        // Image operations
        currImage,
        setImgCaption,
        setImgCaptionPosition,
        setImgCaptionBubbleAnimated,
        setImgWidth,
        setImgHeight,
        setImgKeepRatio,
        
        // Full-width image operations
        setFullWidthImgMode,
        setFullWidthImgHeight,
        setFullWidthImgCaption,
        setFullWidthImgCaptionPosition,
        setFullWidthImgCaptionBubbleAnimated,
        
        // Float image operations
        setFloatImgAlign,
        setFloatImgWidth,
        setFloatImgCaption,
        setFloatImgText,
        setFloatImgCaptionPosition,
        setFloatImgCaptionBubbleAnimated,
        
        // Video operations
        setVideoUrl,
        setVideoWidth,
        setVideoHeight,
        setVideoKeepRatio,
        
        // Editor state
        activeEditor,
        setActiveEditor,
        
        // Preview state
        isPreview,
        devices,
        selectedDeviceId,
        currentDevice,
        runPreview,
        stopPreview,
        togglePreview,
        selectDevice,
        
        // Export operations
        exportToHTML,
        downloadHTML,
        generateIframeCode,
        copyIframeCode,
        generateHTML,
        
        // Storage operations
        clearAllSections,
        loadSections,
    }
});
