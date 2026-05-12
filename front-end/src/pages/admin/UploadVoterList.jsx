import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiCheckCircle, FiAlertCircle, FiFileText, 
  FiTarget, FiArrowRight, FiDownload, FiUpload,
  FiArrowLeft, FiLoader
} from 'react-icons/fi';
import { fetchAllElections } from '../../Js/election-slice';
import { uploadVoterList, setPreviewData, clearPreviewData, resetUploadStatus } from '../../Js/voterList-slice';
import { securityValidators } from '../../utils/validators';

const UploadVoterList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { elections } = useSelector(state => state.election);
  const { uploadStatus, summary, loading, error, validRecordsPreview, invalidRecordsPreview } = useSelector(state => state.voterList);
  
  const preselectedElectionId = location.state?.preselectedElectionId;
  const preselectedElectionTitle = location.state?.electionTitle;
  
  const [selectedElection, setSelectedElection] = useState(preselectedElectionId || '');
  const [localError, setLocalError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    dispatch(fetchAllElections());
    return () => {
      dispatch(clearPreviewData());
      dispatch(resetUploadStatus());
    };
  }, [dispatch]);

  const validateFile = (file) => {
    const fileError = securityValidators.isValidVoterListFile(file);
    if (fileError) return fileError;
  
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      return 'Please upload CSV or Excel file (.csv, .xlsx, .xls)';
    }
    
    return null;
  };

  const validateElection = (electionId) => {
    const error = securityValidators.isValidObjectId(electionId);
    if (!error && !electionId) {
      return 'Please select an election';
    }
    return null;
  };

  const handleFileSelect = (file) => {
    setLocalError('');
    
    const electionError = validateElection(selectedElection);
    if (electionError) {
      setLocalError(electionError);
      return;
    }

    const fileError = validateFile(file);
    if (fileError) {
      setLocalError(fileError);
      return;
    }

    setSelectedFile(file);
    setIsPreviewMode(true);
    
    dispatch(setPreviewData({ 
      valid: [{ fileName: file.name, fileSize: (file.size / 1024).toFixed(2) + ' KB' }], 
      invalid: [] 
    }));
  };

  const handleConfirmUpload = async () => {
    if (!selectedElection || !selectedFile) return;
    await dispatch(uploadVoterList({ electionId: selectedElection, file: selectedFile })).unwrap();
  };

  const handleCancelPreview = () => {
    dispatch(clearPreviewData());
    setSelectedFile(null);
    setIsPreviewMode(false);
    setLocalError('');
  };

  const handleReset = () => {
    dispatch(clearPreviewData());
    dispatch(resetUploadStatus());
    setSelectedElection(preselectedElectionId || '');
    setSelectedFile(null);
    setIsPreviewMode(false);
    setLocalError('');
  };

  const downloadTemplate = () => {
    const headers = ['firstName', 'lastName', 'email', 'phone'];
    const sampleRow = ['John', 'Doe', 'john@example.com', '+251911234567'];
    const template = [headers.join(','), sampleRow.join(',')].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'voter_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  if (uploadStatus === 'success') {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <FiCheckCircle size={64} />
          </div>
          <h2 style={styles.successTitle}>Voter List Uploaded Successfully!</h2>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <span>Total Records</span>
              <strong>{summary?.total}</strong>
            </div>
            <div style={styles.summaryItem}>
              <span>Valid</span>
              <strong style={{ color: '#10b981' }}>{summary?.valid}</strong>
            </div>
            <div style={styles.summaryItem}>
              <span>Invalid</span>
              <strong style={{ color: '#dc2626' }}>{summary?.invalid}</strong>
            </div>
            <div style={styles.summaryItem}>
              <span>Users Updated</span>
              <strong>{summary?.usersUpdated || 0}</strong>
            </div>
          </div>
          <div style={styles.successActions}>
            <button style={styles.secondaryBtn} onClick={()=>navigate('/electionAdmin/dashboard')}>
             Dashboard
            </button>
            <button style={styles.primaryBtn} onClick={() => navigate('/electionAdmin/elections')}>
              Election <FiArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedElectionObj = elections.find(e => e._id === selectedElection);

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} /> Back
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>Voter Eligibility List</h1>
        <p style={styles.subtitle}>Upload CSV/Excel file containing eligible voters for the election</p>
      </div>

      {(localError || error) && (
        <div style={styles.errorBanner}>
          <FiAlertCircle size={18} />
          <span>{localError || error}</span>
        </div>
      )}

      {!isPreviewMode ? (
        <div style={styles.mainContent}>
          {/* Election Selection */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <FiTarget size={20} style={styles.sectionIcon} />
              <h3 style={styles.sectionTitle}>1. Select Election</h3>
            </div>
            <select
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              style={styles.select}
              disabled={!!preselectedElectionId}
            >
              <option value="">Select an election...</option>
              {elections.map(e => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
            {preselectedElectionId && selectedElectionObj && (
              <div style={styles.preselectedInfo}>
                <FiCheckCircle size={14} />
                <span>Uploading voters for: <strong>{selectedElectionObj.title}</strong></span>
              </div>
            )}
          </div>

          {/* File Upload Area */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <FiFileText size={20} style={styles.sectionIcon} />
              <h3 style={styles.sectionTitle}>2. Upload Voter List</h3>
            </div>
            <div 
              style={{
                ...styles.uploadArea,
                ...(dragActive ? styles.uploadAreaDragActive : {})
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FiUpload size={48} style={styles.uploadIcon} />
              <p style={styles.uploadText}>Drag & drop your CSV/Excel file here</p>
              <p style={styles.uploadOr}>or</p>
              <label style={styles.uploadButton}>
                Browse Files
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
              <p style={styles.uploadHint}>Max size: 10MB | Supported: CSV, Excel</p>
            </div>
            <button style={styles.templateBtn} onClick={downloadTemplate}>
              <FiDownload size={16} /> Download Template
            </button>
          </div>

          {/* Formatting Guide */}
          <div style={styles.guideSection}>
            <h4 style={styles.guideTitle}>Formatting Guide</h4>
            <ul style={styles.guideList}>
              <li><strong>firstName:</strong> Voter's first name (required)</li>
              <li><strong>lastName:</strong> Voter's last name (required)</li>
              <li><strong>email:</strong> Valid email address (required, unique)</li>
              <li><strong>phone:</strong> Phone number (optional)</li>
            </ul>
            <p style={styles.guideNote}>The first row must contain column headers exactly as shown above.</p>
          </div>
        </div>
      ) : (
        <div style={styles.previewContainer}>
          <div style={styles.previewHeader}>
            <h3 style={styles.previewTitle}>File Ready for Upload</h3>
            <div style={styles.fileInfo}>
              <p><strong>File:</strong> {selectedFile?.name}</p>
              <p><strong>Size:</strong> {(selectedFile?.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>

          <div style={styles.previewActions}>
            <button style={styles.cancelBtn} onClick={handleCancelPreview}>
              Cancel & Re-upload
            </button>
            <button 
              style={styles.confirmBtn}
              onClick={handleConfirmUpload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FiLoader size={16} style={styles.spinner} />
                  Uploading...
                </>
              ) : (
                'Upload Voter List'
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 16px !important;
          }
          .section {
            padding: 16px !important;
          }
          .summary-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .success-actions {
            flex-direction: column !important;
          }
          .preview-actions {
            flex-direction: column !important;
          }
          .upload-area {
            padding: 24px !important;
          }
        }
        
        @media (max-width: 480px) {
          .summary-grid {
            grid-template-columns: 1fr !important;
          }
          .upload-button {
            width: 100% !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    padding: 'clamp(20px, 4vw, 32px)', 
    maxWidth: '1200px', 
    margin: '0 auto',
    minHeight: '100vh',
    background: '#f8fafc',
    marginTop:"5vh",
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#4b5563',
    
    transition: 'all 0.2s'
  },
  header: { 
    marginBottom: 'clamp(24px, 5vw, 32px)' 
  },
  title: {
    fontSize: 'clamp(26px, 5vw, 32px)',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '8px',
    
  },
  subtitle: {
    fontSize: 'clamp(14px, 3vw, 16px)',
    color: '#4b5563',
    
  },
  errorBanner: { 
    background: '#fee2e2', 
    color: '#dc2626', 
    padding: '12px 16px', 
    borderRadius: '12px', 
    marginBottom: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    fontSize: '13px',
    
  },
  mainContent: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 'clamp(24px, 5vw, 32px)' 
  },
  section: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 24px)', 
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  sectionHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    marginBottom: '20px' 
  },
  sectionIcon: {
    color: '#D23A01'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
    
  },
  select: { 
    width: '100%', 
    padding: '12px 16px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '12px', 
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s'
  },
  preselectedInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '10px 14px',
    background: '#dcfce7',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#166534',
    
  },
  uploadArea: { 
    border: '2px dashed #cbd5e1', 
    borderRadius: '16px', 
    padding: 'clamp(30px, 6vw, 40px)', 
    textAlign: 'center', 
    cursor: 'pointer', 
    transition: 'all 0.2s',
    backgroundColor: '#f8fafc'
  },
  uploadAreaDragActive: {
    borderColor: '#D23A01',
    backgroundColor: '#FEF3F0'
  },
  uploadIcon: {
    color: '#9ca3af'
  },
  uploadText: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '12px',
    
  },
  uploadOr: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '8px 0',
    
  },
  uploadButton: { 
    display: 'inline-block', 
    padding: '10px 24px', 
    background: '#D23A01', 
    color: 'white', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  uploadHint: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '12px',
    
  },
  templateBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginTop: '16px', 
    padding: '8px 16px', 
    background: '#f1f5f9', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#4b5563',
    
  },
  guideSection: { 
    background: '#f8fafc', 
    borderRadius: '16px', 
    padding: 'clamp(16px, 4vw, 20px)',
    border: '1px solid #e5e7eb'
  },
  guideTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '12px',
    
  },
  guideList: {
    paddingLeft: '20px',
    margin: '8px 0',
    color: '#4b5563',
    fontSize: '13px',
    
  },
  guideNote: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '10px',
    
  },
  previewContainer: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 24px)', 
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  previewHeader: { 
    marginBottom: '20px' 
  },
  previewTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '16px',
    
  },
  fileInfo: { 
    background: '#f8fafc', 
    padding: '16px', 
    borderRadius: '12px', 
    marginTop: '12px',
    border: '1px solid #e5e7eb'
  },
  previewActions: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '12px', 
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  cancelBtn: { 
    padding: '10px 20px', 
    background: '#f1f5f9', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4b5563',
    
  },
  confirmBtn: { 
    padding: '10px 24px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  successContainer: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '70vh',
    marginTop:"10vh", 
  },
  successCard: { 
    background: 'white', 
    borderRadius: '24px', 
    padding: 'clamp(32px, 6vw, 48px)', 
    textAlign: 'center', 
    maxWidth: '550px', 
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  successIcon: { 
    marginBottom: '20px' 
  },
  successTitle: {
    fontSize: 'clamp(24px, 5vw, 28px)',
    fontWeight: '800',
    color: '#10b981',
    marginBottom: '16px',
    
  },
  summaryGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(2, 1fr)', 
    gap: '16px', 
    margin: '24px 0', 
    padding: '20px', 
    background: '#f8fafc', 
    borderRadius: '16px',
    border: '1px solid #e5e7eb'
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'center'
  },
  successActions: { 
    display: 'flex', 
    gap: '12px', 
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryBtn: { 
    padding: '12px 24px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    
  },
  secondaryBtn: { 
    padding: '12px 24px', 
    background: '#f1f5f9', 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    
  },
  spinner: {
    animation: 'spin 1s linear infinite'
  }
};

export default UploadVoterList;