// CreateElectionPage.jsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiCheckCircle, FiList, FiPlus, FiUpload, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import ElectionWizard from '../../components/elections/ElectionWizard';
import { createElection, clearError, clearSuccess } from '../../Js/election-slice';
import { securityValidators } from '../../utils/validators';

const CreateElectionPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: serverError } = useSelector((state) => state.election);
  const [createdElection, setCreatedElection] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const transformToBackendFormat = (formData) => {
    return {
      title: formData.title,
      description: formData.description || '',
      registrationStart: formData.regStart,
      registrationEnd: formData.regEnd,
      nominationStart: formData.nomStart,
      nominationEnd: formData.nomEnd,
      votingStart: formData.voteStart,
      votingEnd: formData.voteEnd,
      resultPublicationDate: formData.resultDate,
      positions: formData.positions.map(pos => {
        let electionType = 'single_winner';
        let totalSeats = parseInt(pos.seats) || 1;
        let seatAllocation = [];

        if (pos.voteType === 'MULTIPLE') {
          electionType = 'multiple_winners';
        } 
        else if (pos.voteType === 'RANKED') {
          electionType = 'ranked';
          if (pos.roleAllocations && Array.isArray(pos.roleAllocations) && pos.roleAllocations.length > 0) {
            seatAllocation = pos.roleAllocations.map((alloc) => ({
              rank: alloc.rank,
              roleName: alloc.roleName || `Position ${alloc.rank}`,
              description: alloc.description || ''
            }));
          } else {
            seatAllocation = Array(totalSeats).fill().map((_, i) => ({
              rank: i + 1,
              roleName: `Winner ${i + 1}`,
              description: ''
            }));
          }
        }

        return {
          positionId: `POS-${Date.now()}-${pos.id}`,
          positionName: pos.title,
          positionDescription: pos.requirements || '',
          electionType,
          totalSeats,
          seatAllocation,
          maxCandidates: pos.voteType === 'MULTIPLE' ? (parseInt(pos.maxSelections) || 5) : 10,
          requiredDocuments: ['photo', 'manifesto'],
          eligibilityRules: {
            minGPA: null,
            allowedDepartments: [],
            allowedYears: []
          }
        };
      })
    };
  };

  const validateFormData = (formData) => {
    const errors = {};
    
    // Validate title
    const titleError = securityValidators.isValidElectionTitle(formData.title);
    if (titleError) errors.title = titleError;
    
    // Validate description (optional but validate if provided)
    if (formData.description && formData.description.trim()) {
      const descError = securityValidators.isValidElectionDescription(formData.description);
      if (descError) errors.description = descError;
    }
    
    // Validate timeline
    const timelineErrors = securityValidators.isValidElectionTimeline({
      registrationStart: formData.regStart,
      registrationEnd: formData.regEnd,
      nominationStart: formData.nomStart,
      nominationEnd: formData.nomEnd,
      votingStart: formData.voteStart,
      votingEnd: formData.voteEnd,
      resultPublicationDate: formData.resultDate
    });
    
    if (Object.keys(timelineErrors).length > 0) {
      errors.timeline = timelineErrors;
    }
    
    // Validate positions
    if (!formData.positions || formData.positions.length === 0) {
      errors.positions = 'At least one position is required';
    } else {
      // Validate each position
      formData.positions.forEach((pos, idx) => {
        const positionNameError = securityValidators.isValidPositionName(pos.title);
        if (positionNameError) {
          errors[`position_${idx}`] = `Position ${idx + 1}: ${positionNameError}`;
        }
      });
    }
    
    return errors;
  };

  const handleCreateElection = useCallback(async (formData) => {
    const errors = validateFormData(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setValidationErrors({});
    
    try {
      const backendData = transformToBackendFormat(formData);
      const result = await dispatch(createElection(backendData)).unwrap();
      setCreatedElection(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      dispatch(clearError());
    } catch (err) {
      console.error('Creation failed:', err);
    }
  }, [dispatch]);

  const handleUploadVoterList = () => {
    navigate('/electionAdmin/upload-voters', { 
      state: { 
        preselectedElectionId: createdElection._id,
        electionTitle: createdElection.title 
      } 
    });
  };

  if (createdElection) {
    return (
      <section style={styles.successSection}>
        <div style={styles.successContainer}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>
              <FiCheckCircle size={48} />
            </div>
            <h2 style={styles.successTitle}>Election Successfully Created!</h2>
            <p style={styles.successMessage}>
              The election "<strong>{createdElection.title}</strong>" has been created successfully.
            </p>
            <div style={styles.idCard}>
              <div style={styles.idLabel}>Election ID</div>
              <div style={styles.idValue}>{createdElection.electionId || createdElection._id}</div>
            </div>
            
            <div style={styles.uploadSection}>
              <div style={styles.uploadHeader}>
                <FiUpload size={20} color="#D23A01" />
                <p>Next Step: Upload Voter List</p>
              </div>
              <p style={styles.uploadMessage}>
                A voter list is required for this election. Please upload the eligible voters.
              </p>
              <button 
                style={styles.uploadNowBtn} 
                onClick={handleUploadVoterList}
              >
                <FiUpload size={18} /> Upload Voter List Now
                <FiArrowRight size={16} />
              </button>
            </div>
            
            <div style={styles.successActions}>
              <button style={styles.secondaryBtn} onClick={() => setCreatedElection(null)}>
                <FiPlus size={18} /> Create Another Election
              </button>
              <button style={styles.outlineBtn} onClick={() => navigate('/elections')}>
                <FiList size={18} /> Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.pageContainer}>
      {Object.keys(validationErrors).length > 0 && (
        <div style={styles.globalErrorContainer}>
          <div style={styles.globalErrorHeader}>
            <FiAlertCircle size={20} color="#dc2626" />
            <strong>Please fix the following issues:</strong>
          </div>
          <ul style={styles.globalErrorList}>
            {Object.entries(validationErrors).map(([key, error]) => (
              typeof error === 'string' ? (
                <li key={key}>{error}</li>
              ) : key === 'timeline' && (
                Object.values(error).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))
              )
            ))}
          </ul>
        </div>
      )}
      <ElectionWizard 
        onComplete={handleCreateElection} 
        loading={loading}
        serverError={serverError}
      />
    </section>
  );
};

const styles = {
  pageContainer: { 
    background: '#f8fafc', 
    minHeight: '100vh', 
    paddingBottom: '7rem',
    marginTop: 'clamp(80px, 10vh, 100px)'
  },
  globalErrorContainer: {
    maxWidth: '900px',
    margin: '0 auto 20px',
    padding: '16px 20px',
    background: '#fef2f2',
    borderRadius: '12px',
    border: '1px solid #fecaca'
  },
  globalErrorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    color: '#dc2626'
  },
  globalErrorList: {
    margin: '8px 0 0 20px',
    fontSize: '13px',
    color: '#dc2626'
  },
  successSection: { 
    padding: 'clamp(40px, 6vw, 60px) 0', 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center' 
  },
  successContainer: { 
    maxWidth: '750px', 
    margin: '0 auto', 
    padding: '0 20px' 
  },
  successCard: { 
    padding: 'clamp(32px, 5vw, 48px)', 
    borderRadius: '24px', 
    textAlign: 'center', 
    background: '#fff', 
    boxShadow: '0 40px 100px rgba(0,0,0,0.1)' 
  },
  successIcon: { 
    background: '#10b981', 
    width: '80px', 
    height: '80px', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: '0 auto 1.5rem', 
    color: '#fff' 
  },
  successTitle: { 
    fontSize: 'clamp(24px, 5vw, 28px)', 
    fontWeight: '700', 
    marginBottom: '12px', 
    color: '#1a1a1a' 
  },
  successMessage: { 
    color: '#4a5568', 
    marginBottom: '32px', 
    fontSize: '16px' 
  },
  idCard: { 
    background: '#f8fafc', 
    padding: '20px', 
    borderRadius: '16px', 
    marginBottom: '32px' 
  },
  idLabel: { 
    fontSize: '12px', 
    fontWeight: '700', 
    color: '#94a3b8', 
    textTransform: 'uppercase', 
    marginBottom: '8px' 
  },
  idValue: { 
    fontSize: '20px', 
    fontWeight: '700', 
    color: '#D23A01' 
  },
  uploadSection: {
    background: 'linear-gradient(135deg, #FEF3F0 0%, #FFF5F2 100%)',
    borderRadius: '20px',
    padding: '28px',
    marginBottom: '32px',
    border: '2px solid #FDE5D6'
  },
  uploadHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#D23A01'
  },
  uploadMessage: {
    fontSize: '14px',
    color: '#4a5568',
    marginBottom: '20px',
    lineHeight: '1.5'
  },
  uploadNowBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px 24px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  successActions: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '16px' 
  },
  secondaryBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px', 
    padding: '14px', 
    background: '#f1f5f9', 
    color: '#334155', 
    border: 'none', 
    borderRadius: '40px', 
    fontWeight: '600', 
    cursor: 'pointer',
    fontSize: '14px'
  },
  outlineBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px', 
    padding: '14px', 
    background: 'white', 
    color: '#D23A01', 
    border: '2px solid #D23A01', 
    borderRadius: '40px', 
    fontWeight: '600', 
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default CreateElectionPage;