import React, { useEffect, useState ,useRef} from 'react';
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
import { useParams ,useNavigate} from 'react-router-dom';
import { DashboardSchema, DashboardFormFields } from '../../types/dashboard';
import { useFetchSingleDashboardData } from '../../services/fetchDashboard';
import { Loading } from '../../components';
import html2canvas from 'html2canvas';
import  PresentDashboard from './components/PresentDashboard';



const CreateDashboardPage: React.FC = () => {
    const { id: dashboardId } = useParams();
    const navigate = useNavigate();
    const { data: allSavedVisuals ,error,isError,loading} = useFetchVisualsData();
    const {data:singleSavedDashboardData,error:singleSavedDashboardDataError,isError:isErrorFetchSingleSavedDashboardData,loading:isLoadingFetchSingleSavedDashboardData} = useFetchSingleDashboardData(dashboardId)
    const [isPresentMode,setIsPresentMode] = useState(false)
    // variable to stre snapshot of grid box
    const captureRef = useRef<HTMLDivElement>(null);


    console.log("test single data",singleSavedDashboardData)
    const { userDatails } = useAuthorities();
    const [isSuccess, setIsSuccess] = useState(false);
    const engine = useDataEngine();

    

    const { register, handleSubmit, setValue, watch, reset, formState: { errors,isSubmitting } } = useForm<DashboardFormFields>({
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
            previewImg:"",
            isOfficialDashboard: false,
            favorites:[]
    
        },
    });


    /// if edit mode, then reassigning dashboard
    useEffect(() => {
        if (dashboardId && singleSavedDashboardData) {
            reset((prevValues) => ({
                ...prevValues, 
                dashboardName: singleSavedDashboardData?.dataStore?.dashboardName || prevValues.dashboardName,
                dashboardDescription: singleSavedDashboardData?.dataStore?.dashboardDescription || prevValues.dashboardDescription,
                selectedVisuals: singleSavedDashboardData?.dataStore?.selectedVisuals   ,
                sharing: singleSavedDashboardData?.dataStore?.sharing || prevValues.sharing,
                createdBy: singleSavedDashboardData?.dataStore?.createdBy || prevValues.createdBy,
                createdAt: singleSavedDashboardData?.dataStore?.createdAt || prevValues.createdAt,
                isOfficialDashboard: singleSavedDashboardData?.dataStore?.isOfficialDashboard || prevValues.isOfficialDashboard,
                favorites: singleSavedDashboardData?.dataStore?.favorites || prevValues.favorites,
            }));
        }
    }, [singleSavedDashboardData, dashboardId, reset]);
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
        setIsSuccess(false);
             // Capture the current GridLayout as an image
             if (captureRef.current) {
                const canvas = await html2canvas(captureRef.current);
                const imgData = canvas.toDataURL("image/png");
                data.previewImg = imgData; // Set the previewImg in the data
            }
        try {
            await engine.mutate({
                resource: `dataStore/rw-dashboard/${uuid}`,
                type: dashboardId ? "update" : 'create',
                data,
            });
            //temporally success message
            setIsSuccess(true);
            if(!dashboardId){
                // temporary fix to navigate to edit mode after saving new dashboard
                navigate(`/dashboards`)  
                     navigate(`/dashboard/${uuid}`)    
                     }
            console.log("Dashboard saved successfully");
        } catch (error) {
            console.error("Error saving dashboard:", error);
        }
    };

        // loading
        if(isLoadingFetchSingleSavedDashboardData || loading)
            {
                return <Loading/>
            }
    return ( isPresentMode ? <div className='flex justify-center' >

        <PresentDashboard dashboardData={selectedVisuals} setIsPresentMode={setIsPresentMode}   />
    </div>  :
        <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-end gap-2">
                <Button type="submit" text= {isSubmitting ? "Loading" : dashboardId ? "UPDATE" :  "Save changes" } disabled={isSubmitting} />
                <Button onClick={()=>setIsPresentMode(true)} text= "Present"  disabled={isSubmitting} />
         
            </div>
            {/* temporally is success message */}
            {isSuccess && (
  <p className="mt-2 p-4 text-green-700 bg-green-100 border border-green-300 rounded-md">
    Dashboard saved successfully
  </p>
)}


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
             <div className="flex items-center gap-2 mt-4">
    <input
        type="checkbox"
        {...register("isOfficialDashboard")}
        id="officialDashboard"
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <label htmlFor="officialDashboard" className="text-gray-700 font-medium">
        Official Dashboard
    </label>
</div>
           
            </div>

            <select
                onChange={handleSelectChange}
                className="block w-full px-3 py-2 border rounded-md shadow-sm mt-3"
            >
                <option value="">{loading ? "Loading" : "Select a visual..."}</option>
                {visualOptions}
            </select>
            <div ref={captureRef} >
            <MemoizedGridLayout
                layout={selectedVisuals}
                onLayoutChange={handleLayoutChange}
                cols={12}
                rowHeight={100}
                width={1200}
                onDeleteWidget={handleDeleteWidget}
            />
            </div>
          
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
            <div key={widget.i} className="widget bg-white " style={{ position: "relative", padding: "10px" }}>
                <div className="drag-handle" style={{ cursor: "move" }}>
                    {widget.visualName}
                </div>
                <DashboardVisualItem query={widget.visualQuery} visualType={widget.visualType} />
                <FaTrash
                    style={{ position: "absolute", top: "10px", right: "10px", cursor: "pointer" ,color:"#7d0000"}}
                    onClick={() => onDeleteWidget(widget.i)}
                />
            </div>
        ))}
    </GridLayout>
 

));

export default CreateDashboardPage;