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
        const w = blk.width ? `width:${blk.width}px;` : ''
        const h = blk.height ? `height:${blk.height}px;` : ''
        const fit = blk.keepRatio ? 'object-fit:contain;' : 'object-fit:fill;'
        return `
          <div class="block-wrapper">
            <figure class="image-block">
              <img src="${blk.src}" style="${w}${h}${fit}object-position:center;max-width:100%;display:block;" alt="" />
            </figure>
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
