import { dataStoreService } from '@/shared/api'
import { env } from '@/shared/constants/env'
import type { SavedMap } from '../types/map.types'

export const mapService = dataStoreService<SavedMap>(env.mapsStore)
