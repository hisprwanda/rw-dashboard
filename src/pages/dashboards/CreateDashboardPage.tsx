import React, { useEffect, useState } from 'react';
import Button from "../../components/Button";
import { useFetchVisualsData } from '../../services/fetchVisuals';
import { useAuthorities } from '../../context/AuthContext';
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const CreateDashboardPage: React.FC = () => {
    const { data: allSavedVisuals, loading, isError } = useFetchVisualsData();

    const [selectedVisualsForDashboard, setSelectedVisualsForDashboard] = useState<Layout[]>([]);
    const [selectedVisual, setSelectedVisual] = useState('');

    const visualOptions = allSavedVisuals?.dataStore?.entries?.map((entry: any) => (
        <option key={entry.key} value={entry.key}>
            {entry?.value?.visualName}
        </option>
    ));

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVisual(e.target.value);
    };

    const addVisualToDashboard = () => {
        if (selectedVisual && !selectedVisualsForDashboard.some(visual => visual.i === selectedVisual)) {
            const newItem: Layout = {
                i: selectedVisual,
                x: (selectedVisualsForDashboard.length * 3) % 12,
                y: Math.floor(selectedVisualsForDashboard.length / 4) * 3,
                w: 3,
                h: 3,
            };
            setSelectedVisualsForDashboard([...selectedVisualsForDashboard, newItem]);
        }
    };

    const handleLayoutChange = (newLayout: Layout[]) => {
        // Only update layout if there’s an actual change
        if (JSON.stringify(newLayout) !== JSON.stringify(selectedVisualsForDashboard)) {
            setSelectedVisualsForDashboard(newLayout);
        }
    };

    useEffect(() => {
        console.log("Selected Visuals for Dashboard:", selectedVisualsForDashboard);
    }, [selectedVisualsForDashboard]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-end">
                <div className='flex items-center gap-2'>
                    <Button text='Save changes' />
                    <Button text='Print preview' />
                </div>
            </div>

            {/* Select Visuals Dropdown */}
            <select
                value={selectedVisual}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mt-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                {visualOptions}
            </select>

            <button
                onClick={addVisualToDashboard}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md mt-3"
            >
                Add Visual to Dashboard
            </button>

            {/* Dashboard Grid */}
            <MemoizedGridLayout
                layout={selectedVisualsForDashboard}
                onLayoutChange={handleLayoutChange}
                cols={12}
                rowHeight={100}
                width={1200}
            />
        </div>
    );
};

// Memoized GridLayout to prevent unnecessary re-renders
const MemoizedGridLayout = React.memo(({
    layout,
    onLayoutChange,
    cols,
    rowHeight,
    width
}: {
    layout: Layout[];
    onLayoutChange: (layout: Layout[]) => void;
    cols: number;
    rowHeight: number;
    width: number;
}) => (
    <GridLayout
        className="layout"
        layout={layout}
        onLayoutChange={onLayoutChange}
        cols={cols}
        rowHeight={rowHeight}
        width={width}
        draggableHandle=".drag-handle"
    >
        {layout.map((widget) => (
            <div
                key={widget.i}
                className="widget"
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: "#fff",
                    padding: "10px",
                }}
            >
                <div className="drag-handle" style={{ cursor: "move", marginBottom: "5px" }}>
                    Drag Widget {widget.i}
                </div>
                <div>Widget {widget.i} content here</div>
            </div>
        ))}
    </GridLayout>
));

export default CreateDashboardPage;
