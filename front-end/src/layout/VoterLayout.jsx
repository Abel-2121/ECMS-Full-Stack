import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar'

const VoterLayout = () => {
 

  return (

    <>
    <Navbar />

        <Outlet />
     
    </>
         
      
      
  );
};

export default VoterLayout;