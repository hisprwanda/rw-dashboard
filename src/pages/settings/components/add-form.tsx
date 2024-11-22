import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { encryptCredentials } from "../../../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { IoSaveSharp } from "react-icons/io5";
import { toast } from "../../../hooks/use-toast";
import { DataSourceResponse } from "@/types/DataSource";
import { generateUid } from "../../../lib/uid";
import { useDataEngine } from "@dhis2/app-runtime";

export enum DataSourceType {
  "DHIS2" = "DHIS2",
  "Other" = "Other",
}

export interface DataSourceNewProps {
  refetch: () => void;
  dataSource: DataSourceResponse[];
  handleClose: () => void;
}
export default function AddDataSourceForm({
  refetch,
  dataSource,
  handleClose
}: DataSourceNewProps) {
  const engine = useDataEngine();
  // Zod schema
  const dataSourceSchema = z.object({
    instanceName: z.string().min(1, "Instance name is required"),
    url: z.string().url("Invalid URL").transform((val) => val.trim().toLowerCase()),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    instanceDescription: z
      .string()
      .min(10, {
        message: "Bio must be at least 10 characters.",
      })
      .max(512, {
        message: "Bio must not be longer than 30 characters.",
      }),
    dataSourceType: z.nativeEnum(DataSourceType, {
      required_error: "Please select data source type",
    }),
  });

  const form = useForm<z.infer<typeof dataSourceSchema>>({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: {
      //dataSourceType: DataSourceType.DHIS2,
    },
  });
  const REACT_APP_DataStore = process.env.REACT_APP_DataStore;
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form values type
  type DataSourceFormValues = z.infer<typeof dataSourceSchema>;
  const onSubmit = async (data: DataSourceFormValues) => {
    setIsSubmitting(true);
    const existingUrl = dataSource.some(
      (entry: any) => entry.value.authentication.url === data.url
    );

    if (existingUrl) {
      toast({
        variant: "destructive",
        title: "Oh! action failed",
        description: "The URL already exists. Please use a different URL.",
      });
      setIsSubmitting(false);
      return
    }

    try {
    const uid =  generateUid();
    const dataToUplaod = {
        isCurrentDHIS2: false,
        id: generateUid(),
        authentication: {
            url: data.url,
            username: encryptCredentials(data.username),
            password: encryptCredentials(data.password),
        },
        type:data.dataSourceType,
        instanceName: data.instanceName,
        description: data.instanceDescription,
    }; 

    await engine.mutate({
        resource: `dataStore/${REACT_APP_DataStore}/${uid}`,
        type: 'create',
        data: dataToUplaod
    });
    handleClose();
    toast({
        title: "success",
        description: `New Instance has been Added successfully`,
      });
      refetch();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Oh! action failed",
            description: "Saving failed"+error,
          });
          setIsSubmitting(false);
      } finally {
        setIsSubmitting(false);
      }
  };

  const dataSourceOptions = Object.entries(DataSourceType).map(
    ([key, value]) => ({
      label: value,
      value,
    })
  );


  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="dataSourceType"
            render={({ field }) => (
              <FormItem className="flex gap-14 items-center">
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting} 
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dataSourceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instanceName"
            disabled={isSubmitting} 
            render={({ field }) => (
              <FormItem className="flex gap-7 items-center">
                <FormLabel>Instance</FormLabel>
                <FormControl>
                  <Input placeholder="Enter instance name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            disabled={isSubmitting} 
            render={({ field }) => (
              <FormItem className="flex gap-14 items-center">
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            disabled={isSubmitting} 
            render={({ field }) => (
              <FormItem className="flex gap-5 items-center">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            disabled={isSubmitting} 
            render={({ field }) => (
              <FormItem className="flex gap-5 items-center">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instanceDescription"
            disabled={isSubmitting} 
            render={({ field }) => (
              <FormItem className="flex gap-3 items-center">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about your instance"
                    className=" resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col items-center mt-4">
            <Button
              type="submit"
              className="w-[200px] bg-pdark text-ptext hover:bg-primary"
              disabled={isSubmitting}
            >
              <IoSaveSharp /> {isSubmitting ? "Saving..." : "Save"} 
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
