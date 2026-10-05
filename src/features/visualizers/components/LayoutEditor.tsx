import i18n from '@dhis2/d2-i18n'
import {
    FlyoutMenu,
    IconClock16,
    IconDimensionCategoryOptionGroupset16,
    IconDimensionData16,
    IconDimensionOrgUnit16,
    MenuItem,
    Popover,
} from '@dhis2/ui'
import { useRef, useState, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import {
    moveDimension,
    selectionActions,
    useDimensions,
    type LayoutArea,
    type LayoutDimensionName,
} from '@/features/analytics'
import { adaptLayoutToVisType } from '../utils/layoutRules'
import { visTypeFromChartType } from '../utils/visualization'

const ICONS: Record<string, ReactNode> = {
    Data: <IconDimensionData16 />,
    Period: <IconClock16 />,
    'Organisation unit': <IconDimensionOrgUnit16 />,
}

const areaLabels = (): Record<LayoutArea, string> => ({
    Columns: i18n.t('Columns'),
    Rows: i18n.t('Rows'),
    Filter: i18n.t('Filter'),
})

/** The built-in dimensions by their layout name; any other name is a dynamic dimension id. */
const dimensionLabel = (
    name: LayoutDimensionName,
    dynamicNames: ReadonlyMap<string, string>
): string => {
    const labels: Record<string, string> = {
        Data: i18n.t('Data'),
        Period: i18n.t('Period'),
        'Organisation unit': i18n.t('Organisation unit'),
    }
    return labels[name] ?? dynamicNames.get(name) ?? name
}

const AREAS: LayoutArea[] = ['Columns', 'Rows', 'Filter']

interface ChipTarget {
    label: string
    onSelect: () => void
}

/** A draggable dimension; its menu moves it with the keyboard too. */
const DimensionChip = ({
    label,
    icon,
    targets,
    onDragStart,
    onDragEnd,
}: {
    label: string
    icon: ReactNode
    targets: ChipTarget[]
    onDragStart: () => void
    onDragEnd: () => void
}) => {
    const ref = useRef<HTMLButtonElement>(null)
    const [open, setOpen] = useState(false)
    return (
        <>
            <button
                ref={ref}
                type="button"
                draggable
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="inline-flex cursor-move items-center gap-1 rounded border border-teal-200 bg-teal-50 px-2 text-sm text-teal-800"
            >
                {icon}
                {label}
            </button>
            {open && (
                <Popover
                    reference={ref}
                    placement="bottom-start"
                    arrow={false}
                    onClickOutside={() => setOpen(false)}
                >
                    <FlyoutMenu dense>
                        {targets.map((target) => (
                            <MenuItem
                                key={target.label}
                                label={i18n.t('Move to {{area}}', { area: target.label })}
                                onClick={() => {
                                    setOpen(false)
                                    target.onSelect()
                                }}
                            />
                        ))}
                    </FlyoutMenu>
                </Popover>
            )}
        </>
    )
}

interface Dragged {
    item: LayoutDimensionName
    from: LayoutArea
}

/** Drag dimensions between Columns, Rows and Filter (the analytics layout). */
export const LayoutEditor = () => {
    const dispatch = useAppDispatch()
    const layout = useAppSelector((state) => state.selection.layout)
    const dataSource = useAppSelector((state) => state.selection.dataSource)
    const chartType = useAppSelector((state) => state.visualizer.chartType)
    const dynamicDimensions = useDimensions(dataSource)
    const dynamicNames = new Map(
        (dynamicDimensions.data ?? []).map(({ id, displayName }) => [id, displayName])
    )
    const [dragged, setDragged] = useState<Dragged | null>(null)
    const labels = areaLabels()

    /** The moved layout, as far as the chart type allows (extra dimensions go to the filter). */
    const moved = (item: LayoutDimensionName, from: LayoutArea, to: LayoutArea) => {
        const next = moveDimension(layout, item, from, to)
        const visType = visTypeFromChartType(chartType)
        return visType ? adaptLayoutToVisType(next, visType) : next
    }

    const drop = (to: LayoutArea) => {
        if (dragged) {
            dispatch(selectionActions.setLayout(moved(dragged.item, dragged.from, to)))
        }
        setDragged(null)
    }

    const move = (item: LayoutDimensionName, from: LayoutArea, to: LayoutArea) =>
        dispatch(selectionActions.setLayout(moved(item, from, to)))

    const area = (name: LayoutArea) => (
        <div className="grid grid-cols-[72px_1fr] items-center gap-2">
            <span className="text-sm font-medium text-gray-600">{labels[name]}</span>
            {/* Drop target for mouse users; keyboard users move chips with their menu. */}
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div
                className="flex min-h-[30px] flex-wrap gap-1 rounded border border-gray-300 bg-white p-1"
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => drop(name)}
                data-test={`layout-${name.toLowerCase()}`}
            >
                {layout[name].map((item) => (
                    <DimensionChip
                        key={item}
                        label={dimensionLabel(item, dynamicNames)}
                        icon={ICONS[item] ?? <IconDimensionCategoryOptionGroupset16 />}
                        targets={AREAS.filter((to) => to !== name).map((to) => ({
                            label: labels[to],
                            onSelect: () => move(item, name, to),
                        }))}
                        onDragStart={() => setDragged({ item, from: name })}
                        onDragEnd={() => setDragged(null)}
                    />
                ))}
            </div>
        </div>
    )

    return (
        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 p-2">
            <div className="flex flex-col gap-1">
                {area('Columns')}
                {area('Rows')}
            </div>
            {area('Filter')}
        </div>
    )
}
