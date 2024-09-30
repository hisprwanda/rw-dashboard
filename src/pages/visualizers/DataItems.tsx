import React from 'react';
import { useDataItems } from './../../services/fetchDataItems';
import { ScrollArea } from "./../../components/ui/scroll-area";

type DataItem = {
    name: string;
    id: string;
    dimensionItemType: string;
};

export default function DataItems() {
    const { loading, error, data, refetch } = useDataItems();

    console.log(data?.dataItems?.dataItems);


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const dataItems = data?.dataItems?.dataItems || [];

    const handleItemClick = (item: DataItem) => {
        console.log('Selected item:', item);
    };

    return (
        <ScrollArea className="h-72 w-full rounded-md border">
            <div className="py-5 pr-4 pl-2">
                {dataItems.length > 0 ? (
                    dataItems.map((item: DataItem) => (
                        <div
                            key={item.id}
                            id={item.id}
                            className='w-full p-1 bg-[#2c669377] mb-1 px-3 cursor-pointer text-sm rounded-[5px] hover:bg-[#2c6693]'
                            onClick={() => handleItemClick(item)}
                        >
                            {item.name}
                        </div>
                    ))
                ) : (
                    <div>No data items available</div>
                )}
            </div>
        </ScrollArea>
    );
}