import React, { useEffect, useState ,useRef, useCallback} from 'react';
import Button from "../../components/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
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
import { DashboardSchema, DashboardFormFields, dashboardSettings } from '../../types/dashboard';
import { useFetchSingleDashboardData } from '../../services/fetchDashboard';
import { Loading } from '../../components';
import html2canvas from 'html2canvas';
import  PresentDashboard from './components/PresentDashboard';
import { FaPlay} from "react-icons/fa"
import { IoSaveOutline } from "react-icons/io5";
import { useToast } from "../../components/ui/use-toast";
import {  Maximize2, Minimize2 } from "lucide-react";
import i18n from '../../locales/index.js'

const CreateDashboardPage: React.FC = () => {
    const { toast } = useToast();
    const { id: dashboardId ,present:isPresentModeFromView} = useParams();
    const navigate = useNavigate();
    const { data: allSavedVisuals ,error,isError,loading} = useFetchVisualsData();
    const {data:singleSavedDashboardData,error:singleSavedDashboardDataError,isError:isErrorFetchSingleSavedDashboardData,loading:isLoadingFetchSingleSavedDashboardData} = useFetchSingleDashboardData(dashboardId)
    const [isPresentMode,setIsPresentMode] = useState(false)

    const [tempDashboardSettings,setTempDashboardSettings] = useState<dashboardSettings>({backgroundColor:"#dcdcdc"})
    // variable to store snapshot of grid box
    const captureRef = useRef<HTMLDivElement>(null);
      const [isFullscreen, setIsFullscreen] = useState(false);
    const [containerWidth, setContainerWidth] = useState(window.innerWidth);

   // console.log("test single data",singleSavedDashboardData)
    const { userDatails } = useAuthorities();
    const [isSuccess, setIsSuccess] = useState(false);
    const engine = useDataEngine();

    

    const { register, handleSubmit, setValue, watch, reset, formState: { errors,isSubmitting } } = useForm<DashboardFormFields>({
        resolver: zodResolver(DashboardSchema),
        defaultValues: {
            dashboardName: '',
            dashboardDescription: '',
            createdBy: {
                name: userDatails?.me?.displayName ,
                id: userDatails?.me?.id ,
            },
            updatedBy: {
                name: userDatails?.me?.displayName ,
                id: userDatails?.me?.id ,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
            selectedVisuals: [],
            sharing: [],
            previewImg:"",
            isOfficialDashboard: false,
            favorites:[],
            dashboardSettings:tempDashboardSettings
    
        },
    });

    useEffect(() => {
      if (Object.keys(errors).length > 0) {
        console.error('dashboard Validation Errors:', errors);
      }
    }, [errors]);
    ////// automatically set width of grid layout
    useEffect(() => {
        const handleResize = () => setContainerWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
    
        return () => window.removeEventListener("resize", handleResize);
      }, []);

    /// if edit mode, then reassigning dashboard
    useEffect(() => {
        if(isPresentModeFromView)
            {
                setIsPresentMode(true)
            }
        if(!isPresentModeFromView)
            {
                setIsPresentMode(false)
            }
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
                dashboardSettings: singleSavedDashboardData?.dataStore?.dashboardSettings || prevValues.dashboardSettings,
            }));
        }
      
    }, [singleSavedDashboardData, dashboardId, reset]);
    const selectedVisuals = watch("selectedVisuals");
    const backgroundColor = watch("dashboardSettings.backgroundColor", tempDashboardSettings.backgroundColor);


         // Watch form values
     const watchedValues = watch()

  useEffect(() => {
    setTempDashboardSettings((prev) => ({ ...prev, backgroundColor }));
  }, [backgroundColor]);
  
  const isVisualSelected = (visualKey: string) => {
    return selectedVisuals.some(v => v.i === visualKey);
};

const visualOptions = allSavedVisuals?.dataStore?.entries?.map((entry: any) => (
    <option 
        key={entry.key} 
        value={entry.key}
        disabled={isVisualSelected(entry.key)}
        className={isVisualSelected(entry.key) ? 'bg-gray-100 text-gray-500' : ''}
    >
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
                visualSettings: visual.value.visualSettings,
                visualTitleAndSubTitle: visual.value.visualTitleAndSubTitle,
                dataSourceId: visual.value.dataSourceId
            };
            setValue("selectedVisuals", [...selectedVisuals, newVisual]);
        }

    };

    const handleLayoutChange = (layout: Layout[]) => {
        const updatedLayout = layout.map(layoutItem => {
            const existingVisual = selectedVisuals.find(v => v.i === layoutItem.i);
            return existingVisual
                ? { ...layoutItem, visualName: existingVisual.visualName, visualQuery: existingVisual.visualQuery, visualType: existingVisual.visualType , visualSettings: existingVisual.visualSettings,
                    visualTitleAndSubTitle:existingVisual.visualTitleAndSubTitle, dataSourceId:existingVisual.dataSourceId }
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
        
        try {
            // First exit fullscreen if active
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
            
            // Wait for layout to stabilize after exiting fullscreen
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Capture the current GridLayout as an image
            if (captureRef.current) {
                // Temporarily remove overflow to capture full content
                const widgets = captureRef.current.getElementsByClassName('widget');
                const originalOverflows = Array.from(widgets).map(widget => (widget as HTMLElement).style.overflow);
                Array.from(widgets).forEach(widget => (widget as HTMLElement).style.overflow = 'visible');
                
                const canvas = await html2canvas(captureRef.current, {
                    allowTaint: true,
                    useCORS: true,
                    logging: false,
                    scale: 1,
                    windowWidth: containerWidth - 20,
                    windowHeight: captureRef.current.scrollHeight
                });
                
                // Restore original overflow settings
                Array.from(widgets).forEach((widget, index) => 
                    (widget as HTMLElement).style.overflow = originalOverflows[index]
                );
                
                const imgData = canvas.toDataURL("image/png");
                data.previewImg = imgData;
            }
    
            // Save the dashboard
            await engine.mutate({
                resource: `dataStore/${process.env.REACT_APP_DASHBOARD_STORE}/${uuid}`,
                type: dashboardId ? "update" : 'create',
                data,
            });
    
            toast({
                title: "Success",
                description: "saved successfully",
                variant: "default",
            });
            
            setIsSuccess(true);
            
            if(!dashboardId) {
                navigate(`/dashboards`);
                navigate(`/dashboard/${uuid}`);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
            console.error("Error saving dashboard:", error);
        }
    };

      /// view dashboard in full screen mode
      const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            captureRef.current?.requestFullscreen();
          setIsFullscreen(true);
         
        } else {
          document.exitFullscreen();
          setIsFullscreen(false);
       
        }
      }, []);

       // Handle fullscreen exit on Escape key press
       useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && document.fullscreenElement) {
                setIsFullscreen(false);
                document.exitFullscreen?.();
            }
        };
    
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
    
        window.addEventListener("keydown", handleKeyDown);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
    
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);
    

        // loading
        if(isLoadingFetchSingleSavedDashboardData || loading)
            {
                return <Loading/>
            }
            const dashboardName = watch("dashboardName");
    return ( isPresentMode ? <div className='flex flex-col  ' >
       {/* how can I pass dashboard name in PresentDashboard */}
      <PresentDashboard dashboardData={selectedVisuals} setIsPresentMode={setIsPresentMode}  dashboardName={dashboardName}   />
    </div>  :
        <form className="p-2" onSubmit={handleSubmit(onSubmit)}>
            <div className=" flex justify-between ">
                {/* dashboard name and description container */}
             <div className='flex gap-2' >
    {/* dashboard name */}
    <div>
                <input
                    {...register("dashboardName")}
                    type="text"
                    placeholder={i18n.t('Dashboard Name')}
                    className="block w-full min-w-[400px] px-3 py-2 border rounded-md shadow-sm mt-3"
                />
                {errors.dashboardName && <p className="text-red-500">{errors.dashboardName.message}</p>}
                </div>
             {/* dashboard description */}
                <textarea
                    {...register("dashboardDescription")}
                    placeholder={i18n.t('Dashboard Description')}
                    className="block w-full px-3 py-2 border rounded-md shadow-sm mt-3"
                />
                  {/* is dashboard official */}
             <div className="flex items-center gap-1 justify-between  text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-200" >
                <label htmlFor="officialDashboard" className="text-gray-700 font-medium whitespace-nowrap ">
        {i18n.t('Is Official Dashboard')}
    </label>
    <input
        type="checkbox"
        {...register("isOfficialDashboard")}
        id="officialDashboard"
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
                </div>
             </div>
           

             {/* action btns container */}
             <div  className="flex items-center  gap-2" >
             <Button onClick={toggleFullscreen} icon={<Maximize2/>}  text={i18n.t('FullScreen')}  disabled={isSubmitting} />
             <Button onClick={()=>setIsPresentMode(true)} icon={<FaPlay/>}  text={i18n.t('Present')}  disabled={isSubmitting} />
                <Button type="submit" text= {isSubmitting ? "Loading" : `${i18n.t('Save changes')}` } disabled={isSubmitting} icon={<IoSaveOutline/>}  />
          
             </div>
         
            </div>
  


            <div className="mt-4 grid grid-cols-2 gap-2">
               
             <div className="flex items-center gap-2 mt-4">
        <div className="flex items-center gap-2">
  <label htmlFor="backgroundColor" className="text-sm font-medium">
  {i18n.t('Background Color')}:
  </label>
  <input
    id="backgroundColor"
    type="color"
    defaultValue={tempDashboardSettings.backgroundColor}
    {...register("dashboardSettings.backgroundColor")}
    className="w-8 h-8 p-1 border rounded-md cursor-pointer border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
  />
</div>

</div>
           
            </div>
<div>
    <select
        onChange={handleSelectChange}
        className="block w-full px-3 py-2 border rounded-md shadow-sm mt-3"
    >
        <option value="">{loading ? "Loading" : `${i18n.t('Select a visual')}` }</option>
        {visualOptions}
    </select>
</div>



          
            <div ref={captureRef}  >
            <MemoizedGridLayout
                layout={selectedVisuals}
                onLayoutChange={handleLayoutChange}
                cols={12}
                rowHeight={100}
                width={containerWidth - 20} 
                onDeleteWidget={handleDeleteWidget}
                backgroundColor={tempDashboardSettings.backgroundColor}
                isFullscreen={isFullscreen}
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
    backgroundColor,
    onDeleteWidget,
    isFullscreen
}: {
    layout: ExtendedLayout[];
    onLayoutChange: (layout: Layout[]) => void;
    cols: number;
    rowHeight: number;
    width: number;
    backgroundColor:string;
    onDeleteWidget: (id: string) => void;
    isFullscreen: boolean;
}) => (
  
    <GridLayout
        className="layout"
        style={{backgroundColor,minHeight:"400px"}}
        layout={layout}
        onLayoutChange={onLayoutChange}
        cols={cols}
        rowHeight={rowHeight}
        width={width}
        draggableHandle=".drag-handle"
        resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n']}
    >
        {layout.map((widget) => (
            <div key={widget.i} className="widget bg-white " style={{ position: "relative", padding: "10px", overflow:"auto" }}>
                <div className="drag-handle  text-center " style={{ cursor: "move" }}>
                    {widget.visualName}
                </div>
                <DashboardVisualItem  query={widget.visualQuery} visualType={widget.visualType} visualSettings={widget.visualSettings}  dataSourceId={widget.dataSourceId} visualTitleAndSubTitle={widget.visualTitleAndSubTitle} />
             {!isFullscreen && <FaTrash
                    style={{ position: "absolute", top: "10px", right: "10px", cursor: "pointer" ,color:"#7d0000"}}
                    onClick={() => onDeleteWidget(widget.i)}
                /> }   
            </div>
        ))}
    </GridLayout>
 

));

export default CreateDashboardPage;