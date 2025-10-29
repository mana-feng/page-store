// converts editor data into a complete HTML page string
export function buildHtml(sections = []) {
  const head = `
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/preview.css" />
  `
  // build HTML for each section
  const sectionHtml = (sections || []).map(sec => {
    const p = sec.props || {}
    const secStyle = []

    // background is img
    if (p.bgType === 'img' && p.bgImg) {
      secStyle.push(
        `background-image:url(${p.bgImg})`,
        'background-size:cover',
        'background-position:center',
        'background-repeat:no-repeat'
      )
    } else {
      secStyle.push(`background:${p.background || '#ffffff'}`)
    }

    // height & width
    if (p.height) secStyle.push(`min-height:${p.height}px`)
    secStyle.push('width:100%')

    // generate inner blocks(text/img)
    const blocks = (sec.blocks || []).map(blk => {
      if (blk.type === 'text') {
        const maxWidth = blk?.props?.width || '65ch'
        return `
          <div class="block-wrapper">
            <div class="text-wrapper" style="--block-max:${maxWidth};width:100%;margin:0 auto;padding:0.5rem 0;">
              <div class="prose max-w-none">${blk.html || '<p></p>'}</div>
            </div>
          </div>
        `
      }
      if (blk.type === 'image') {
        // Handle images array structure
        if (!blk.images || !Array.isArray(blk.images) || blk.images.length === 0) {
          return ''
        }
        
        // For now, render the first image from the images array
        const img = blk.images[0]
        const w = img.width ? `width:${img.width}px;` : ''
        const h = img.height ? `height:${img.height}px;` : ''
        const fit = img.keepRatio ? 'object-fit:contain;' : 'object-fit:fill;'
        const src = img.src || ''
        
        return `
          <div class="block-wrapper">
            <figure class="image-block">
              <img src="${src}" style="${w}${h}${fit}object-position:center;max-width:100%;display:block;" alt="" />
            </figure>
          </div>
        `
      }
      if (blk.type === 'fullwidth-image') {
        // Handle fullwidth image
        if (!blk.image || !blk.image.src) {
          return ''
        }
        
        const img = blk.image
        const src = img.src || ''
        const mode = img.mode || 'auto'
        const height = img.height || 400
        const fit = mode === 'fixed' ? 'object-fit:cover;' : 'object-fit:contain;'
        const heightStyle = mode === 'fixed' ? `height:${height}px;` : 'height:auto;'
        const caption = img.caption ? `<figcaption class="image-caption">${img.caption}</figcaption>` : ''
        
        return `
          <div class="block-wrapper">
            <figure class="fullwidth-image-block">
              <img src="${src}" class="fullwidth-image" style="width:100%;display:block;${fit}${heightStyle}" alt="" />
              ${caption}
            </figure>
          </div>
        `
      }
      if (blk.type === 'float-image') {
        // Handle float image with text
        if (!blk.image || !blk.image.src) {
          return ''
        }
        
        const img = blk.image
        const src = img.src || ''
        const align = img.align || 'right'
        const widthPercent = img.widthPercent || 45
        const caption = img.caption ? `<figcaption class="image-caption">${img.caption}</figcaption>` : ''
        const text = blk.text || '<p></p>'
        
        return `
          <div class="block-wrapper">
            <div class="float-image-container" style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap;">
              <figure class="float-image-block" style="width:${widthPercent}%;margin:0;${align === 'left' ? 'order:1;' : 'order:2;'}">
                <img src="${src}" style="width:100%;height:auto;display:block;" alt="" />
                ${caption}
              </figure>
              <div class="float-text-content" style="flex:1;min-width:200px;${align === 'left' ? 'order:2;' : 'order:1;'}">
                <div class="prose max-w-none">${text}</div>
              </div>
            </div>
          </div>
        `
      }
      return ''
    }).join('')

    // combine bg style and blocks
    return `<section class="section-block" style="${secStyle.join(';')}">${blocks}</section>`
  }).join('')

  // assemble the complete html
  return `<!doctype html>
  <html>
    <head>${head}</head>
    <body>
      <main class="canvas-area">
        ${sectionHtml}
      </main>
    </body>
  </html>`
}
