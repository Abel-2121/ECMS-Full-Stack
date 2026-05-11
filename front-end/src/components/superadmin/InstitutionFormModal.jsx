// components/superadmin/InstitutionFormModal.jsx
import React, { useState, useEffect } from 'react';

const InstitutionFormModal = ({ institution, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    about: ''
  });

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name || '',
        code: institution.code || '',
        email: institution.email || '',
        phone: institution.phone || '',
        address: institution.address || '',
        about: institution.about || ''
      });
    }
  }, [institution]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>{institution ? 'Edit Institution' : 'Create New Institution'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Institution Name *</label>
              <input name="name" required value={formData.name} onChange={handleChange} style={styles.input} placeholder="e.g., Addis Ababa University" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Institution Code *</label>
              <input name="code" required value={formData.code} onChange={handleChange} style={styles.input} placeholder="e.g., AAU" />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Email *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} style={styles.input} placeholder="admin@institution.edu" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Phone *</label>
              <input name="phone" required value={formData.phone} onChange={handleChange} style={styles.input} placeholder="+251-XXX-XXX-XXX" />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Address *</label>
            <input name="address" required value={formData.address} onChange={handleChange} style={styles.input} placeholder="Full address" />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>About (Optional)</label>
            <textarea name="about" value={formData.about} onChange={handleChange} rows={3} style={styles.textarea} placeholder="Brief description of the institution..." />
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
            <button type="submit" style={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : institution ? 'Update Institution' : 'Create Institution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { width: '90%', maxWidth: '650px', background: 'white', borderRadius: '16px', padding: '32px', maxHeight: '90vh', overflow: 'auto' },
  title: { fontSize: '24px', fontWeight: '700', marginBottom: '24px', textAlign: 'center', color: '#1e293b' },
  row: { display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' },
  field: { flex: 1, minWidth: '200px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'vertical' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' },
  cancelBtn: { padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  saveBtn: { padding: '10px 20px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default InstitutionFormModal;