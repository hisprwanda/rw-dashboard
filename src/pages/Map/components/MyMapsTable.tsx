import i18n from '@dhis2/d2-i18n'
import { useMemo, useState } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import { RiDeleteBin5Line } from 'react-icons/ri'
import { IoIosMore } from 'react-icons/io'
import { CiEdit } from 'react-icons/ci'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table'
import { Button } from '@mantine/core'
import { GenericModal } from '../../../components'
import { useFetchVisualsData } from '../../../services/fetchVisuals'
import { useNavigate } from 'react-router-dom'
import { useAuthorities } from '../../../context/AuthContext'
import { FaEye, FaRegTrashAlt } from 'react-icons/fa'
import { useNotify } from '@/shared/hooks'
import { useFetchAllSavedMaps } from '../../../services/maps'
import { DeleteMapModal } from './DeleteMapModal'
import { env } from '@/shared/constants/env'

const MyMapsTable = ({ savedVisualData }: { savedVisualData: any[] }) => {
    const notify = useNotify()
    const { setAnalyticsData, setMetaDataLabels } = useAuthorities()
    const navigate = useNavigate()
    const { refetch } = useFetchAllSavedMaps()
    const [isShowDeleteVisual, setIsShowDeleteVisual] = useState<boolean>(false)
    const [selectedVisual, setSelectedVisual] = useState<any | undefined>()
    const [deleteModalData, setDeleteModalData] = useState<{
        mapId: string
        mapName: string
    } | null>(null)

    // Ensure savedVisualData is an array
    const data = Array.isArray(savedVisualData) ? savedVisualData : []

    /// Columns definition
    const columns = useMemo<MRT_ColumnDef<any>[]>(
        () => [
            {
                accessorKey: 'value.mapName',
                header: `${i18n.t('Name')}`,
            },
            {
                accessorKey: 'value.mapType',
                header: `${i18n.t('Type')}`,
            },
            {
                accessorKey: 'value.createdAt',
                header: `${i18n.t('Created At')}`,
                Cell: ({ cell }) => {
                    const timestamp = cell.getValue<number>()
                    const formattedDate = new Date(timestamp).toLocaleString()
                    return formattedDate
                },
            },
            {
                accessorKey: 'value.updatedAt',
                header: `${i18n.t('Updated At')}`,
                Cell: ({ cell }) => {
                    const timestamp = cell.getValue<number>()
                    const formattedDate = new Date(timestamp).toLocaleString()
                    return formattedDate
                },
            },
        ],
        []
    )

    // Handlers that log the key
    const handleView = (data: any) => {
        setAnalyticsData([])
        setMetaDataLabels({})
        navigate(`/map/${data?.key}/${data.value.mapName}`)
    }

    const engine = useDataEngine()
    const handleDeleteMap = async (MapId: string) => {
        try {
            await engine.mutate({
                resource: `dataStore/${env.mapsStore}/${MapId}`,
                type: 'delete',
            })

            notify.success(i18n.t('Map deleted'))
            refetch()
        } catch (error) {
            notify.error(i18n.t('Something went wrong. Please try again.'))
            console.error('Failed to delete Map:', error)
        }
    }

    const table = useMantineReactTable({
        columns,
        data,
        enableRowActions: true,
        positionActionsColumn: 'last',
        displayColumnDefOptions: {
            'mrt-row-actions': {
                header: `${i18n.t('Actions')}`,
                size: 55,
            },
        },
        renderRowActions: ({ row }) => (
            <div className="flex gap-2  ">
                <FaEye
                    className="text-xl hover:cursor-pointer  hover:text-primary "
                    onClick={() => handleView(row?.original)}
                />
                <RiDeleteBin5Line
                    className="text-xl  hover:cursor-pointer text-red-600  hover:text-red-900 "
                    onClick={() =>
                        setDeleteModalData({
                            mapId: row.original.key,
                            mapName: row.original.value.mapName,
                        })
                    }
                />
            </div>
        ),
    })

    // Table component
    return (
        <div>
            {deleteModalData && (
                <DeleteMapModal
                    MapId={deleteModalData.mapId}
                    MapName={deleteModalData.mapName}
                    onClose={() => setDeleteModalData(null)}
                    onDelete={handleDeleteMap}
                />
            )}

            <MantineReactTable table={table} />
        </div>
    )
}

export default MyMapsTable
