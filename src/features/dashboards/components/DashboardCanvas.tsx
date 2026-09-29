import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import i18n from '@dhis2/d2-i18n'
import { Button, IconCross16 } from '@dhis2/ui'
import { memo } from 'react'
import GridLayout, { WidthProvider, type Layout } from 'react-grid-layout'
import { NO_EXPORT_CLASS } from '../utils/capture'
import { DashboardItemContent, itemTitle, type DashboardItem } from './DashboardItemContent'

const AutoWidthGrid = WidthProvider(GridLayout)

interface DashboardCanvasProps {
    items: readonly DashboardItem[]
    backgroundColor: string
    editable: boolean
    onLayoutChange: (layout: Layout[]) => void
    onRemove: (id: string) => void
}

/** The dashboard grid: drag by the title, resize from any edge, remove with ×. */
const Canvas = ({
    items,
    backgroundColor,
    editable,
    onLayoutChange,
    onRemove,
}: DashboardCanvasProps) => {
    return (
        <AutoWidthGrid
            className="min-h-[400px]"
            style={{ backgroundColor }}
            layout={items.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))}
            cols={12}
            rowHeight={100}
            isDraggable={editable}
            isResizable={editable}
            draggableHandle=".drag-handle"
            resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n']}
            onLayoutChange={onLayoutChange}
        >
            {items.map((item) => (
                <div
                    key={item.i}
                    data-item-id={item.i}
                    className="flex flex-col overflow-hidden rounded bg-white shadow-sm"
                >
                    <div
                        className={`drag-handle flex items-center justify-between gap-2 border-b border-gray-100 px-2 py-1 text-sm font-medium ${
                            editable ? 'cursor-move' : ''
                        }`}
                    >
                        <span className="truncate">{itemTitle(item)}</span>
                        {editable && (
                            <span className={NO_EXPORT_CLASS}>
                                <Button
                                    small
                                    secondary
                                    icon={<IconCross16 />}
                                    aria-label={i18n.t('Remove {{name}}', {
                                        name: itemTitle(item),
                                    })}
                                    onClick={() => onRemove(item.i)}
                                />
                            </span>
                        )}
                    </div>
                    <div className="min-h-0 flex-1 overflow-auto p-2">
                        <DashboardItemContent item={item} />
                    </div>
                </div>
            ))}
        </AutoWidthGrid>
    )
}

/** Memoized: typing in the name field must not re-render every chart. */
export const DashboardCanvas = memo(Canvas)
