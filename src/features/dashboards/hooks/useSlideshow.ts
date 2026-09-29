import { useCallback, useEffect, useState } from 'react'

/** Current slide, autoplay and navigation for `count` slides. */
export const useSlideshow = (count: number, delayMs: number) => {
    const [index, setIndex] = useState(0)
    const [playing, setPlaying] = useState(true)

    const next = useCallback(() => setIndex((i) => (count ? (i + 1) % count : 0)), [count])
    const previous = useCallback(
        () => setIndex((i) => (count ? (i - 1 + count) % count : 0)),
        [count]
    )

    useEffect(() => {
        if (!playing || count < 2) return
        const timer = setInterval(next, Math.max(delayMs, 500))
        return () => clearInterval(timer)
    }, [playing, count, delayMs, next])

    return { index: Math.min(index, Math.max(count - 1, 0)), playing, setPlaying, next, previous }
}
