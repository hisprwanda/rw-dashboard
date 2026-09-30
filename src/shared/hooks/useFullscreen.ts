import { useCallback, useEffect, useState, type RefObject } from 'react'

/** Fullscreen state of one element, kept in sync with Esc and the browser controls. */
export const useFullscreen = (ref: RefObject<HTMLElement>) => {
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        const onChange = () => setIsFullscreen(document.fullscreenElement === ref.current)
        document.addEventListener('fullscreenchange', onChange)
        return () => document.removeEventListener('fullscreenchange', onChange)
    }, [ref])

    const toggle = useCallback(async () => {
        if (document.fullscreenElement) await document.exitFullscreen()
        else await ref.current?.requestFullscreen()
    }, [ref])

    return { isFullscreen, toggle }
}
