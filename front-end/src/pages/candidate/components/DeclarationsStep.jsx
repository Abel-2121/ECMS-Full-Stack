// pages/candidate/components/DeclarationsStep.jsx
import React from 'react';
import { FiArrowLeft, FiCheckCircle, FiAlertCircle, FiShield, FiLock, FiFlag } from 'react-icons/fi';

export const DeclarationsStep = ({ 
  declarations, 
  onDeclarationChange, 
  onBack, 
  onContinue, 
  isLoading 
}) => {
  const allChecked = declarations.codeOfConduct && declarations.spendingLimit && declarations.truthfulness;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <FiShield size={32} color="#D23A01" />
        <h3 style={styles.title}>Declarations</h3>
        <p style={styles.description}>Please confirm the following statements to proceed with your nomination</p>
      </div>
      
      <div style={styles.declarationsList}>
        {/* Declaration 1 */}
        <div 
          style={{
            ...styles.declarationItem,
            background: declarations.codeOfConduct ? '#D23A0110' : '#f8fafc',
            borderColor: declarations.codeOfConduct ? '#D23A01' : '#e5e7eb'
          }}
          onClick={() => onDeclarationChange('codeOfConduct')}
        >
          <div style={styles.checkboxIcon}>
            {declarations.codeOfConduct ? (
              <FiCheckCircle size={24} color="#D23A01" />
            ) : (
              <div style={styles.uncheckedCircle} />
            )}
          </div>
          <div style={styles.declarationContent}>
            <h4 style={styles.declarationTitle}>Code of Conduct Agreement</h4>
            <p style={styles.declarationDescription}>
              I agree to abide by the Election Code of Conduct. I will campaign ethically, 
              respect other candidates, and follow all election rules and regulations.
            </p>
          </div>
        </div>

        {/* Declaration 2 */}
        <div 
          style={{
            ...styles.declarationItem,
            background: declarations.spendingLimit ? '#D23A0110' : '#f8fafc',
            borderColor: declarations.spendingLimit ? '#D23A01' : '#e5e7eb'
          }}
          onClick={() => onDeclarationChange('spendingLimit')}
        >
          <div style={styles.checkboxIcon}>
            {declarations.spendingLimit ? (
              <FiCheckCircle size={24} color="#D23A01" />
            ) : (
              <div style={styles.uncheckedCircle} />
            )}
          </div>
          <div style={styles.declarationContent}>
            <h4 style={styles.declarationTitle}>Spending Limit Compliance</h4>
            <p style={styles.declarationDescription}>
              I agree to campaign spending limits. I will not exceed the maximum campaign 
              spending limit set by the election committee.
            </p>
          </div>
        </div>

        {/* Declaration 3 */}
        <div 
          style={{
            ...styles.declarationItem,
            background: declarations.truthfulness ? '#D23A0110' : '#f8fafc',
            borderColor: declarations.truthfulness ? '#D23A01' : '#e5e7eb'
          }}
          onClick={() => onDeclarationChange('truthfulness')}
        >
          <div style={styles.checkboxIcon}>
            {declarations.truthfulness ? (
              <FiCheckCircle size={24} color="#D23A01" />
            ) : (
              <div style={styles.uncheckedCircle} />
            )}
          </div>
          <div style={styles.declarationContent}>
            <h4 style={styles.declarationTitle}>Truthfulness Declaration</h4>
            <p style={styles.declarationDescription}>
              I confirm that all information provided is truthful and accurate. All submitted 
              documents and personal information are genuine and correct.
            </p>
          </div>
        </div>
      </div>

      {/* Notice Box */}
      <div style={styles.noticeBox}>
        <FiAlertCircle size={18} color="#f59e0b" />
        <div style={styles.noticeContent}>
          <strong style={styles.noticeTitle}>Important Notice</strong>
          <p style={styles.noticeText}>
            Making false declarations may result in immediate disqualification and legal action.
            Please ensure you understand and agree to all terms before proceeding.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button style={styles.secondaryBtn} onClick={onBack}>
          <FiArrowLeft size={16} /> Back
        </button>
        <button 
          style={{
            ...styles.continueBtn,
            opacity: allChecked && !isLoading ? 1 : 0.5,
            cursor: allChecked && !isLoading ? 'pointer' : 'not-allowed'
          }} 
          onClick={onContinue}
          disabled={!allChecked || isLoading}
        >
          {isLoading ? 'Loading...' : 'Review & Continue'}
          <FiFlag size={16} />
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(24px, 5vw, 32px)', 
    marginBottom: '24px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  title: {
    fontSize: 'clamp(22px, 5vw, 26px)',
    fontWeight: '800',
    color: '#1a1a1a',
    marginTop: '12px',
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  description: {
    fontSize: '14px',
    color: '#6b7280',
    fontFamily: "'Poppins', sans-serif"
  },
  declarationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px'
  },
  declarationItem: {
    display: 'flex',
    gap: '16px',
    padding: 'clamp(16px, 3vw, 20px)',
    borderRadius: '16px',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  checkboxIcon: {
    flexShrink: 0
  },
  uncheckedCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid #cbd5e1',
    background: 'white'
  },
  declarationContent: {
    flex: 1
  },
  declarationTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '6px',
    fontFamily: "'Poppins', sans-serif"
  },
  declarationDescription: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.5',
    margin: 0,
    fontFamily: "'Poppins', sans-serif"
  },
  noticeBox: {
    display: 'flex',
    gap: '14px',
    padding: '16px 20px',
    background: '#fef3c7',
    borderRadius: '14px',
    marginBottom: '28px',
    border: '1px solid #fde68a'
  },
  noticeContent: {
    flex: 1
  },
  noticeTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#92400e',
    fontFamily: "'Poppins', sans-serif"
  },
  noticeText: {
    fontSize: '12px',
    color: '#92400e',
    marginTop: '4px',
    lineHeight: '1.5',
    fontFamily: "'Poppins', sans-serif"
  },
  actionButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'space-between'
  },
  secondaryBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  },
  continueBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#D23A01',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  }
};