import i18n from '@dhis2/d2-i18n'
import { Input } from '@dhis2/ui'
import { useState } from 'react'
import { systemDefaultColorPalettes, type ColorPalette } from '@/features/charts'

interface ColorPalettePickerProps {
    value: ColorPalette
    onChange: (palette: ColorPalette) => void
}

const Swatches = ({ palette }: { palette: ColorPalette }) => (
    <div className="flex h-4 overflow-hidden rounded">
        {palette.itemsBackgroundColors.slice(0, 8).map((color, index) => (
            <span key={index} className="flex-1" style={{ backgroundColor: color }} />
        ))}
    </div>
)

/** Searchable list of the built-in color palettes. */
export const ColorPalettePicker = ({ value, onChange }: ColorPalettePickerProps) => {
    const [search, setSearch] = useState('')
    const palettes = systemDefaultColorPalettes.filter((palette) =>
        palette.name.toLowerCase().includes(search.trim().toLowerCase())
    )
    return (
        <div className="flex flex-col gap-2">
            <Input
                dense
                placeholder={i18n.t('Search palettes')}
                value={search}
                onChange={({ value: next }) => setSearch(next ?? '')}
            />
            <div className="flex max-h-[260px] flex-col gap-1 overflow-y-auto">
                {palettes.map((palette) => (
                    <button
                        key={palette.name}
                        type="button"
                        onClick={() => onChange(palette)}
                        aria-pressed={palette.name === value.name}
                        className={`rounded border p-2 text-left text-sm ${
                            palette.name === value.name
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <span className="mb-1 block">{palette.name}</span>
                        <Swatches palette={palette} />
                    </button>
                ))}
            </div>
        </div>
    )
}
