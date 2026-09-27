import { dataStoreService } from '@/shared/api'
import { env } from '@/shared/constants/env'
import type { SavedVisual } from '../types/visual.types'

export const visualService = dataStoreService<SavedVisual>(env.visualsStore)
