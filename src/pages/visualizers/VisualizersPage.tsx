import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./../../components/ui/dialog";
import { ScrollArea } from "./../../components/ui/scroll-area";
import { MdAdd, MdClose } from 'react-icons/md';
import { Button } from './../../components/ui/button';
import { useDataItems } from './../../services/fetchDataItems';

type DataItem = {
    name: string;
    id: string;
    dimensionItemType: string;
};

export default function Visualizers() {
    const { loading, error, data, refetch } = useDataItems();
    const [selectedItems, setSelectedItems] = useState<DataItem[]>([]);

    console.log(data?.dataItems?.dataItems);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const dataItems = data?.dataItems?.dataItems || [];

    const handleItemClick = (item: DataItem) => {
        if (!selectedItems.some(selectedItem => selectedItem.id === item.id)) {
            setSelectedItems([...selectedItems, item]);
        } else {
            setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== item.id));
        }

        console.log(selectedItems);
    };

    const handleRemoveItem = (itemToRemove: DataItem) => {
        setSelectedItems(selectedItems.filter(item => item.id !== itemToRemove.id));
    };

    return (
        <div className='p-24 flex gap-2 flex-col w-[40%] bg-slate-500 h-[150%]'>
            {selectedItems.map((item) => (
                <Button
                    key={item.id}
                    className='rounded-[5px] border mr-2 mb-2 flex items-center justify-between bg-[#CBE6FF] text-black hover:bg-[#85C4FF] hover:border-[#CBE6FF]'
                >
                    {item.name} <MdClose onClick={() => handleRemoveItem(item)} className="ml-2 size-5" />
                </Button>
            ))}
            <Dialog>
                <DialogTrigger asChild>
                    <Button className='rounded-[5px] border mt-4' variant="outline">
                        Select Indicators <MdAdd className="ml-2 size-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Select Indicators</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-72 w-full rounded-md border">
                        <div className="py-5 pr-4 pl-2">
                            {dataItems.length > 0 ? (
                                dataItems.map((item: DataItem) => {
                                    const isSelected = selectedItems.some(selectedItem => selectedItem.id === item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            id={item.id}
                                            className={`w-full p-1 mb-1 px-3 cursor-pointer text-sm rounded-[5px] hover:bg-[#2c6693] ${isSelected ? 'bg-[#2c6693] text-white' : 'bg-[#2c669377] text-black'
                                                }`}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            {item.name}
                                        </div>
                                    );
                                })
                            ) : (
                                <div>No data items available</div>
                            )}
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}