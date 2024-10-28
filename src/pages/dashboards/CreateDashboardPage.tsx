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
import { z } from "zod";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';

// Schema definition using zod
const DashboardSchema = z.object({
    dashboardName: z.string().nonempty("Dashboard name is required"),
    dashboardDescription: z.string().optional(),
    createdBy: z.object({
        name: z.string(),
        id: z.string(),
    }),
    createdAt: z.number(),
    updatedAt: z.number(),
    updatedBy: z.object({
        name: z.string(),
        id: z.string(),
    }),
    selectedVisuals: z.array(
        z.object({
            i: z.string(),
            x: z.number(),
            y: z.number(),
            w: z.number(),
            h: z.number(),
            visualName: z.string(),
            visualQuery: z.any(),
            visualType: z.string(),
        })
    ),
    sharing: z.array(z.unknown()).optional(),
});

// Infer form fields from the schema
type DashboardFormFields = z.infer<typeof DashboardSchema>;

const CreateDashboardPage: React.FC = () => {
    const { id: dashboardId } = useParams();
    const { data: allSavedVisuals } = useFetchVisualsData();
    const { userDatails } = useAuthorities();
    const engine = useDataEngine();

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DashboardFormFields>({
        resolver: zodResolver(DashboardSchema),
        defaultValues: {
         
            dashboardName: '',
            dashboardDescription: '',
            createdBy: {
                name: userDatails?.me?.displayName || '',
                id: userDatails?.me?.id || '',
            },
            updatedBy: {
                name: userDatails?.me?.displayName || '',
                id: userDatails?.me?.id || '',
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
            selectedVisuals: [],
            sharing: [],
        },
    });

    const selectedVisuals = watch("selectedVisuals");


         // Watch form values
  const watchedValues = watch();

  // Log form data when it changes
  useEffect(() => {
    console.log('dashboard data Form data changed:', watchedValues);
  }, [watchedValues]);

    const visualOptions = allSavedVisuals?.dataStore?.entries?.map((entry: any) => (
        <option key={entry.key} value={entry.key}>
            {entry.value.visualName} ({entry.value.visualType})
        </option>
    ));

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedKey = e.target.value;
        const visual = allSavedVisuals?.dataStore?.entries?.find((entry: any) => entry.key === selectedKey);

        if (visual && !selectedVisuals.some(v => v.i === visual.key)) {
            const newVisual = {
                i: visual.key,
                x: (selectedVisuals.length * 3) % 12,
                y: Math.floor(selectedVisuals.length / 4) * 3,
                w: 3,
                h: 3,
                visualName: visual.value.visualName,
                visualQuery: visual.value.query,
                visualType: visual.value.visualType,
            };
            setValue("selectedVisuals", [...selectedVisuals, newVisual]);
        }
    };

    const handleLayoutChange = (layout: Layout[]) => {
        const updatedLayout = layout.map(layoutItem => {
            const existingVisual = selectedVisuals.find(v => v.i === layoutItem.i);
            return existingVisual
                ? { ...layoutItem, visualName: existingVisual.visualName, visualQuery: existingVisual.visualQuery, visualType: existingVisual.visualType }
                : layoutItem;
        });
        setValue("selectedVisuals", updatedLayout);
    };

    const handleDeleteWidget = (id: string) => {
        setValue("selectedVisuals", selectedVisuals.filter(widget => widget.i !== id));
    };

    const onSubmit: SubmitHandler<DashboardFormFields> = async (data) => {
        const uuid = dashboardId || generateUid()
        try {
            await engine.mutate({
                resource: `dataStore/rw-dashboard/${uuid}`,
                type: 'create',
                data,
            });
            console.log("Dashboard saved successfully");
        } catch (error) {
            console.error("Error saving dashboard:", error);
        }
    };

    return (
        <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-end gap-2">
                <Button type="submit" text="Save changes" />
                <Button text="Print preview" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <div>
                <input
                    {...register("dashboardName")}
                    type="text"
                    placeholder="Dashboard Name"
                    className="block w-full px-3 py-2 border rounded-md shadow-sm mt-3"
                />
                {errors.dashboardName && <p className="text-red-500">{errors.dashboardName.message}</p>}
                </div>
             
                
                <textarea
                    {...register("dashboardDescription")}
                    placeholder="Dashboard Description"
                    className="block w-full px-3 py-2 border rounded-md shadow-sm mt-3"
                />
            </div>

            <select
                onChange={handleSelectChange}
                className="block w-full px-3 py-2 border rounded-md shadow-sm mt-3"
            >
                <option value="">Select a visual...</option>
                {visualOptions}
            </select>

            <MemoizedGridLayout
                layout={selectedVisuals}
                onLayoutChange={handleLayoutChange}
                cols={12}
                rowHeight={100}
                width={1200}
                onDeleteWidget={handleDeleteWidget}
            />
        </form>
    );
};

// Memoized GridLayout component to prevent unnecessary re-renders
const MemoizedGridLayout = React.memo(({
    layout,
    onLayoutChange,
    cols,
    rowHeight,
    width,
    onDeleteWidget,
}: {
    layout: ExtendedLayout[];
    onLayoutChange: (layout: Layout[]) => void;
    cols: number;
    rowHeight: number;
    width: number;
    onDeleteWidget: (id: string) => void;
}) => (
    <GridLayout
        className="layout bg-[#f4f6f8]"
        layout={layout}
        onLayoutChange={onLayoutChange}
        cols={cols}
        rowHeight={rowHeight}
        width={width}
        draggableHandle=".drag-handle"
    >
        {layout.map((widget) => (
            <div key={widget.i} className="widget" style={{ position: "relative", padding: "10px" }}>
                <div className="drag-handle" style={{ cursor: "move" }}>
                    {widget.visualName}
                </div>
                <DashboardVisualItem query={widget.visualQuery} visualType={widget.visualType} />
                <FaTrash
                    style={{ position: "absolute", top: "10px", right: "10px", cursor: "pointer" }}
                    onClick={() => onDeleteWidget(widget.i)}
                />
            </div>
        ))}
    </GridLayout>
));

export default CreateDashboardPage;
