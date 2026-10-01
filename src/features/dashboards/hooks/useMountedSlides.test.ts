import { renderHook } from '@testing-library/react'
import { useMountedSlides } from './useMountedSlides'

const mountedOf = (isMounted: (slide: number) => boolean, count: number) =>
    Array.from({ length: count }, (_, slide) => slide).filter(isMounted)

it('keeps the current, the next and every shown slide', () => {
    const { result, rerender } = renderHook(({ index, count }) => useMountedSlides(index, count), {
        initialProps: { index: 0, count: 5 },
    })
    expect(mountedOf(result.current, 5)).toEqual([0, 1])
    rerender({ index: 1, count: 5 })
    expect(mountedOf(result.current, 5)).toEqual([0, 1, 2])
    rerender({ index: 4, count: 5 })
    expect(mountedOf(result.current, 5)).toEqual([0, 1, 2, 4])
})

it('starts over when the slides change', () => {
    const { result, rerender } = renderHook(({ index, count }) => useMountedSlides(index, count), {
        initialProps: { index: 2, count: 5 },
    })
    rerender({ index: 0, count: 3 })
    expect(mountedOf(result.current, 3)).toEqual([0, 1])
})
