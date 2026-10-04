import { useEffect, useState } from 'react'

/**
 * Slides to keep rendered: the current one, the next one (so it loads while the current
 * one shows) and every slide shown before. Remounting a slide reloads its items (DHIS2
 * plugin iframes, map tiles, chart animations), which is the spinner seen on every turn.
 * Starts over when the slides change (`count`, e.g. another number of items per slide).
 */
export const useMountedSlides = (index: number, count: number) => {
    const [mounted, setMounted] = useState({ count, slides: new Set<number>() })
    const next = count ? (index + 1) % count : 0

    useEffect(() => {
        setMounted((current) => {
            const slides = current.count === count ? current.slides : new Set<number>()
            if (current.count === count && slides.has(index) && slides.has(next)) return current
            return { count, slides: new Set([...slides, index, next]) }
        })
    }, [index, next, count])

    return (slide: number) =>
        slide === index || slide === next || (mounted.count === count && mounted.slides.has(slide))
}
