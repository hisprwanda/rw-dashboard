import { checkTrackFile, MAX_TRACK_BYTES, trackSrc } from './musicService'

const file = (name: string, type: string, size = 10) => {
    const f = new File(['x'], name, { type })
    Object.defineProperty(f, 'size', { value: size })
    return f
}

describe('checkTrackFile', () => {
    it('accepts mp3 files', () => {
        expect(checkTrackFile(file('song.MP3', ''))).toBeNull()
        expect(checkTrackFile(file('song', 'audio/mpeg'))).toBeNull()
    })
    it('rejects other types and oversized files', () => {
        expect(checkTrackFile(file('song.wav', 'audio/wav'))).toBe('type')
        expect(checkTrackFile(file('song.mp3', 'audio/mpeg', MAX_TRACK_BYTES + 1))).toBe('size')
    })
})

it('builds the document data url without double slashes', () => {
    expect(trackSrc('https://dhis.test/', 'abc')).toBe('https://dhis.test/api/documents/abc/data')
})
