// pages/candidate/components/NominationStepper.jsx
import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

export const NominationStepper = ({ currentStep }) => {
  const steps = [
    { step: 1, label: 'Select Election' },
    { step: 2, label: 'Select Position' },
    { step: 3, label: 'Campaign Info' },
    { step: 4, label: 'Declarations' },
    { step: 5, label: 'Review & Submit' }
  ];

  return (
    <div style={styles.stepper}>
      {steps.map((s) => (
        <div key={s.step} style={styles.step}>
          <div style={{
            ...styles.stepNumber,
            ...(currentStep === s.step ? styles.stepNumberActive : {}),
            ...(currentStep > s.step ? styles.stepNumberCompleted : {})
          }}>
            {currentStep > s.step ? <FiCheckCircle size={16} /> : s.step}
          </div>
          <span style={{
            ...styles.stepLabel,
            ...(currentStep === s.step ? styles.stepLabelActive : {})
          }}>
            {s.label}
          </span>
          {s.step < steps.length && (
            <div style={{
              ...styles.connector,
              ...(currentStep > s.step ? styles.connectorCompleted : {})
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  stepper: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: 'clamp(32px, 6vw, 48px)',
    position: 'relative',
    flexWrap: 'wrap',
    gap: '16px'
  },
  step: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    flex: 1,
    position: 'relative',
    minWidth: '80px'
  },
  stepNumber: { 
    width: '40px', 
    height: '40px', 
    borderRadius: '50%', 
    background: '#e5e7eb', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: '10px', 
    fontSize: '15px', 
    fontWeight: '800',
    color: '#6b7280',
    transition: 'all 0.3s ease',
    zIndex: 2,
    fontFamily: "'Poppins', sans-serif"
  },
  stepNumberActive: { 
    background: '#D23A01', 
    color: 'white',
    boxShadow: '0 0 0 4px rgba(210, 58, 1, 0.2)'
  },
  stepNumberCompleted: { 
    background: '#023430', 
    color: 'white' 
  },
  stepLabel: { 
    fontSize: 'clamp(10px, 2.5vw, 13px)', 
    color: '#9ca3af',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif"
  },
  stepLabelActive: { 
    color: '#D23A01', 
    fontWeight: '700' 
  },
  connector: {
    position: 'absolute',
    top: '20px',
    left: 'calc(50% + 20px)',
    width: 'calc(100% - 40px)',
    height: '2px',
    background: '#e5e7eb',
    zIndex: 1
  },
  connectorCompleted: {
    background: '#023430'
  }
};

// Responsive styles
const responsiveStyles = document.createElement('style');
responsiveStyles.textContent = `
  @media (max-width: 640px) {
    .step-label {
      font-size: 10px !important;
    }
    .step-number {
      width: 32px !important;
      height: 32px !important;
      font-size: 13px !important;
    }
    .connector {
      top: 16px !important;
      left: calc(50% + 16px) !important;
      width: calc(100% - 32px) !important;
    }
  }
`;
if (!document.head.querySelector('#stepper-styles')) {
  responsiveStyles.id = 'stepper-styles';
  document.head.appendChild(responsiveStyles);
}