// pages/candidate/components/DeclarationsStep.jsx
import React from 'react';

export const DeclarationsStep = ({ declarations, onDeclarationChange, onBack, onSubmit, loading, isSubmitting }) => {
  return (
    <div style={styles.card}>
      <h3>Declarations</h3>
      <p>Please confirm the following statements to proceed:</p>
      
      <label style={styles.checkboxLabel}>
        <input 
          type="checkbox" 
          checked={declarations.codeOfConduct} 
          onChange={() => onDeclarationChange('codeOfConduct')} 
        />
        I agree to abide by the Election Code of Conduct
      </label>
      
      <label style={styles.checkboxLabel}>
        <input 
          type="checkbox" 
          checked={declarations.spendingLimit} 
          onChange={() => onDeclarationChange('spendingLimit')} 
        />
        I agree to campaign spending limits
      </label>
      
      <label style={styles.checkboxLabel}>
        <input 
          type="checkbox" 
          checked={declarations.truthfulness} 
          onChange={() => onDeclarationChange('truthfulness')} 
        />
        I confirm that all information provided is truthful and accurate
      </label>
      
      <div style={styles.actionButtons}>
        <button style={styles.secondaryBtn} onClick={onBack}>Back</button>
        <button 
          style={styles.submitBtn} 
          onClick={onSubmit} 
          disabled={loading || isSubmitting || !declarations.codeOfConduct || !declarations.spendingLimit || !declarations.truthfulness}
        >
          {loading || isSubmitting ? 'Submitting...' : 'Submit Nomination'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', marginBottom: '8px', background: '#f8fafc', borderRadius: '8px', cursor: 'pointer' },
  actionButtons: { display: 'flex', justifyContent: 'space-between', marginTop: '24px' },
  secondaryBtn: { padding: '12px 24px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  submitBtn: { padding: '12px 32px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }
};