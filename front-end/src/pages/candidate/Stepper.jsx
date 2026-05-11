// pages/candidate/components/Stepper.jsx
import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

export const Stepper = ({ currentStep }) => {
  const steps = [
    { step: 1, label: 'Select Election' },
    { step: 2, label: 'Select Position' },
    { step: 3, label: 'Campaign Info' },
    { step: 4, label: 'Declarations' },
    { step: 5, label: 'Review & Submit' }
  ];

  return (
    <div style={styles.stepper}>
      {steps.map((s, index) => (
        <div key={s.step} style={styles.step}>
          <div style={{
            ...styles.stepNumber,
            ...(currentStep === s.step ? styles.stepNumberActive : {}),
            ...(currentStep > s.step ? styles.stepNumberCompleted : {})
          }}  className='stepper-step-number'>
            {currentStep > s.step ? <FiCheckCircle size={16} /> : s.step}
          </div>
          <p style={{
            ...styles.stepLabel,
            ...(currentStep === s.step ? styles.stepLabelActive : {})
          }} className='stepper-step-label'>
            {s.label}
          </p>
          {/* Connector line between steps - except after last step */}
          {index < steps.length - 1 && (
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
    marginBottom: '40px',
    position: 'relative',
    flexWrap: 'nowrap',  // ✅ NEVER WRAP
    gap: '8px'  // Default gap between steps
  },
  step: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    flex: 1,
    position: 'relative',
    minWidth: 0  // Allows flex items to shrink
  },
  stepNumber: { 
    width: '36px', 
    height: '36px', 
    borderRadius: '50%', 
    background: '#e2e8f0', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: '10px', 
    fontSize: '14px', 
    fontWeight: '700',
    color: '#64748b',
    transition: 'all 0.3s ease',
    zIndex: 2,
    flexShrink: 0  // ✅ Prevents circle from shrinking
  },
  stepNumberActive: { 
    background: '#2563EB', 
    color: 'white',
    boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.2)'
  },
  stepNumberCompleted: { 
    background: '#10b981', 
    color: 'white' 
  },
  stepLabel: { 
    fontSize: '12px', 
    color: '#94a3b8',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    whiteSpace: 'nowrap', 
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%'
  },
  stepLabelActive: { 
    color: '#2563EB', 
    fontWeight: '600' 
  },
  connector: {
    position: 'absolute',
    top: '18px',
    left: 'calc(50% + 18px)',
    right: 'calc(-50% + 18px)',
    height: '2px',
    background: '#e2e8f0',
    zIndex: 1
  },
  connectorCompleted: {
    background: '#10b981'
  }
};

// ✅ ONLY RESPONSIVE STYLES - reduces gap and font sizes, NEVER wraps
const responsiveStyles = document.createElement('style');
responsiveStyles.textContent = `
  /* Tablet - reduce gap and sizes */
  @media (max-width: 768px) {
    .stepper-step-label {
      font-size: 10px !important;
      white-space: nowrap !important;
    }
    .stepper-step-number {
      width: 30px !important;
      height: 30px !important;
      font-size: 12px !important;
      margin-bottom: 6px !important;
    }
    .stepper-step-number svg {
      width: 14px !important;
      height: 14px !important;
    }
  }
  
  /* Mobile - further reduce gap and sizes, but NEVER wrap */
  @media (max-width: 640px) {
    .stepper-step-label {
      font-size: 9px !important;
      white-space: nowrap !important;
    }
    .stepper-step-number {
      width: 26px !important;
      height: 26px !important;
      font-size: 11px !important;
      margin-bottom: 5px !important;
    }
    .stepper-step-number svg {
      width: 12px !important;
      height: 12px !important;
    }
  }
  
  /* Small mobile - minimal sizes, still NO WRAP */
  @media (max-width: 480px) {
    .stepper-step-label {
      font-size: 8px !important;
      white-space: nowrap !important;
    }
    .stepper-step-number {
      width: 22px !important;
      height: 22px !important;
      font-size: 10px !important;
      margin-bottom: 4px !important;
    }
    .stepper-step-number svg {
      width: 10px !important;
      height: 10px !important;
    }
  }
`;
if (!document.head.querySelector('#stepper-styles')) {
  responsiveStyles.id = 'stepper-styles';
  document.head.appendChild(responsiveStyles);
}

export default Stepper;