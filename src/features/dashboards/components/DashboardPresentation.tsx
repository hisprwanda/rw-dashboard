import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    IconArrowLeft24,
    IconArrowRight24,
    InputField,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMusicTracks } from '@/features/presentation-music'
import { useFullscreen } from '@/shared/hooks'
import { useMountedSlides } from '../hooks/useMountedSlides'
import { useSlideshow } from '../hooks/useSlideshow'
import { DashboardItemContent, itemTitle, type DashboardItem } from './DashboardItemContent'

interface DashboardPresentationProps {
    name: string
    items: readonly DashboardItem[]
    onExit: () => void
}

/**
 * Slideshow of the dashboard items with optional background music.
 * Keys: Space play/pause, ←/→ previous/next, F fullscreen, Esc exit.
 */
export const DashboardPresentation = ({ name, items, onExit }: DashboardPresentationProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const fullscreen = useFullscreen(containerRef)
    const { data: tracks = [] } = useMusicTracks()
    const [perView, setPerView] = useState(1)
    const [delaySeconds, setDelaySeconds] = useState(5)
    const [track, setTrack] = useState<string>()
    const pages = Math.max(Math.ceil(items.length / perView), 1)
    const show = useSlideshow(pages, delaySeconds * 1000)
    const slides = useMemo(
        () =>
            Array.from({ length: Math.ceil(items.length / perView) }, (_, slide) =>
                items.slice(slide * perView, slide * perView + perView)
            ),
        [items, perView]
    )
    const isMounted = useMountedSlides(show.index, pages)
    const { setPlaying, next, previous } = show
    const toggleFullscreen = fullscreen.toggle

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.target instanceof HTMLInputElement) return
            if (event.code === 'Space') {
                event.preventDefault()
                setPlaying((playing) => !playing)
            } else if (event.code === 'ArrowRight') next()
            else if (event.code === 'ArrowLeft') previous()
            else if (event.code === 'KeyF') void toggleFullscreen()
            else if (event.code === 'Escape' && !document.fullscreenElement) onExit()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [setPlaying, next, previous, toggleFullscreen, onExit])

    const playTrack = (src: string | undefined) => {
        setTrack(src)
        const audio = audioRef.current
        if (!audio) return
        if (src) {
            audio.src = src
            void audio.play()
        } else {
            audio.pause()
            audio.removeAttribute('src')
        }
    }

    return (
        <div ref={containerRef} className="flex h-[calc(100vh-50px)] flex-col bg-gray-50">
            <header className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 bg-white px-4 py-2">
                <div>
                    <h2 className="m-0 text-lg font-semibold">{name}</h2>
                    <span className="text-xs text-gray-500">
                        {i18n.t('Slide {{current}} of {{total}}', {
                            current: show.index + 1,
                            total: pages,
                        })}
                    </span>
                </div>
                {!fullscreen.isFullscreen && (
                    <div className="flex flex-wrap items-end gap-3">
                        <InputField
                            dense
                            type="number"
                            min="1"
                            max="4"
                            inputWidth="70px"
                            label={i18n.t('Items per slide')}
                            value={String(perView)}
                            onChange={({ value }) =>
                                setPerView(Math.min(Math.max(Number(value) || 1, 1), 4))
                            }
                        />
                        <InputField
                            dense
                            type="number"
                            min="1"
                            inputWidth="70px"
                            label={i18n.t('Seconds per slide')}
                            value={String(delaySeconds)}
                            onChange={({ value }) =>
                                setDelaySeconds(Math.max(Number(value) || 1, 1))
                            }
                        />
                        <div className="w-44">
                            <SingleSelectField
                                dense
                                clearable
                                label={i18n.t('Background music')}
                                disabled={!tracks.length}
                                placeholder={
                                    tracks.length ? i18n.t('None') : i18n.t('No tracks uploaded')
                                }
                                selected={track}
                                onChange={({ selected }) => playTrack(selected || undefined)}
                            >
                                {tracks.map((entry) => (
                                    <SingleSelectOption
                                        key={entry.id}
                                        value={entry.src}
                                        label={entry.name}
                                    />
                                ))}
                            </SingleSelectField>
                        </div>
                    </div>
                )}
                <ButtonStrip>
                    <Button small onClick={() => setPlaying((playing) => !playing)}>
                        {show.playing ? i18n.t('Pause') : i18n.t('Play')}
                    </Button>
                    <Button small onClick={() => void fullscreen.toggle()}>
                        {fullscreen.isFullscreen
                            ? i18n.t('Exit full screen')
                            : i18n.t('Full screen')}
                    </Button>
                    {!fullscreen.isFullscreen && (
                        <Button small onClick={onExit}>
                            {i18n.t('Exit')}
                        </Button>
                    )}
                </ButtonStrip>
            </header>

            <main className="relative flex min-h-0 flex-1 items-stretch gap-3 p-4">
                <Button
                    secondary
                    icon={<IconArrowLeft24 />}
                    aria-label={i18n.t('Previous slide')}
                    onClick={previous}
                />
                <div className="relative min-h-0 flex-1">
                    {/* Slides stay mounted once shown (hidden, same size): no reload on return. */}
                    {slides.map((slideItems, slide) =>
                        isMounted(slide) ? (
                            <div
                                key={slide}
                                className={`absolute inset-0 grid gap-3 ${
                                    slide === show.index ? '' : 'invisible'
                                }`}
                                aria-hidden={slide !== show.index}
                                style={{
                                    gridTemplateColumns: `repeat(${slideItems.length}, minmax(0, 1fr))`,
                                }}
                            >
                                {slideItems.map((item, offset) => (
                                    <section
                                        key={item.i}
                                        className="flex min-h-0 flex-col rounded bg-white p-3 shadow"
                                        aria-label={itemTitle(item)}
                                    >
                                        <h3 className="m-0 mb-2 text-center text-base font-medium">
                                            {slide * perView + offset + 1}. {itemTitle(item)}
                                        </h3>
                                        <div className="min-h-0 flex-1">
                                            <DashboardItemContent item={item} />
                                        </div>
                                    </section>
                                ))}
                            </div>
                        ) : null
                    )}
                    {!items.length && (
                        <p className="absolute inset-0 flex items-center justify-center text-gray-500">
                            {i18n.t('This dashboard has no items.')}
                        </p>
                    )}
                </div>
                <Button
                    secondary
                    icon={<IconArrowRight24 />}
                    aria-label={i18n.t('Next slide')}
                    onClick={next}
                />
            </main>
            {/* Background music only (no speech), so captions do not apply. */}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio ref={audioRef} loop className="hidden" aria-hidden="true" />
        </div>
    )
}
