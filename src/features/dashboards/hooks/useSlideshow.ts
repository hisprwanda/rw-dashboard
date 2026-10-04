import { useCallback, useEffect, useState } from 'react'

/** Current slide, autoplay and navigation for `count` slides. */
export const useSlideshow = (count: number, delayMs: number) => {
    const [rawIndex, setIndex] = useState(0)
    const [playing, setPlaying] = useState(true)
    // The stored index can outlive a smaller `count` (more items per slide): clamp it.
    const last = Math.max(count - 1, 0)
    const index = Math.min(rawIndex, last)

    const next = useCallback(
        () => setIndex((i) => (count ? (Math.min(i, last) + 1) % count : 0)),
        [count, last]
    )
    const previous = useCallback(
        () => setIndex((i) => (count ? (Math.min(i, last) - 1 + count) % count : 0)),
        [count, last]
    )

    // A timeout per slide, not an interval: a slide reached by hand gets its full time.
    useEffect(() => {
        if (!playing || count < 2) return
        const timer = setTimeout(next, Math.max(delayMs, 500))
        return () => clearTimeout(timer)
    }, [playing, count, delayMs, next, index])

    return { index, playing, setPlaying, next, previous }
}
