import React from 'react';
import Selector from './Selector';
import OrgSelector from './OrgSelector';
import PerSelector from './PerSelector';

export default function VisualizersPage() {
    return (
        <div className='p-24 flex gap-2 flex-col w-[40%] bg-slate-500 h-[150%]'>
            <Selector />
            <OrgSelector />
            <PerSelector />
        </div>
    );
}
