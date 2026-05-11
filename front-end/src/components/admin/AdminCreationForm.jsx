import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const AdminCreationForm = ({ admin, onSubmit, onCancel, loading, error }) => {
  const { institutions } = useSelector(state => state.institution);
  
  const [formData, setFormData] = useState({
    fullName: admin?.fullName || '',
    email: admin?.email || '',
    institutionId: admin?.institutionId || '',
    role: admin?.role || 'Election Administrator',
    phone: admin?.phone || '',
    department: admin?.department || ''
  });

  const [searchTerm, setSearchTerm] = useState(admin?.institutionName || '');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredInstitutions = institutions.filter(inst => 
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectInstitution = (inst) => {
    setFormData(prev => ({ ...prev, institutionId: inst.id }));
    setSearchTerm(inst.name);
    setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedInst = institutions.find(i => i.id === formData.institutionId);
    onSubmit({ ...formData, institutionName: selectedInst?.name || admin?.institutionName });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {error && (
        <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', borderLeft: '4px solid #ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Full Name *</label>
          <input 
            type="text" name="fullName" required 
            value={formData.fullName} onChange={handleChange}
            placeholder="e.g. John Doe"
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-gray-200)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Email Address *</label>
          <input 
            type="email" name="email" required 
            value={formData.email} onChange={handleChange}
            placeholder="admin@institution.edu"
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-gray-200)' }}
          />
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Institution / Organization *</label>
        <input 
          type="text" 
          placeholder="Search and select institution..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-gray-200)' }}
        />
        {showDropdown && (
          <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, maxHeight: '200px', overflowY: 'auto', background: '#fff', border: '1px solid var(--color-gray-100)', marginTop: '0.2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            {filteredInstitutions.length > 0 ? (
              filteredInstitutions.map(inst => (
                <div 
                  key={inst.id} 
                  onClick={() => handleSelectInstitution(inst)}
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', hover: { background: '#f8fafc' } }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{inst.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>{inst.type}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '0.85rem' }}>
                No results found. <p style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => window.location.href='/institutions'}>Add New Institution</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Role</label>
          <input 
            type="text" value={formData.role} disabled
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-gray-100)', background: '#f8fafc', fontWeight: 600, color: 'var(--color-gray-500)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Department (Optional)</label>
          <input 
            type="text" name="department"
            value={formData.department} onChange={handleChange}
            placeholder="e.g. IT Department"
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-gray-200)' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Phone Number (Optional)</label>
        <input 
          type="tel" name="phone"
          value={formData.phone} onChange={handleChange}
          placeholder="+123 456 7890"
          style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-gray-200)' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button type="button" className="btn outline full" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn primary full" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Admin Account ➔'}
        </button>
      </div>

    </form>
  );
};

export default AdminCreationForm;
