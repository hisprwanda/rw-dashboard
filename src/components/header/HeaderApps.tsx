import { useState, useEffect, useRef } from 'react';
import { IconApps24 } from '@dhis2/ui';
import React from 'react';

export default function HeaderApps() {
    const [isAppsVisible, setIsAppsVisible] = useState(false);
    const appsRef = useRef(null);
    const iconRef = useRef(null); // Add a ref for the icon

    // Toggle the visibility of the apps section
    const toggleApps = () => {
        setIsAppsVisible(!isAppsVisible);
    };

    // Click outside logic
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                appsRef.current &&
                !(appsRef.current as HTMLElement).contains(event.target as Node) &&
                iconRef.current &&
                !(iconRef.current as HTMLElement).contains(event.target as Node) // Exclude the icon click
            ) {
                setIsAppsVisible(false);
            }
        };

        // Attach event listener when apps section is visible
        if (isAppsVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup event listener when apps section is hidden
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAppsVisible]);

    return (
        <div className='relative'>
            {/* Apps icon */}
            <div
                ref={iconRef} // Reference the icon
                className='p-[12px] cursor-pointer hover:bg-dhisDarkBlue'
                onClick={toggleApps} // Click handler to toggle visibility
            >
                <IconApps24 />
            </div>

            {/* Apps section, visible based on the state */}
            {isAppsVisible && (
                <section ref={appsRef} className='bg-white text-[#212934] h-96 absolute top-12 right-0 w-80 shadow-md'>
                    <div className='p-4'>
                        <h3 className='font-bold mb-4'>Available Apps</h3>
                        <p>Some apps here...</p>
                    </div>
                </section>
            )}
        </div>
    );
}
