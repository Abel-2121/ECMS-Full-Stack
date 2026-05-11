import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HeroSection from './Home/HeroSection';
import HowItWorks from './Home/HowItWorks';
import AboutContact from './Home/AboutContact';
import { Element } from 'react-scroll';
import { fetchPublicSettings } from '../Js/system-settings-slice';

const Home = () => {
  const dispatch = useDispatch();
  const { publicSettings, loading } = useSelector((state) => state.systemSettings);

  useEffect(() => {
    dispatch(fetchPublicSettings());
  }, [dispatch]);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'white',
      paddingTop: 'clamp(30px, 2vh, 50px)',
      fontFamily: "'Poppins', sans-serif"
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTop: '3px solid #D23A01', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Element name="hero" id="hero">
        <HeroSection data={publicSettings?.hero} />
      </Element>
      <Element name="how-it-works" id="how-it-works">
        <HowItWorks data={publicSettings?.howItWorks} />
      </Element>
      <Element name="about" id="about">
        <AboutContact data={publicSettings?.about} footer={publicSettings?.footer} />
      </Element>
    </div>
  );
};

export default Home;