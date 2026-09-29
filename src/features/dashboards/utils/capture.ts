/** Elements marked with this class (buttons, handles) are left out of images. */
export const NO_EXPORT_CLASS = 'no-export'

const keep = (node: HTMLElement) => !node.classList?.contains(NO_EXPORT_CLASS)

/**
 * A small JPEG of the dashboard for the preview cards. JPEG at half resolution keeps the
 * dataStore entry small (the old PNG previews were several hundred KB).
 */
export const capturePreview = async (element: HTMLElement): Promise<string> => {
    const { toJpeg } = await import('html-to-image')
    return toJpeg(element, {
        quality: 0.7,
        pixelRatio: 0.5,
        backgroundColor: '#ffffff',
        filter: keep,
    })
}

interface PptxItem {
    id: string
    title: string
}

const SLIDE_W = 10
const SLIDE_H = 5.625

/**
 * One title slide, then one slide per item (captured from the element with
 * `data-item-id`). Libraries are loaded on first use.
 */
export const exportDashboardToPptx = async ({
    name,
    items,
    backgroundColor,
    author,
    root,
}: {
    name: string
    items: readonly PptxItem[]
    backgroundColor: string
    author: string
    root: HTMLElement
}): Promise<void> => {
    const [{ toPng }, { default: PptxGenJS }] = await Promise.all([
        import('html-to-image'),
        import('pptxgenjs'),
    ])
    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_16x9'
    pptx.author = author
    pptx.title = name
    const background = { color: backgroundColor.replace('#', '') }

    const title = pptx.addSlide()
    title.background = background
    title.addText(name, { x: 0.5, y: 2.3, w: 9, h: 1, fontSize: 40, bold: true, align: 'center' })

    for (const item of items) {
        const element = root.querySelector<HTMLElement>(`[data-item-id="${CSS.escape(item.id)}"]`)
        if (!element) continue
        const image = await toPng(element, {
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            filter: keep,
        })
        const ratio = element.offsetWidth / Math.max(element.offsetHeight, 1)
        const maxW = SLIDE_W * 0.9
        const maxH = SLIDE_H * 0.75
        const w = ratio > maxW / maxH ? maxW : maxH * ratio
        const h = w / ratio
        const slide = pptx.addSlide()
        slide.background = background
        slide.addText(item.title, {
            x: 0.5,
            y: 0.2,
            w: 9,
            h: 0.6,
            fontSize: 22,
            bold: true,
            align: 'center',
        })
        slide.addImage({
            data: image,
            x: (SLIDE_W - w) / 2,
            y: 0.9 + (SLIDE_H - 0.9 - h) / 2,
            w,
            h,
        })
    }

    const fileName = `${name.replace(/[^a-z0-9]+/gi, '_').toLowerCase() || 'dashboard'}.pptx`
    await pptx.writeFile({ fileName })
}
