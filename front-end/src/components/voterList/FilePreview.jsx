import React from 'react';
import { FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';

const FilePreview = ({ validCount, invalidCount, onConfirm, onCancel, isLoading }) => {
  const total = validCount + invalidCount;
  const hasErrors = invalidCount > 0;

  return (
    <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-4)', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-primary)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>
          <FiInfo />
        </div>
        <h3 style={{ textTransform: 'none', fontSize: '1.4rem', fontWeight: 700 }}>File Analysis Summary</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius-3)', textAlign: 'center', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-gray-900)' }}>{total}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.5rem', letterSpacing: '0.05em' }}>Total Records</div>
        </div>
        
        <div style={{ padding: '1.5rem', background: 'rgba(34, 197, 94, 0.05)', border: '1.5px solid rgba(34, 197, 94, 0.1)', borderRadius: 'var(--radius-3)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-success)' }}>{validCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.5rem', letterSpacing: '0.05em', opacity: 0.8 }}>Ready to Import</div>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1.5px solid rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-3)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-danger)' }}>{invalidCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.5rem', letterSpacing: '0.05em', opacity: 0.8 }}>Validation Errors</div>
        </div>
      </div>

      {hasErrors && (
        <div style={{ display: 'flex', gap: '1rem', padding: '1.2rem', background: '#fffbeb', color: '#92400e', borderRadius: 'var(--radius-2)', marginBottom: '2rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <FiXCircle style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '0.2rem' }} />
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
            <strong>Attention Required:</strong> Your file contains {invalidCount} invalid record(s). Only the {validCount} valid records will be imported. Please review the errors in the table below before proceeding.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
        <button className="btn outline" onClick={onCancel} disabled={isLoading} style={{ borderRadius: '2rem', padding: '0.8rem 2rem' }}>
          Discard & Re-upload
        </button>
        <button 
          className="btn primary" 
          onClick={onConfirm} 
          disabled={validCount === 0 || isLoading}
          style={{ borderRadius: '2rem', padding: '0.8rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 20px rgba(15, 89, 193, 0.2)' }}
        >
          {isLoading ? 'Processing...' : (
            <>
              <FiCheckCircle />
              Import {validCount} Valid Voters
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FilePreview;
