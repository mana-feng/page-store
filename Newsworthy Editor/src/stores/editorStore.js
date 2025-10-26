import { defineStore } from "pinia";
import { ref, computed, shallowRef } from "vue";

export const useEditorStore = defineStore('editor', () => {
    // stored all sections
    const sections = ref([])

    // selected object
    const selected = ref({
        type: null, // section/text/img
        sectionId: null,
        blockId: null, // id of imgblock or text block
    })

    // current selected TipTap editor
    const activeEditor = shallowRef(null)
    const setActiveEditor = (ed) => {
        activeEditor.value = ed
    }

    // add a empty new section
    const addSection = (canvasWidth) => {
        sections.value.push({
            id: Date.now(),
            type: 'section',
            blocks: [], // the info stored for blocks
            props: {
                width: canvasWidth,
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

        const img = new Image();
        img.onload = () => {
            const naturalW = img.naturalWidth || 300;
            const naturalH = img.naturalHeight || 300;
            const ratio = naturalW / naturalH || 1;

            const newBlock = {
                id: Date.now(),
                type: 'image',
                src,
                width: Math.min(300, naturalW),
                height: Math.min(300, naturalH),
                aspectRatio: ratio,
                keepRatio: true,
                _blobUrl: src.startsWith('blob:') ? src : '', // Track blob URLs for cleanup
            };

            sec.blocks.push(newBlock);
            selected.value = { type: 'image', sectionId: sec.id, blockId: newBlock.id };
        };
        
        img.onerror = () => {
            alert('❌ Failed to load image. Please try another file.');
            console.error('Image load error:', src);
        };
        
        img.src = src;
    };

    // change img
    const setImgKeepRatio = (v) => {
        const blk = currBlock.value;
        if (!blk || blk.type !== 'image') return;
        blk.keepRatio = !!v;
    };

    const setImgWidth = (w) => {
        const blk = currBlock.value;
        if (!blk || blk.type !== 'image') return;
        const width = Math.max(1, parseInt(w || 0, 10));
        if (blk.keepRatio && blk.aspectRatio) {
            blk.width = width;
            blk.height = Math.round(width / blk.aspectRatio);
        } else {
            blk.width = width;
        }
    };

    const setImgHeight = (h) => {
        const blk = currBlock.value;
        if (!blk || blk.type !== 'image') return;
        const height = Math.max(1, parseInt(h || 0, 10));
        if (blk.keepRatio && blk.aspectRatio) {
            blk.height = height;
            blk.width = Math.round(height * blk.aspectRatio);
        } else {
            blk.height = height;
        }
    };

    // when user click section
    const selectSection = (sectionId) => {
        selected.value = { type: 'section', sectionId, blockId: null };
    }

    // click text or img block
    const selectBlock = (sectionId, blockId, blockType) => {
        selected.value = { type: blockType, sectionId, blockId };
    }

    // click nothing
    const notSelected = () => {
        selected.value = { type: null, sectionId: null, blockId: null };
        activeEditor.value = null;
    };

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

    // delete selected
    const deleteSelected = () => {
        if (!selected.value.type)
            return;

        // delete section
        if (selected.value.type === 'section' && selected.value.sectionId) {
            const section = sections.value.find(s => s.id === selected.value.sectionId)
            
            // Clean up blob URLs in section background
            if (section?.props?._blobUrl && section.props._blobUrl.startsWith('blob:')) {
                try { URL.revokeObjectURL(section.props._blobUrl) } catch { ; }
            }
            
            // Clean up blob URLs in all blocks
            section?.blocks?.forEach(block => {
                if (block.type === 'image' && block._blobUrl && block._blobUrl.startsWith('blob:')) {
                    try { URL.revokeObjectURL(block._blobUrl) } catch { ; }
                }
            })
            
            sections.value = sections.value.filter(
                s => s.id !== selected.value.sectionId
            )
            selected.value = {
                type: null,
                sectionId: null,
                blockId: null
            }
        } else {
            // delete block（text/img）
            const sec = currSection.value
            if (!sec) return
            
            // Clean up blob URL if deleting an image block
            const blockToDelete = sec.blocks.find(b => b.id === selected.value.blockId)
            if (blockToDelete?.type === 'image' && blockToDelete._blobUrl && blockToDelete._blobUrl.startsWith('blob:')) {
                try { URL.revokeObjectURL(blockToDelete._blobUrl) } catch { ; }
            }
            
            sec.blocks = sec.blocks.filter(b => b.id !== selected.value.blockId)
            // delete then go back section
            selected.value = { type: 'section', sectionId: sec.id, blockId: null }
        }
    }

    // get block
    const currBlock = computed(() => {
        const sec = currSection.value
        if (!sec || !selected.value.blockId) return null
        return sec.blocks?.find(b => b.id === selected.value.blockId) || null
    })

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

    // 导出HTML功能
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
                }
            }
        }
        
        let htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Article</title>
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
        .text-align-left {
            text-align: left;
        }
        .text-align-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="article-container">
`;

        // 遍历所有sections (use cloned sections with converted blob URLs)
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

            // 遍历section中的所有blocks
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
                }
            });

            htmlContent += `        </section>\n`;
        });

        htmlContent += `    </div>
</body>
</html>`;

        return htmlContent;
    };

    // 下载HTML文件
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

    // 生成iframe嵌入代码
    const generateIframeCode = async () => {
        const htmlContent = await exportToHTML();
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // 生成iframe代码示例
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

    // 复制iframe代码到剪贴板
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

    // generateHTML 是 exportToHTML 的别名，用于后端API集成
    const generateHTML = exportToHTML;

    return {
        sections, addSection, addTextBlock, addImageBlock,
        selected, selectSection, selectBlock, notSelected,
        currSection, currBlock,
        setSecBg, setSecHeight, deleteSelected,
        activeEditor, setActiveEditor,
        setSecType, revokeAllBlobs, setSecBgImg,
        setImgWidth, setImgHeight, setImgKeepRatio,
        exportToHTML, downloadHTML, generateIframeCode, copyIframeCode, generateHTML,
    }

})
