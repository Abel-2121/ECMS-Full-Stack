// components/elections/ElectionWizard.jsx
import React, { useState } from 'react';
import BasicInfoStep from './BasicInfoStep';
import TimelineStep from './TimelineStep';
import PositionsStep from './PositionsStep';
import RulesStep from './RulesStep';
import ReviewStep from './ReviewStep';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi';

const steps = [
  { n: 1, l: 'Basic' },
  { n: 2, l: 'Timeline' },
  { n: 3, l: 'Positions' },
  { n: 4, l: 'Rules' },
  { n: 5, l: 'Review' }
];

const ElectionWizard = ({ onComplete, loading, serverError }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    regStart: '',
    regEnd: '',
    nomStart: '',
    nomEnd: '',
    voteStart: '',
    voteEnd: '',
    resultDate: '',
    positions: [],
    eligibleLevels: '',
    eligibilityRules: '',
    maxVotes: 1,
    minTurnout: 0,
    autoVerifyVoters: false,
    onlineOnly: true,
  });
  const [stepErrors, setStepErrors] = useState({});

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStepErrors({});
  };

  const validateStep = () => {
    if (currentStep === 1 && !formData.title.trim()) {
      setStepErrors({ msg: 'Election title is required' });
      return false;
    }
    if (currentStep === 2 && (!formData.regStart || !formData.voteEnd)) {
      setStepErrors({ msg: 'Please complete all timeline fields' });
      return false;
    }
    if (currentStep === 3 && formData.positions.length === 0) {
      setStepErrors({ msg: 'Add at least one position' });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep() && currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div style={styles.wrapper}>
      <div style={styles.stepper}>
        <div style={styles.line} />
        {steps.map(s => (
          <div key={s.n} style={styles.stepItem}>
            <div
              style={{
                ...styles.circle,
                ...(currentStep === s.n && styles.active),
                ...(currentStep > s.n && styles.done)
              }}
            >
              {currentStep > s.n ? <FiCheck size={18} /> : s.n}
            </div>
            <p
              style={{
                ...styles.label,
                ...(currentStep === s.n && styles.labelActive),
                ...(currentStep > s.n && styles.labelDone)
              }}
            >
              {s.l}
            </p>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        {(serverError || stepErrors.msg) && (
          <div style={styles.error}>
            <FiAlertCircle size={18} />
            <p>{serverError || stepErrors.msg}</p>
          </div>
        )}

        <div style={styles.content}>
          {currentStep === 1 && <BasicInfoStep data={formData} onChange={updateFormData} />}
          {currentStep === 2 && <TimelineStep data={formData} onChange={updateFormData} />}
          {currentStep === 3 && <PositionsStep data={formData} onChange={updateFormData} />}
          {currentStep === 4 && <RulesStep data={formData} onChange={updateFormData} />}
          {currentStep === 5 && <ReviewStep data={formData} />}
        </div>

        <div style={styles.footer}>
          {currentStep > 1 ? (
            <button style={styles.secondary} onClick={prevStep}>
              <FiArrowLeft size={16} /> Back
            </button>
          ) : <div />}

          {currentStep < 5 ? (
            <button style={styles.primary} onClick={nextStep}>
              Continue <FiArrowRight size={16} />
            </button>
          ) : (
            <button style={styles.success} onClick={() => onComplete(formData)}>
              {loading ? (
                <>
                  <FiLoader className="spin" size={16} /> Launching...
                </>
              ) : (
                <>
                  Launch Election <FiCheckCircle size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: '1000px',
    margin: 'clamp(20px, 5vw, 40px) auto',
    padding: '0 20px'
  },
  stepper: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '40px'
  },
  line: {
    position: 'absolute',
    top: '24px',
    left: 0,
    right: 0,
    height: '3px',
    background: '#e2e8f0'
  },
  stepItem: {
    textAlign: 'center',
    zIndex: 1,
    flex: 1
  },
  circle: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    fontWeight: '700',
    fontSize: '18px'
  },
  active: {
    background: '#D23A01',
    color: '#fff'
  },
  done: {
    background: '#023430',
    color: '#fff'
  },
  label: {
    fontSize: '13px',
    marginTop: '8px',
    color: '#94a3b8',
    fontWeight: '500'
  },
  labelActive: { color: '#1a1a1a', fontWeight: '600' },
  labelDone: { color: '#023430', fontWeight: '600' },
  card: {
    background: '#fff',
    padding: 'clamp(24px, 5vw, 30px)',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
  },
  error: {
    background: '#fee2e2',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    color: '#b91c1c',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px'
  },
  content: {
    minHeight: '300px'
  },
  footer: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  primary: {
    background: '#D23A01',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  secondary: {
    background: '#f1f5f9',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#1a1a1a'
  },
  success: {
    background: '#023430',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};

export default ElectionWizard;