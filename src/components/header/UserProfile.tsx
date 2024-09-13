import { useState, useEffect, useRef } from 'react';
import { IconSettings24, IconUser24, IconQuestion24, IconInfo24, IconLogOut24 } from '@dhis2/ui';
import { Link } from 'react-router-dom';

export default function UserProfile() {
    const [isProfileVisible, setIsProfileVisible] = useState(false);
    const profileRef = useRef(null);

    const toggleProfile = () => {
        setIsProfileVisible(!isProfileVisible);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !(profileRef.current as HTMLElement).contains(event.target as Node)) {
                setIsProfileVisible(false);
            }
        };

        if (isProfileVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileVisible]);

    return (
        <div className='relative'>
            <div
                className='p-[6px] cursor-pointer hover:bg-dhisDarkBlue'
                onClick={toggleProfile}
            >
                <div className='rounded-full bg-dhisGrey900 h-[36px] w-[36px] flex items-center justify-center'>DI</div>
            </div>

            {isProfileVisible && (
                <section ref={profileRef} className='bg-white text-[#212934] h-96 absolute top-12 right-0 w-80 shadow-md'>
                    <div className='p-4'>
                        <h3 className='font-bold mb-4'>User Profile</h3>
                        <ul>
                            <li><IconUser24 /> Profile</li>
                            <li><IconSettings24 /> Settings</li>
                            <li><IconQuestion24 /> Help</li>
                            <li><IconInfo24 /> About</li>
                            <li><IconLogOut24 /> Log Out</li>
                        </ul>
                    </div>
                </section>
            )}
        </div>
    );
}
