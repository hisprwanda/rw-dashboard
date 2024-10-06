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
import { MdAdd } from 'react-icons/md';
import { Button } from './../../components/ui/button';
import OrganisationUnitMultiSelect from './../../components/OrganisationUnitTree/OrganisationUnitSelector';


export default function Visualizers() {

    return (
        <>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className='rounded-[5px] border mt-4' variant="outline">
                        Select Period <MdAdd className="ml-2 size-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Select Period</DialogTitle>
                    </DialogHeader>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}