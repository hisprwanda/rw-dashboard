
import { Outlet } from 'react-router-dom';
import Header from '../header/header';
import Footer from '../Footer/Footer';

export default function MainLayout() {
  return (
    <div>
      <div>
        <Header />
        <Outlet />
        {/* <Footer/> */}
      </div>
    </div>
  );
}
