// Parses HTML content and converts it back to sections data structure
export function parseHtmlToSections(htmlContent) {
  try {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const sections = [];
    
    // Find all section elements - try both .section-block and .section
    let sectionElements = doc.querySelectorAll('.section-block');
    if (sectionElements.length === 0) {
      sectionElements = doc.querySelectorAll('.section');
    }
    
    sectionElements.forEach((sectionEl, index) => {
      const section = {
        id: Date.now() + index,
        type: 'section',
        blocks: [],
        props: {
          height: 300,
          bgType: 'color',
          background: '#ffffff',
          bgImg: '',
          bgVideo: '',
          _blobUrl: '',
        }
      };
      
      // Parse section styles
      const sectionStyle = sectionEl.getAttribute('style') || '';
      
      // Extract background
      if (sectionStyle.includes('background-image')) {
        const bgImgMatch = sectionStyle.match(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/);
        if (bgImgMatch) {
          section.props.bgType = 'img';
          section.props.bgImg = bgImgMatch[1];
        }
      } else {
        const bgColorMatch = sectionStyle.match(/background(?:-color)?:\s*([^;]+)/);
        if (bgColorMatch) {
          section.props.background = bgColorMatch[1].trim();
        }
      }
      
      // Extract height
      const heightMatch = sectionStyle.match(/min-height:\s*(\d+)px/);
      if (heightMatch) {
        section.props.height = parseInt(heightMatch[1], 10);
      }
      
      // Parse blocks within section
      const blockWrappers = sectionEl.querySelectorAll('.block-wrapper');
      
      blockWrappers.forEach((wrapper, blockIndex) => {
        // Check for text blocks
        const textWrapper = wrapper.querySelector('.text-wrapper');
        if (textWrapper) {
          const prose = textWrapper.querySelector('.prose');
          const block = {
            id: Date.now() + index * 1000 + blockIndex,
            type: 'text',
            html: prose ? prose.innerHTML : '<p></p>',
            align: 'left',
            props: {
              width: '65ch'
            }
          };
          
          // Try to extract width from style
          const wrapperStyle = textWrapper.getAttribute('style') || '';
          const widthMatch = wrapperStyle.match(/--block-max:\s*([^;]+)/);
          if (widthMatch) {
            block.props.width = widthMatch[1].trim();
          }
          
          section.blocks.push(block);
        }
        
        // Check for image blocks
        const imageBlock = wrapper.querySelector('.image-block');
        if (imageBlock) {
          const img = imageBlock.querySelector('img');
          if (img) {
            const imgStyle = img.getAttribute('style') || '';
            const src = img.getAttribute('src') || '';
            
            // Extract dimensions
            const widthMatch = imgStyle.match(/width:\s*(\d+)px/);
            const heightMatch = imgStyle.match(/height:\s*(\d+)px/);
            const objectFit = imgStyle.includes('object-fit:contain');
            
            const width = widthMatch ? parseInt(widthMatch[1], 10) : 300;
            const height = heightMatch ? parseInt(heightMatch[1], 10) : 300;
            const aspectRatio = width / height;
            
            const block = {
              id: Date.now() + index * 1000 + blockIndex,
              type: 'image',
              images: [{
                id: Date.now() + index * 1000 + blockIndex + 0.1,
                src: src,
                width: width,
                height: height,
                aspectRatio: aspectRatio,
                keepRatio: objectFit,
                caption: '',
                captionPosition: 'bottom',
                captionBubbleAnimated: false,
              }],
              layout: 'inline'
            };
            
            section.blocks.push(block);
          }
        }
        
        // Check for fullwidth-image blocks
        const fullwidthImageBlock = wrapper.querySelector('.fullwidth-image-block');
        if (fullwidthImageBlock) {
          const img = fullwidthImageBlock.querySelector('img');
          if (img) {
            const imgStyle = img.getAttribute('style') || '';
            const src = img.getAttribute('src') || '';
            const caption = fullwidthImageBlock.querySelector('.image-caption');
            
            // Extract mode and height
            const isCover = imgStyle.includes('object-fit:cover');
            const heightMatch = imgStyle.match(/height:\s*(\d+)px/);
            
            const block = {
              id: Date.now() + index * 1000 + blockIndex,
              type: 'fullwidth-image',
              image: {
                id: Date.now() + index * 1000 + blockIndex + 0.1,
                src: src,
                mode: isCover ? 'fixed' : 'auto',
                height: heightMatch ? parseInt(heightMatch[1], 10) : 400,
                caption: caption ? caption.textContent : '',
                captionPosition: 'bottom',
                captionBubbleAnimated: false,
              }
            };
            
            section.blocks.push(block);
          }
        }
        
        // Check for float-image blocks
        const floatImageContainer = wrapper.querySelector('.float-image-container');
        if (floatImageContainer) {
          const floatImageBlock = floatImageContainer.querySelector('.float-image-block');
          const floatTextContent = floatImageContainer.querySelector('.float-text-content');
          
          if (floatImageBlock) {
            const img = floatImageBlock.querySelector('img');
            if (img) {
              const src = img.getAttribute('src') || '';
              const caption = floatImageBlock.querySelector('.image-caption');
              const blockStyle = floatImageBlock.getAttribute('style') || '';
              
              // Extract width and alignment
              const widthMatch = blockStyle.match(/width:\s*(\d+)%/);
              const widthPercent = widthMatch ? parseInt(widthMatch[1], 10) : 45;
              const align = blockStyle.includes('order:1') ? 'left' : 'right';
              
              // Get text content
              const prose = floatTextContent ? floatTextContent.querySelector('.prose') : null;
              const text = prose ? prose.innerHTML : '<p></p>';
              
              const block = {
                id: Date.now() + index * 1000 + blockIndex,
                type: 'float-image',
                image: {
                  id: Date.now() + index * 1000 + blockIndex + 0.1,
                  src: src,
                  align: align,
                  widthPercent: widthPercent,
                  keepRatio: true,
                  aspectRatio: 1,
                  caption: caption ? caption.textContent : '',
                  captionPosition: 'bottom',
                  captionBubbleAnimated: false,
                },
                text: text
              };
              
              section.blocks.push(block);
            }
          }
        }
      });
      
      // Also check for standalone text and image blocks (different HTML structure)
      const textBlocks = sectionEl.querySelectorAll('.text-block');
      textBlocks.forEach((textEl, blockIndex) => {
        // Skip if already processed
        if (textEl.closest('.block-wrapper')) return;
        
        const block = {
          id: Date.now() + index * 2000 + blockIndex,
          type: 'text',
          html: textEl.innerHTML,
          align: 'left',
          props: {
            width: '65ch'
          }
        };
        
        const style = textEl.getAttribute('style') || '';
        const widthMatch = style.match(/max-width:\s*([^;]+)/);
        if (widthMatch) {
          block.props.width = widthMatch[1].trim();
        }
        
        section.blocks.push(block);
      });
      
      const imageBlocks = sectionEl.querySelectorAll('figure.image-block');
      imageBlocks.forEach((figureEl, blockIndex) => {
        // Skip if already processed
        if (figureEl.closest('.block-wrapper')) return;
        
        const img = figureEl.querySelector('img');
        if (img) {
          const imgStyle = img.getAttribute('style') || '';
          const src = img.getAttribute('src') || '';
          
          const widthMatch = imgStyle.match(/width:\s*(\d+)px/);
          const heightMatch = imgStyle.match(/height:\s*(\d+)px/);
          const objectFit = imgStyle.includes('object-fit:contain') || imgStyle.includes('object-fit: contain');
          
          const width = widthMatch ? parseInt(widthMatch[1], 10) : 300;
          const height = heightMatch ? parseInt(heightMatch[1], 10) : 300;
          const aspectRatio = width / height;
          
          const block = {
            id: Date.now() + index * 2000 + blockIndex + 500,
            type: 'image',
            images: [{
              id: Date.now() + index * 2000 + blockIndex + 500.1,
              src: src,
              width: width,
              height: height,
              aspectRatio: aspectRatio,
              keepRatio: objectFit,
              caption: '',
              captionPosition: 'bottom',
              captionBubbleAnimated: false,
            }],
            layout: 'inline'
          };
          
          section.blocks.push(block);
        }
      });
      
      // Check for video blocks
      const videoBlocks = sectionEl.querySelectorAll('.video-block');
      videoBlocks.forEach((videoEl, blockIndex) => {
        const iframe = videoEl.querySelector('iframe');
        if (iframe) {
          const src = iframe.getAttribute('src') || '';
          const width = iframe.getAttribute('width') || '560';
          const height = iframe.getAttribute('height') || '315';
          
          // Extract video ID from YouTube embed URL
          const videoIdMatch = src.match(/(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([^?&]+)/);
          const videoId = videoIdMatch ? videoIdMatch[1] : '';
          
          if (videoId) {
            const block = {
              id: Date.now() + index * 3000 + blockIndex,
              type: 'video',
              url: `https://www.youtube.com/watch?v=${videoId}`,
              videoId: videoId,
              width: parseInt(width, 10),
              height: parseInt(height, 10),
              aspectRatio: parseInt(width, 10) / parseInt(height, 10),
              keepRatio: true,
            };
            
            section.blocks.push(block);
          }
        }
      });
      
      sections.push(section);
    });
    
    return sections;
  } catch (error) {
    console.error('Failed to parse HTML:', error);
    throw new Error('Failed to parse HTML content: ' + error.message);
  }
}

// Check if HTML content appears to be from this editor (has expected structure)
export function isEditableHtml(htmlContent) {
  if (!htmlContent) return false;
  
  // Check for common patterns that indicate this HTML was generated by our editor
  const hasExpectedStructure = 
    htmlContent.includes('section') ||
    htmlContent.includes('canvas-area') ||
    htmlContent.includes('block-wrapper') ||
    htmlContent.includes('text-wrapper');
    
  return hasExpectedStructure;
}

