export const EXPORT_FORMATS = ['png', 'jpeg', 'pdf', 'pptx'] as const
export type ExportFormat = (typeof EXPORT_FORMATS)[number]

const download = (href: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = href
    link.download = fileName
    link.click()
}

/**
 * Saves a rendered element as an image, a PDF or a one-slide PowerPoint.
 * The export libraries are loaded on first use, so they stay out of the main bundle.
 */
export const exportElement = async (
    element: HTMLElement,
    fileName: string,
    format: ExportFormat
): Promise<void> => {
    const htmlToImage = await import('html-to-image')
    // A white background: charts are transparent and would export on black in JPEG/PDF.
    const options = { backgroundColor: '#ffffff' }

    if (format === 'png' || format === 'jpeg') {
        const dataUrl =
            format === 'png'
                ? await htmlToImage.toPng(element, options)
                : await htmlToImage.toJpeg(element, options)
        download(dataUrl, `${fileName}.${format}`)
        return
    }

    const dataUrl = await htmlToImage.toPng(element, options)
    const ratio = element.offsetHeight / Math.max(element.offsetWidth, 1)

    if (format === 'pdf') {
        const { jsPDF } = await import('jspdf')
        const pdf = new jsPDF({ orientation: ratio > 1 ? 'portrait' : 'landscape' })
        const margin = 10
        const width = pdf.internal.pageSize.getWidth() - margin * 2
        const height = Math.min(width * ratio, pdf.internal.pageSize.getHeight() - margin * 2)
        pdf.addImage(dataUrl, 'PNG', margin, margin, height / ratio, height)
        pdf.save(`${fileName}.pdf`)
        return
    }

    const { default: PptxGenJS } = await import('pptxgenjs')
    const pptx = new PptxGenJS()
    // Default 16:9 slide is 10 x 5.625 inches.
    const height = Math.min(9 * ratio, 5)
    pptx.addSlide().addImage({ data: dataUrl, x: 0.5, y: 0.3, w: height / ratio, h: height })
    await pptx.writeFile({ fileName: `${fileName}.pptx` })
}
