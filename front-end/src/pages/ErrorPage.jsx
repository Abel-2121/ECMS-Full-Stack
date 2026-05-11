
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import image from '../assets/404.gif'

const ErrorPage = () => {

  const navigate = useNavigate()
  useEffect(() => {
     setTimeout(() => {
      navigate(-1)
    }, 200000)

  })

  return (

    <section className='errorPage'>

      <div className='errorPage-container'>
       <img src={image} alt="page not found" />
        <h1>404</h1> 
        <p>We couldn't find the page you're looking for.</p>
      </div>
    </section>
  )
}

export default ErrorPage