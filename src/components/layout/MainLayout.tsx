
import ParentComponent from '../header/header';
import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <div>
        <ParentComponent />
        {children}
      </div>
    </div>
  );
}
