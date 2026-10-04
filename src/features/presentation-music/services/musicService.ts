import {
    dataStoreService,
    deleteResource,
    isNotFound,
    createResource,
    type DataEngine,
} from '@/shared/api'
import { env } from '@/shared/constants/env'
import { generateUid } from '@/shared/utils/uid'
import type { MusicLibrary, MusicTrack, PlayableTrack } from '../types/music.types'

const LIBRARY_KEY = 'library'
export const MAX_TRACK_BYTES = 10 * 1024 * 1024

const store = dataStoreService<MusicLibrary>(env.musicStore)

const trimSlashes = (url: string) => url.replace(/\/+$/, '')

/** URL of the audio file held by a DHIS2 document. */
export const trackSrc = (baseUrl: string, documentId: string) =>
    `${trimSlashes(baseUrl)}/api/documents/${documentId}/data`

export type TrackFileError = 'type' | 'size'

/** Why a file cannot be used as a track, or `null` when it is fine. */
export const checkTrackFile = (file: File): TrackFileError | null => {
    if (!/\.mp3$/i.test(file.name) && file.type !== 'audio/mpeg') return 'type'
    return file.size > MAX_TRACK_BYTES ? 'size' : null
}

const readLibrary = async (
    engine: DataEngine,
    signal?: AbortSignal
): Promise<MusicLibrary | null> => {
    try {
        return await store.get(engine, LIBRARY_KEY, signal)
    } catch (error) {
        if (isNotFound(error)) return null
        throw error
    }
}

const writeLibrary = async (engine: DataEngine, existing: boolean, library: MusicLibrary) => {
    if (existing) await store.update(engine, LIBRARY_KEY, library)
    else await store.create(engine, LIBRARY_KEY, library)
}

const uidOf = (response: unknown): string | undefined => {
    if (typeof response !== 'object' || response === null) return undefined
    const { uid, response: inner, fileResource } = response as Record<string, unknown>
    if (typeof uid === 'string') return uid
    if (typeof fileResource === 'object' && fileResource !== null) {
        const { id } = fileResource as { id?: unknown }
        if (typeof id === 'string') return id
    }
    return uidOf(inner)
}

/** The data engine cannot send multipart bodies, so the file goes through `fetch`. */
const uploadFileResource = async (baseUrl: string, file: File): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    const response = await fetch(`${trimSlashes(baseUrl)}/api/fileResources?domain=DOCUMENT`, {
        method: 'POST',
        body: form,
        credentials: 'include',
    })
    if (!response.ok) throw new Error(`Upload failed (${response.status})`)
    const id = uidOf(await response.json())
    if (!id) throw new Error('Upload failed: no file resource id returned')
    return id
}

export const musicService = {
    /** Uploaded tracks, oldest first. */
    list: async (
        engine: DataEngine,
        baseUrl: string,
        signal?: AbortSignal
    ): Promise<PlayableTrack[]> => {
        const library = await readLibrary(engine, signal)
        return (library?.tracks ?? []).map((track) => ({
            ...track,
            src: trackSrc(baseUrl, track.documentId),
        }))
    },
    /** Uploads the file as a DHIS2 document and adds it to the library. */
    add: async (engine: DataEngine, baseUrl: string, file: File): Promise<MusicTrack> => {
        const name = file.name.replace(/\.mp3$/i, '')
        const fileResourceId = await uploadFileResource(baseUrl, file)
        const created = await createResource(engine, 'documents', {
            name,
            url: fileResourceId,
            external: false,
        })
        const documentId = uidOf(created)
        if (!documentId) throw new Error('Could not create the document')

        const track: MusicTrack = { id: generateUid(), name, documentId }
        try {
            const library = await readLibrary(engine)
            await writeLibrary(engine, library !== null, {
                tracks: [...(library?.tracks ?? []), track],
            })
        } catch (error) {
            // Do not leave an orphan file behind when the list could not be saved.
            await deleteResource(engine, 'documents', documentId).catch(() => undefined)
            throw error
        }
        return track
    },
    /** Removes the track from the library, then deletes its document. */
    remove: async (engine: DataEngine, track: MusicTrack) => {
        const library = await readLibrary(engine)
        if (library) {
            await writeLibrary(engine, true, {
                tracks: library.tracks.filter((entry) => entry.id !== track.id),
            })
        }
        try {
            await deleteResource(engine, 'documents', track.documentId)
        } catch (error) {
            if (!isNotFound(error)) throw error
        }
    },
}
