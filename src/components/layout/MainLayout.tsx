import { Outlet } from 'react-router-dom';
import Header from '../header/header';

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-10">
        <Header />
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}