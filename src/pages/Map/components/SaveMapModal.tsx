import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateUid } from "../../../lib/uid";
import { MapDataFormFields, MapDataSchema } from "../../../types/mapFormTypes";
import { useDataEngine } from "@dhis2/app-runtime";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import Button from "../../../components/Button";
import { useAuthorities } from "../../../context/AuthContext";
import { useToast } from "../../../components/ui/use-toast";

interface SaveMapModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mapId?: string;
  existingMapData?: any;
}

export function SaveMapModal({
  open,
  setOpen,
  mapId,
  existingMapData,
}: SaveMapModalProps) {
  // Get user and data source details from context
  const { userDatails, selectedDataSourceOption, selectedOrgUnits, selectedLevel, analyticsQuery, mapAnalyticsQueryTwo, geoFeaturesQuery,backedSelectedItems } = useAuthorities();
  const { toast } = useToast();
  const engine = useDataEngine();

  // Initialize form with resolver but without default values initially
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MapDataFormFields>({
    resolver: zodResolver(MapDataSchema),
  });

  // Watch form data
  const formData = watch();
  
  // Set default values when dependencies change or component mounts
  useEffect(() => {
    // Only set default values if not editing an existing map
    if (!mapId || !existingMapData) {
      reset({
        id: generateUid(),
        mapType: "Thematic",
        mapName: "",
        description: "",
        queries: {
          mapAnalyticsQueryOne: analyticsQuery,
          mapAnalyticsQueryTwo: mapAnalyticsQueryTwo,
          geoFeaturesQuery: geoFeaturesQuery,
        },
        dataSourceId: selectedDataSourceOption,
        createdBy: {
          name: userDatails?.me?.displayName,
          id: userDatails?.me?.id,
        },
        updatedBy: {
          name: userDatails?.me?.displayName,
          id: userDatails?.me?.id,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        organizationTree: selectedOrgUnits,
        selectedOrgUnitLevel: selectedLevel,
        backedSelectedItems:backedSelectedItems
      });
    }
  }, [
    analyticsQuery, 
    mapAnalyticsQueryTwo, 
    geoFeaturesQuery, 
    selectedDataSourceOption, 
    selectedOrgUnits, 
    selectedLevel, 
    userDatails, 
    mapId, 
    existingMapData, 
    reset
  ]);

  // If editing an existing map, pre-fill the form fields
  useEffect(() => {
    if (mapId && existingMapData) {
      reset((prevValues) => ({
        ...prevValues,
        id: existingMapData?.dataStore?.id,
        mapName: existingMapData?.dataStore?.mapName || prevValues.mapName,
        backedSelectedItems: existingMapData?.dataStore?.backedSelectedItems || prevValues.backedSelectedItems,
        description: existingMapData?.dataStore?.description || prevValues.description,
        createdAt: existingMapData?.dataStore?.createdAt || prevValues.createdAt,
    }));
    }
  }, [
    mapId, 
    existingMapData, 
    reset, 
    analyticsQuery, 
    mapAnalyticsQueryTwo, 
    geoFeaturesQuery, 
    selectedDataSourceOption,
    selectedOrgUnits,
    selectedLevel,
    userDatails
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit: SubmitHandler<MapDataFormFields> = async (formData) => {
    setErrorMessage(null);
    // Use the existing mapId or generate a new one
    const uid = mapId || generateUid();

    try {
      await engine.mutate({
        resource: `dataStore/${process.env.REACT_APP_MAPS_STORE}/${uid}`,
        type: mapId ? "update" : "create",
        data: formData,
      });
      toast({
        title: "Success",
        description: "Map saved successfully",
        variant: "default",
      });
      // Close the modal after saving
      setOpen(false);
    } catch (error) {
      console.error("Error saving map:", error);
      toast({
        title: "Error",
        description: "Failed to save map. Please try again.",
        variant: "destructive",
      });
      setErrorMessage("Failed to save map. Please try again.");
    }
  };

  // Debug logging
  useEffect(() => {
    console.log("Context values:", { 
      userDatails, 
      selectedDataSourceOption, 
      selectedOrgUnits, 
      selectedLevel,
      analyticsQuery,
      mapAnalyticsQueryTwo,
      geoFeaturesQuery
    });
  }, [
    userDatails, 
    selectedDataSourceOption, 
    selectedOrgUnits, 
    selectedLevel,
    analyticsQuery,
    mapAnalyticsQueryTwo,
    geoFeaturesQuery
  ]);

  // Log formData on change
  useEffect(() => {
    console.log("Updated map formData:", formData);
  }, [formData]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto transition-all duration-300 ease-in-out bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Save Map</DialogTitle>
        </DialogHeader>

        {errorMessage && (
          <div className="p-2 bg-red-100 border border-red-300 text-red-700 mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Map Name Field */}
          <div className="flex flex-col">
            <Label htmlFor="mapName">Map Name</Label>
            <Input
              id="mapName"
              {...register("mapName", { required: "Map name is required" })}
            />
            {errors.mapName && (
              <span className="text-red-500">{errors.mapName.message}</span>
            )}
          </div>

          {/* Description Field */}
          <div className="flex flex-col">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              text={isSubmitting ? "Saving..." : "Save Map"}
              disabled={isSubmitting}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}