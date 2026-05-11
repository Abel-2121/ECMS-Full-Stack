
import React from 'react';
import { FiUserPlus, FiCheckCircle, FiAward, FiShield, FiUsers, FiBarChart2 } from 'react-icons/fi';

const iconMap = {
  FiUserPlus: <FiUserPlus size={32} />,
  FiCheckCircle: <FiCheckCircle size={32} />,
  FiAward: <FiAward size={32} />,
  FiShield: <FiShield size={32} />,
  FiUsers: <FiUsers size={32} />,
  FiBarChart2: <FiBarChart2 size={32} />
};

const HowItWorks = ({ data }) => {
  //console.log('HOW IT WORKS ',data)
  const howItWorksData = data || {
    title: 'How It Works',
    steps: [
      { number: '01', title: 'Register', description: 'Create your account with your email address', icon: 'FiUserPlus' },
      { number: '02', title: 'Verify', description: 'Verify your email with OTP to activate account', icon: 'FiCheckCircle' },
      { number: '03', title: 'Participate', description: 'Vote, manage elections, or run as a candidate', icon: 'FiAward' }
    ]
  };

  const styles = {
    section: {
      padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 40px)',
      background: '#f8fafc'
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: 'clamp(28px, 5vw, 40px)',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: 'clamp(40px, 6vw, 60px)',
      fontFamily: "'Poppins', sans-serif",
      letterSpacing: '-0.02em'
    },
    stepsGrid: {
      display: 'flex',
      justifyContent: 'center',
      gap: 'clamp(30px, 5vw, 60px)',
      flexWrap: 'wrap',
      maxWidth: '1100px',
      margin: '0 auto'
    },
    stepCard: {
      textAlign: 'center',
      flex: '1',
      minWidth: '240px',
      position: 'relative'
    },
    stepIcon: {
      width: '80px',
      height: '80px',
      margin: '0 auto 20px',
      background: '#fff5f0',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#D23A01'
    },
    stepNumber: {
      fontSize: 'clamp(40px, 6vw, 60px)',
      fontWeight: '800',
      color: '#D23A01',
      opacity: '0.15',
      marginBottom: '16px',
      fontFamily: "'Poppins', sans-serif",
      position: 'absolute',
      top: '-20px',
      right: '20px'
    },
    stepTitle: {
      fontSize: 'clamp(20px, 3vw, 24px)',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '12px',
      fontFamily: "'Poppins', sans-serif"
    },
    stepDesc: {
      fontSize: 'clamp(13px, 2.5vw, 15px)',
      color: '#000000',
      lineHeight: '1.5',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '500'
    },
    connector: {
      position: 'absolute',
      top: '40px',
      right: '-30px',
      width: '60px',
      height: '2px',
      background: 'linear-gradient(90deg, #D23A01 0%, #023430 100%)',
      '@media (max-width: 768px)': {
        display: 'none'
      }
    }
  }

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{howItWorksData.title}</h2>
      <div style={styles.stepsGrid}>
        {howItWorksData.steps?.map((step, index) => (
          <div key={step.number} style={styles.stepCard}>
            <div style={styles.stepNumber}>{step.number}</div>
            <div style={styles.stepIcon}>{iconMap[step.icon] || <FiUserPlus size={32} />}</div>
            <h3 style={styles.stepTitle}>{step.title}</h3>
            <p style={styles.stepDesc}>{step.description}</p>
            {index < howItWorksData.steps.length - 1 && <div style={styles.connector}></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;