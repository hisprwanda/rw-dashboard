import i18n from '@dhis2/d2-i18n'

/*
 * Placeholder content carried over unchanged from the first bulletin prototype: the
 * outbreak table and the completeness grid are NOT computed from DHIS2 data yet.
 */

const OUTBREAK_SAMPLE: Array<[string, string, string, string, string, string]> = [
    ['Confirmed cases:', '4', 'Date reported:', 'July 14, 2024', 'Risk assessment:', 'Low'],
    ['Suspected cases', '4', 'Source:', 'eIDSR', '', ''],
    ['Death(s)', '0', 'District/HFs:', 'Kinyababa HC/ Butaro DH', '', ''],
    ['Total cases', '13', 'Geoscope:', 'Low', '', ''],
]

export const OutbreakSampleTable = () => (
    <table className="w-full table-auto" aria-label={i18n.t('Outbreak summary (sample)')}>
        <tbody>
            {OUTBREAK_SAMPLE.map((row) => (
                <tr key={row[0]}>
                    {row.map((cell, index) => (
                        <td
                            key={index}
                            className={`p-2 ${index % 2 === 0 && cell ? 'bg-slate-500 font-bold' : ''}`}
                        >
                            {cell}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
)

const COMPLETENESS_SAMPLE: Array<[string, number[]]> = [
    ['Area 1', [85, 75, 55, 90, 65, 50, 80, 70, 40, 88, 60, 45, 92, 68]],
    ['Area 1', [85, 100, 95, 90, 35, 90, 80, 80, 89, 88, 89, 95, 92, 98]],
]

const shade = (percent: number) =>
    percent >= 80 ? 'bg-green-500' : percent >= 60 ? 'bg-orange-500' : 'bg-red-500'

export const CompletenessSampleTable = () => (
    <table className="w-full table-auto text-center text-sm">
        <thead className="bg-gray-100">
            <tr>
                <th rowSpan={2} className="px-4 py-2">
                    {i18n.t('Hospital catchment area')}
                </th>
                <th colSpan={14} className="px-4 py-2">
                    {i18n.t('Completeness')}
                </th>
            </tr>
            <tr>
                {COMPLETENESS_SAMPLE[0]?.[1].map((_, week) => (
                    <th key={week} className="px-2 py-1">
                        W{String(week + 1).padStart(2, '0')}
                    </th>
                ))}
            </tr>
        </thead>
        <tbody>
            {COMPLETENESS_SAMPLE.map(([area, values], row) => (
                <tr key={row}>
                    <td className="border px-4 py-2">{area}</td>
                    {values.map((value, week) => (
                        <td key={week} className={`border px-2 py-1 text-white ${shade(value)}`}>
                            {value}%
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
)
