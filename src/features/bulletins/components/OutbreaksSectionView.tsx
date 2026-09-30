import i18n from '@dhis2/d2-i18n'
import { Button, Input } from '@dhis2/ui'
import type { BulletinContext, OutbreakRow, OutbreaksSection } from '../types/bulletin.types'
import { pickText } from '../utils/localizedText'
import { SectionFrame } from './SectionFrame'

interface OutbreaksSectionViewProps {
    section: OutbreaksSection
    context: BulletinContext
    rows: OutbreakRow[]
    editable: boolean
    onChange: (rows: OutbreakRow[]) => void
}

/** A table the author fills in for this issue (e.g. ongoing outbreaks). */
export const OutbreaksSectionView = ({
    section,
    context,
    rows,
    editable,
    onChange,
}: OutbreaksSectionViewProps) => {
    const label = (text: OutbreaksSection['title']) =>
        pickText(text, context.language, context.languages)
    const setCell = (rowIndex: number, columnId: string, value: string) =>
        onChange(rows.map((row, i) => (i === rowIndex ? { ...row, [columnId]: value } : row)))
    return (
        <SectionFrame title={label(section.title)} description={label(section.description ?? {})}>
            <table className="w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        {section.columns.map((column) => (
                            <th key={column.id} className="border px-2 py-1 text-left">
                                {label(column.label)}
                            </th>
                        ))}
                        {editable && <th className="no-print w-10 border" />}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {section.columns.map((column) => (
                                <td key={column.id} className="border px-2 py-1">
                                    {editable ? (
                                        <Input
                                            dense
                                            value={row[column.id] ?? ''}
                                            onChange={({ value }) =>
                                                setCell(rowIndex, column.id, value ?? '')
                                            }
                                        />
                                    ) : (
                                        row[column.id]
                                    )}
                                </td>
                            ))}
                            {editable && (
                                <td className="no-print border px-1">
                                    <Button
                                        small
                                        destructive
                                        secondary
                                        onClick={() =>
                                            onChange(rows.filter((_, i) => i !== rowIndex))
                                        }
                                    >
                                        {i18n.t('Remove')}
                                    </Button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {!rows.length && (
                        <tr>
                            <td colSpan={section.columns.length + 1} className="p-3 text-gray-500">
                                {i18n.t('No rows yet.')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {editable && (
                <div className="no-print mt-2">
                    <Button small onClick={() => onChange([...rows, {}])}>
                        {i18n.t('Add row')}
                    </Button>
                </div>
            )}
        </SectionFrame>
    )
}
