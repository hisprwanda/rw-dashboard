import { act, renderHook } from '@testing-library/react'
import { useSlideshow } from './useSlideshow'

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

/** One step at a time: each slide's timeout is set when React renders it. */
const advance = (ms: number) =>
    act(() => {
        jest.advanceTimersByTime(ms)
    })

it('moves on after the delay and loops', () => {
    const { result } = renderHook(() => useSlideshow(3, 5000))
    advance(5000)
    expect(result.current.index).toBe(1)
    advance(5000)
    advance(5000)
    expect(result.current.index).toBe(0)
})

it('gives a slide reached by hand its full time', () => {
    const { result } = renderHook(() => useSlideshow(5, 5000))
    advance(4500)
    act(() => {
        result.current.next()
    })
    expect(result.current.index).toBe(1)
    advance(4900)
    expect(result.current.index).toBe(1)
    advance(100)
    expect(result.current.index).toBe(2)
})

it('moves on from the slide shown when there are fewer slides', () => {
    const { result, rerender } = renderHook(({ count }) => useSlideshow(count, 5000), {
        initialProps: { count: 8 },
    })
    act(() => {
        result.current.setPlaying(false)
    })
    for (let i = 0; i < 7; i++)
        act(() => {
            result.current.next()
        })
    rerender({ count: 3 })
    expect(result.current.index).toBe(2)
    act(() => {
        result.current.next()
    })
    expect(result.current.index).toBe(0)
    act(() => {
        result.current.previous()
    })
    expect(result.current.index).toBe(2)
})
