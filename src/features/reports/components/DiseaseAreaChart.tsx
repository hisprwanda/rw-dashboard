import {
    Area,
    AreaChart,
    CartesianGrid,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import type { SeriesPoint } from '../utils/diseaseSeries'

interface DiseaseAreaChartProps {
    title: string
    points: SeriesPoint[]
    color: string
}

/** Weekly cases of one disease. */
export const DiseaseAreaChart = ({ title, points, color }: DiseaseAreaChartProps) => (
    <figure className="m-0 mb-8">
        <figcaption className="mb-2 text-center font-semibold">{title}</figcaption>
        <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={points} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" name={title} fill={color} stroke={color}>
                    <LabelList
                        dataKey="value"
                        position="top"
                        style={{ fontSize: 12, fontWeight: 'bold' }}
                    />
                </Area>
            </AreaChart>
        </ResponsiveContainer>
    </figure>
)
