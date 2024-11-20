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
import { decryptCredentials, encryptCredentials } from "../../../lib/utils";
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
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { RiCloseLargeFill, RiEdit2Fill } from "react-icons/ri";
import { DataSourceRowProps } from "./show-data";
import { useDataEngine } from "@dhis2/app-runtime";
import { DataSourceType } from "./add-form";

export default function EditData({ row, refetch,dataSource }: DataSourceRowProps) {
  const [open, setOpen] = useState(false);

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
      instanceName:row.value.instanceName,
      url:row.value.authentication.url,
      username:decryptCredentials(row.value.authentication.username),
      password:decryptCredentials(row.value.authentication.password),
      instanceDescription:row.value.description,
      dataSourceType: row.value.type,
    },
  });
  const { reset } = form;
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form values type
  type DataSourceFormValues = z.infer<typeof dataSourceSchema>;
  const onSubmit = async (data: DataSourceFormValues) => {
    setIsSubmitting(true);
    const existingUrl = dataSource.some(
      (entry: any) => entry.value.authentication.url === data.url
    );

    if (existingUrl && row.value.authentication.url !== data.url) {
      toast({
        variant: "destructive",
        title: "Oh! action failed",
        description: "The URL already exists. Please use a different URL.",
      });
      setIsSubmitting(false);
      return
    }

    try {
    const uid =  row.key;
    const dataToUplaod = {
        isCurrentDHIS2: false,
        id: row.key,
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
        resource: `dataStore/r-data-source/${uid}`,
        type: 'update',
        data: dataToUplaod
    });
    refetch();
    setOpen(false);
    toast({
        title: "success",
        description: `New Instance has been Added successfully`,
      });
      reset();
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
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className="w-[40px] bg-transparent p-1 focus:outline-none focus:shadow-outline text-primary hover:text-plight hover:bg-transparent">
          <RiEdit2Fill className="text-xl" />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
        <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[460px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <AlertDialog.Title className="text-mauve12 -mt-4 font-medium">
            <div className="flex items-start justify-between  py-2">
              <h3 className="text-sm font-semibold text-green-600"> &nbsp; </h3>
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="cursor-pointer text-gray-400 bg-transparent hover:bg-transparent hover:bg-gray-200"
                  data-modal-toggle="default-modal"
                >
                  <RiCloseLargeFill />
                </button>
              </AlertDialog.Cancel>
            </div>
          </AlertDialog.Title>

          <div className="bg-gradient-to-r from-white to-gray-50 shadow-lg rounded-xl p-6 max-w-lg mx-auto border border-gray-300 hover:shadow-2xl transition-shadow duration-300">
           
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
                    className="resize-y min-h-[400px]"
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
              <IoSaveSharp /> {isSubmitting ? "Updating..." : "Update"} 
            </Button>
          </div>
        </form>
      </Form>

          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
