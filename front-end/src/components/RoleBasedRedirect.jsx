// components/RoleBasedRedirect.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleBasedRedirect = () => {
  const { user } = useSelector(state => state.auth);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch(user.role) {
    case 'superAdmin':
      return <Navigate to="/dashboard/superAdmin" replace />;
    case 'electionAdmin':
      return <Navigate to="/dashboard/electionadmin" replace />;
    case 'candidate':
      return <Navigate to="/dashboard/candidate" replace />;
    case 'voter':
    case 'user':
      return <Navigate to="/dashboard/voter/elections" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default RoleBasedRedirect;