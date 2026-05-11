import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDocument } from '../../Js/candidate-slice';

const SupportingDocumentsForm = () => {
  const dispatch = useDispatch();
  const { draftApplication } = useSelector(state => state.candidate);

  const handleFileUpload = (name, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB limit.`);
        return;
      }
      dispatch(updateDocument({ name, value: file.name }));
    }
  };

  const DocInput = ({ id, label, required }) => (
    <div style={{ padding: '1.25rem', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-2)', background: draftApplication.documents[id] ? '#f0fdf4' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {label} {required && <p style={{ color: '#ef4444' }}>*</p>}
          {draftApplication.documents[id] && <p style={{ color: '#10b981' }}>✅</p>}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)' }}>PDF Format (Max 5MB)</div>
        {draftApplication.documents[id] && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>File: {draftApplication.documents[id]}</div>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <button className="btn sm outline" style={{ pointerEvents: 'none' }}>Upload File</button>
        <input 
          type="file" 
          accept=".pdf"
          onChange={(e) => handleFileUpload(id, e)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
        />
      </div>
    </div>
  );

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-3)' }}>
      <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-gray-200)', paddingBottom: '0.5rem' }}>Section 4: Supporting Documents</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        <DocInput id="nominationForm" label="Official Nomination Form" required />
        <DocInput id="transcript" label="Academic Transcript" required />
        <DocInput id="noc" label="No Objection Certificate (NOC)" required />
        <DocInput id="supportSignatures" label="Letter of Support/Signatures" required />
        <DocInput id="cv" label="CV / Resume" />
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#991b1b', background: '#fef2f2', padding: '0.75rem', borderRadius: 'var(--radius-1)' }}>
        ⚠️ Multi-file total application size must not exceed 20MB. Ensure clarity of scans before uploading.
      </div>
    </div>
  );
};

export default SupportingDocumentsForm;
