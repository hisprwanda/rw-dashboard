import i18n from '@dhis2/d2-i18n'
import React, { useEffect, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { generateUid } from '@/shared/utils/uid'
import { MapDataFormFields, MapDataSchema } from '../../../types/mapFormTypes'
import { useDataEngine } from '@dhis2/app-runtime'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import Button from '../../../components/Button'
import { useAuthorities } from '../../../context/AuthContext'
import { useNotify } from '@/shared/hooks'
import { useNavigate } from 'react-router-dom'
import { env } from '@/shared/constants/env'

interface SaveMapModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    mapId?: string
    existingMapData?: any
}

export function SaveMapModal({ open, setOpen, mapId, existingMapData }: SaveMapModalProps) {
    // Get user and data source details from context
    const {
        userDatails,
        mapSettings,
        selectedDataSourceOption,
        selectedOrgUnits,
        selectedLevel,
        analyticsQuery,
        mapAnalyticsQueryTwo,
        geoFeaturesQuery,
        backedSelectedItems,
        analyticsDimensions,
        currentBasemap,
    } = useAuthorities()
    const notify = useNotify()
    const engine = useDataEngine()
    const navigate = useNavigate()

    // Initialize form with resolver and mode set to onSubmit for better error handling
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<MapDataFormFields>({
        resolver: zodResolver(MapDataSchema),
        mode: 'onSubmit',
    })

    // Helper function to flatten errors for better debugging
    const flattenErrors = (obj, prefix = '') => {
        return Object.keys(obj).reduce((acc, key) => {
            const pre = prefix.length ? `${prefix}.${key}` : key
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(acc, flattenErrors(obj[key], pre))
            } else {
                acc[pre] = obj[key]
            }
            return acc
        }, {})
    }

    // Log validation errors when they occur
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
        }
    }, [errors])

    // Watch form data
    const formData = watch()

    // Set default values when dependencies change or component mounts
    useEffect(() => {
        reset({
            id: mapId ? existingMapData?.dataStore?.id : generateUid(),
            mapType: mapId ? existingMapData?.dataStore?.mapType : 'Thematic',
            mapName: mapId ? existingMapData?.dataStore?.mapName : '',
            description: mapId ? existingMapData?.dataStore?.description : '',
            queries: {
                mapAnalyticsQueryOne: analyticsQuery,
                mapAnalyticsQueryTwo: mapAnalyticsQueryTwo,
                geoFeaturesQuery: geoFeaturesQuery,
            },
            dataSourceId: selectedDataSourceOption,
            createdBy: {
                name: userDatails?.me?.displayName,
                id: userDatails?.me?.id,
            },
            updatedBy: {
                name: userDatails?.me?.displayName,
                id: userDatails?.me?.id,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
            organizationTree: selectedOrgUnits,
            selectedOrgUnitLevel: selectedLevel,
            backedSelectedItems: backedSelectedItems,
            BasemapType: currentBasemap,
            mapSettings: mapSettings,
        })
    }, [
        analyticsQuery,
        mapAnalyticsQueryTwo,
        geoFeaturesQuery,
        selectedDataSourceOption,
        selectedOrgUnits,
        selectedLevel,
        userDatails,
        mapId,
        existingMapData,
        reset,
        backedSelectedItems,
        currentBasemap,
        mapSettings,
    ])

    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const onSubmit: SubmitHandler<MapDataFormFields> = async (formData) => {
        try {
            setErrorMessage(null)

            // Use the existing mapId or generate a new one
            const uid = mapId || generateUid()

            await engine.mutate({
                resource: `dataStore/${env.mapsStore}/${uid}`,
                type: mapId ? 'update' : 'create',
                data: formData,
            })

            notify.success(i18n.t('Map saved'))

            if (!mapId) {
                // added navigate(`/maps`) intentionally to fix length undefined bug
                navigate(`/maps`)
                navigate(`/map/${uid}/${formData?.mapName}`)
            }

            // Close the modal after saving
            setOpen(false)
        } catch (error) {
            console.error('Error saving map:', error)
            notify.error(i18n.t('Failed to save the map. Please try again.'))
            setErrorMessage('Failed to save map. Please try again.')
        }
    }

    // Debug logging

    // Log formData on change

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto transition-all duration-300 ease-in-out bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">Save Map</DialogTitle>
                </DialogHeader>

                {/* Display generic error message */}
                {errorMessage && (
                    <div className="p-2 bg-red-100 border border-red-300 text-red-700 mb-4">
                        {errorMessage}
                    </div>
                )}

                {/* Display Zod validation errors */}
                {Object.keys(errors).length > 0 && (
                    <div className="p-2 bg-red-100 border border-red-300 text-red-700 mb-4">
                        <p className="font-bold">Please fix the following errors:</p>
                        <ul className="list-disc pl-5">
                            {Object.entries(flattenErrors(errors)).map(([field, error]) => (
                                <li key={field}>
                                    {typeof error === 'object'
                                        ? (error as any)?.message || `Invalid ${field}`
                                        : `Invalid ${field}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Map Name Field */}
                    <div className="flex flex-col">
                        <Label htmlFor="mapName">Map Name</Label>
                        <Input
                            id="mapName"
                            {...register('mapName', { required: 'Map name is required' })}
                        />
                        {errors.mapName && (
                            <span className="text-red-500">{errors.mapName.message}</span>
                        )}
                    </div>

                    {/* Description Field */}
                    <div className="flex flex-col">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" {...register('description')} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            text={isSubmitting ? 'Saving...' : 'Save Map'}
                            disabled={isSubmitting}
                        />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
