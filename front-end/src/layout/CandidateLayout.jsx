import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar'
const CandidateLayout = () => {
  const { user } = useSelector((state) => state.auth);

  return (
      
    <>
    <Navbar />
    
        <Outlet />
     
    </>
     
  );
};

export default CandidateLayout;