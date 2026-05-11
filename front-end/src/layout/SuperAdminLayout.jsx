
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar'

const SuperAdminLayout = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 'clamp(70px, 10vh, 80px)' }}>
        <Outlet />
      </div>
      
    </>
  );
};

export default SuperAdminLayout;