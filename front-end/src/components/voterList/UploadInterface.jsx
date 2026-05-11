import React, { useRef, useState } from 'react';
import { FiUploadCloud, FiFileText, FiDownload } from 'react-icons/fi';
import { getCSVTemplate } from '../../utils/csvParser';

const UploadInterface = ({ onFileSelected }) => {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelected(file);
    }
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = getCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'voter_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '700px', width: '100%' }}>
      <div 
        className="glass card-hover"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--color-primary)' : 'rgba(15, 89, 193, 0.2)'}`,
          borderRadius: 'var(--radius-4)', 
          padding: '5rem 2rem', 
          textAlign: 'center',
          cursor: 'pointer', 
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          background: dragging 
            ? 'linear-gradient(135deg, rgba(15, 89, 193, 0.1) 0%, rgba(11, 175, 207, 0.1) 100%)' 
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)',
          boxShadow: dragging ? '0 20px 40px rgba(15, 89, 193, 0.15)' : 'var(--shadow-premium)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem', opacity: dragging ? 1 : 0.8, transition: 'transform 0.3s ease' }}>
          {dragging ? '📤' : '📄'}
        </div>
        
        <h3 style={{ marginBottom: '0.75rem', color: 'var(--color-gray-900)', fontSize: '1.5rem', letterSpacing: '-0.02em', textTransform: 'none' }}>
          Drag & Drop CSV File
        </h3>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '1rem', fontWeight: 500 }}>
          or click to browse from your computer
        </p>
        
        <div style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(15, 89, 193, 0.05)', borderRadius: '2rem', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
          Supports .csv format • Max size: 10MB
        </div>

        <input 
          ref={fileRef} 
          type="file" 
          accept=".csv" 
          style={{ display: 'none' }}
          onChange={handleFile} 
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.5rem 0' }}>
        <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, transparent, var(--color-gray-200))' }} />
        <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>OR START FROM SCRATCH</p>
        <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, var(--color-gray-200), transparent)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="btn outline" onClick={downloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '3rem', padding: '1rem 2.5rem', border: '1.5px solid var(--color-gray-200)', background: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
          <p style={{ fontSize: '1.2rem' }}>⬇️</p> Download CSV Template
        </button>
      </div>
    </div>
  );
};

export default UploadInterface;
