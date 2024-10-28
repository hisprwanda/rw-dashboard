import React, { useEffect, useState } from 'react';
import Button from "../../components/Button";
import { useFetchVisualsData } from '../../services/fetchVisuals';
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { FaTrash } from 'react-icons/fa';
import DashboardVisualItem from './components/DashboardVisualItem';
import { useDataEngine } from '@dhis2/app-runtime';
import { generateUid } from '../../lib/uid';
import { useAuthorities } from '../../context/AuthContext';


// Extend Layout interface to include visualName, visualQuery, and visualType
interface ExtendedLayout extends Layout {
    visualName: string;
    visualQuery: any;
    visualType: string; // Added visualType property
}

interface VisualEntry {
    key: string;
    value: {
        visualName: string;
        query: any;
        visualType: string; // Added visualType property to VisualEntry
    };
}

const CreateDashboardPage: React.FC = () => {
    const { data: allSavedVisuals, loading, isError } = useFetchVisualsData();
  const {userDatails} = useAuthorities()
    const [selectedVisualsForDashboard, setSelectedVisualsForDashboard] = useState<ExtendedLayout[]>([]);
    const [selectedVisual, setSelectedVisual] = useState<VisualEntry | null>(null);

    // State for single dashboard data
    const [singleDashboardData, setSingleDashboardData] = useState({
        dashboardName: '', // is required
        dashboardDescription: '',
        selectedVisuals: [] as ExtendedLayout[], // is required
        createdBy:{
            name:userDatails?.me?.displayName,
            id:userDatails?.me?.id
          },
          updatedBy:{
            name:userDatails?.me?.displayName,
            id:userDatails?.me?.id
          },
          createdAt: Date.now(), 
          updatedAt: Date.now(), 
    });

    const visualOptions = allSavedVisuals?.dataStore?.entries?.map((entry: VisualEntry) => (
        <option key={entry.key} value={entry.key}>
            {entry.value.visualName} ({entry.value.visualType})
        </option>
    ));

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedKey = e.target.value;
        const visual = allSavedVisuals?.dataStore?.entries?.find(
            (entry: VisualEntry) => entry.key === selectedKey
        );
        setSelectedVisual(visual || null);
    };

    useEffect(() => {
        if (selectedVisual && !selectedVisualsForDashboard.some(visual => visual.i === selectedVisual.key)) {
            const newItem: ExtendedLayout = {
                i: selectedVisual.key,
                x: (selectedVisualsForDashboard.length * 3) % 12,
                y: Math.floor(selectedVisualsForDashboard.length / 4) * 3,
                w: 3,
                h: 3,
                visualName: selectedVisual.value.visualName,
                visualQuery: selectedVisual.value.query,
                visualType: selectedVisual.value.visualType, // Set visualType property
            };
            setSelectedVisualsForDashboard(prev => [...prev, newItem]);
        }
    }, [selectedVisual]);


    /// update selected visuals
    useEffect(() => {
        setSingleDashboardData(prev => ({
            ...prev,
            selectedVisuals: selectedVisualsForDashboard,
        }));
    }
,[selectedVisualsForDashboard])

    const handleLayoutChange = (newLayout: Layout[]) => {
        const updatedLayout = newLayout.map(layoutItem => {
            const existingVisual = selectedVisualsForDashboard.find(visual => visual.i === layoutItem.i);
            return existingVisual
                ? { ...layoutItem, visualName: existingVisual.visualName, visualQuery: existingVisual.visualQuery, visualType: existingVisual.visualType }
                : layoutItem;
        });
        setSelectedVisualsForDashboard(updatedLayout as ExtendedLayout[]);
    };

    // Handle widget deletion
    const handleDeleteWidget = (id: string) => {
        setSelectedVisualsForDashboard(prev => prev.filter(widget => widget.i !== id));
    };

    //
    const engine = useDataEngine();

    // Handle save changes
    const handleSaveChanges = async() => {
        const uid =  generateUid(); 
        try {

            await engine.mutate({
                resource: `dataStore/rw-dashboard/${uid}`,
                type: 'create',
                data: singleDashboardData,
            });
            console.log("save dashboard success")
        } catch (error) {
            console.error('Error saving dashboard:', error);
          
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-end">
                <div className='flex items-center gap-2'>
                    <Button text='Save changes' onClick={handleSaveChanges} />
                    <Button text='Print preview' />
                </div>
            </div>

            {/* Dashboard Name and Description Inputs */}
            <div className="mt-4 flex flex-row gap-2 ">
                <input
                required
                    type="text"
                    placeholder="Dashboard Name"
                    value={singleDashboardData.dashboardName}
                    onChange={(e) => setSingleDashboardData({ ...singleDashboardData, dashboardName: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mt-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <textarea
                    placeholder="Dashboard Description"
                    value={singleDashboardData.dashboardDescription}
                    onChange={(e) => setSingleDashboardData({ ...singleDashboardData, dashboardDescription: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mt-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            {/* Select Visuals Dropdown */}
            <select
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mt-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                <option value="">Select a visual...</option>
                {visualOptions}
            </select>

            {/* Dashboard Grid */}
            <MemoizedGridLayout
                layout={selectedVisualsForDashboard}
                onLayoutChange={handleLayoutChange}
                cols={12}
                rowHeight={100}
                width={1200}
                onDeleteWidget={handleDeleteWidget}
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
    width,
    onDeleteWidget
}: {
    layout: ExtendedLayout[];
    onLayoutChange: (layout: Layout[]) => void;
    cols: number;
    rowHeight: number;
    width: number;
    onDeleteWidget: (id: string) => void;
}) => (
    <GridLayout
        className="layout bg-[#f4f6f8] "
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
                    position: "relative",
                }}
            >
                <div className="drag-handle" style={{ cursor: "move", marginBottom: "5px" }}>
                    {widget.visualName}
                </div>
                {/* Widget content */}
                <div className='mx-3 max-h-3'>
                    <div className='w-full h-full'>
                        <DashboardVisualItem query={widget.visualQuery} visualType={widget.visualType} />
                    </div>
                </div>
                <FaTrash
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        cursor: "pointer",
                        color: "red",
                    }}
                    onClick={() => onDeleteWidget(widget.i)}
                />
            </div>
        ))}
    </GridLayout>
));

export default CreateDashboardPage;
