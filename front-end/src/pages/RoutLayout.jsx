import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'

const RoutLayout = () => {

  return (
    <>
    <Navbar />
      <Outlet />
    </>
  )
}

export default RoutLayout