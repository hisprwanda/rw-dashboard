/** One uploaded background track: a DHIS2 document holds the audio file. */
export interface MusicTrack {
    id: string
    name: string
    documentId: string
}

/** Playable track: the stored entry plus the URL of its audio file. */
export interface PlayableTrack extends MusicTrack {
    src: string
}

/** The dataStore entry listing every uploaded track. */
export interface MusicLibrary {
    tracks: MusicTrack[]
}
