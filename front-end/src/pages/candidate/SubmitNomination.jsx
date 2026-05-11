// pages/candidate/SubmitNomination.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllElections, fetchElectionById } from '../../Js/election-slice';
import { submitNomination, clearError, clearSuccess, checkHasNomination } from '../../Js/nomination-slice';
import { FiAlertCircle, FiFilter, FiAward } from 'react-icons/fi';
import { securityValidators } from '../../utils/validators';

// Import components
import { NominationStepper } from './components/NominationStepper';
import { PositionSelectionStep } from './components/PositionSelectionStep';
import { CampaignInfoStep } from './components/CampaignInfoStep';
import { DeclarationsStep } from './components/DeclarationsStep';
import { ReviewStep } from './components/ReviewStep';
import { SuccessScreen } from './components/SuccessScreen';
import { LoaderScreen } from './components/LoaderScreen';
import CandidateElectionCard from './components/CandidateElectionCard';
import ElectionDetailModal from '../../components/common/ElectionDetailModal';

const SubmitNomination = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { elections, loading: electionsLoading } = useSelector(state => state.election);
  const { loading, error, success, hasNominationForElection, nominationStatusForElection } = useSelector(state => state.nomination);
  const { user } = useSelector(state => state.auth || { user: null });
  
  const [step, setStep] = useState(1);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showElectionDetail, setShowElectionDetail] = useState(false);
  const [viewingElection, setViewingElection] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nominationStatusMap, setNominationStatusMap] = useState({});
  
  const [formData, setFormData] = useState({
    electionId: '',
    positionId: '',
    positionName: '',
    manifesto: '',
    biography: '',
    slogan: '',
    declarations: { codeOfConduct: false, spendingLimit: false, truthfulness: false },
    campaignPhoto: null,
    supportingDocuments: []
  });
  const [documentTypes, setDocumentTypes] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(fetchAllElections());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (success) dispatch(clearSuccess());
    };
  }, [dispatch, success]);

  // Check nomination status for each election
  useEffect(() => {
    if (elections && elections.length > 0 && user) {
      elections.forEach(async (election) => {
        if (election.status === 'nomination_open') {
          try {
            const result = await dispatch(checkHasNomination(election._id)).unwrap();
            setNominationStatusMap(prev => ({
              ...prev,
              [election._id]: {
                hasNomination: result?.hasNomination || false,
                status: result?.status || null,
                nominationId: result?.nominationId || null
              }
            }));
          } catch (err) {
            console.error('Failed to check nomination status:', err);
          }
        }
      });
    }
  }, [elections, user, dispatch]);

  const eligibleElections = useMemo(() => {
    if (!elections) return [];
    return elections.filter(election => election.status === 'nomination_open');
  }, [elections]);

  const sortedElections = useMemo(() => {
    return [...eligibleElections].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  }, [eligibleElections]);

  const handleElectionSelect = useCallback((election) => {
    const nominationStatus = nominationStatusMap[election._id];
    if (nominationStatus?.hasNomination) {
      alert(`You have already submitted a nomination for this election. Status: ${nominationStatus.status === 'pending' ? 'Pending Review' : nominationStatus.status}`);
      return;
    }
    setSelectedElection(election);
    setFormData(prev => ({ ...prev, electionId: election._id }));
    setStep(2);
  }, [nominationStatusMap]);

  const handlePositionSelect = useCallback((position) => {
    setSelectedPosition(position);
    setFormData(prev => ({ 
      ...prev, 
      positionId: position.positionId,
      positionName: position.positionName
    }));
    setStep(3);
  }, []);

  const handleViewElectionDetail = useCallback(async (election) => {
    if (election && election._id) {
      setViewingElection(election);
      setShowElectionDetail(true);
    } else if (election && typeof election === 'string') {
      try {
        const result = await dispatch(fetchElectionById(election)).unwrap();
        setViewingElection(result);
        setShowElectionDetail(true);
      } catch (err) {
        console.error('Failed to fetch election details:', err);
      }
    }
  }, [dispatch]);

  const handleCloseModal = () => {
    setShowElectionDetail(false);
    setViewingElection(null);
  };

  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear field errors for updated fields
    const updatedKeys = Object.keys(updates);
    if (updatedKeys.length > 0) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        updatedKeys.forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  }, []);

  const addSupportingDocument = useCallback((file, docType) => {
    setFormData(prev => ({
      ...prev,
      supportingDocuments: [...prev.supportingDocuments, file]
    }));
    setDocumentTypes(prev => [...prev, docType]);
  }, []);

  const removeSupportingDocument = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== index)
    }));
    setDocumentTypes(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Validate Campaign Info Step
  const validateCampaignInfo = () => {
    const errors = {};
    
    const manifestoError = securityValidators.isValidManifesto(formData.manifesto);
    if (manifestoError) errors.manifesto = manifestoError;
    
    const biographyError = securityValidators.isValidBiography(formData.biography);
    if (biographyError) errors.biography = biographyError;
    
    const sloganError = securityValidators.isValidSlogan(formData.slogan);
    if (sloganError) errors.slogan = sloganError;
    
    const photoError = securityValidators.isValidImageFile(formData.campaignPhoto, 5);
    if (photoError) errors.campaignPhoto = 'Campaign photo is required';
    
    return errors;
  };

  // Validate Declarations
  const validateDeclarations = () => {
    const error = securityValidators.isValidDeclaration(formData.declarations);
    return error;
  };

  const handleCampaignContinue = () => {
    const errors = validateCampaignInfo();
    setFieldErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setStep(4);
    }
  };

  const handleDeclarationsContinue = () => {
    const error = validateDeclarations();
    if (error) {
      alert(error);
      return;
    }
    setStep(5);
  };

  const handleSubmit = useCallback(async () => {
    if (!formData.electionId) {
      alert('Please select an election first');
      setStep(1);
      return;
    }
    
    if (!formData.positionId) {
      alert('Please select a position first');
      setStep(2);
      return;
    }
    
    const campaignErrors = validateCampaignInfo();
    if (Object.keys(campaignErrors).length > 0) {
      alert('Please complete all required fields correctly');
      setStep(3);
      return;
    }
    
    const declarationsError = validateDeclarations();
    if (declarationsError) {
      alert(declarationsError);
      setStep(4);
      return;
    }
    
    setIsSubmitting(true);
    
    const submissionData = {
      electionId: formData.electionId,
      positionId: formData.positionId,
      positionName: formData.positionName,
      manifesto: formData.manifesto,
      biography: formData.biography,
      slogan: formData.slogan,
      declarations: formData.declarations,
      campaignPhoto: formData.campaignPhoto,
      supportingDocuments: formData.supportingDocuments,
      documentTypes: documentTypes
    };
    
    try {
      const result = await dispatch(submitNomination(submissionData)).unwrap();
      setTimeout(() => navigate(`/${user.role}/my-nominations`), 10000);
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, formData, documentTypes, navigate]);

  if (success) {
    return <SuccessScreen navigate={navigate} />;
  }

  if (electionsLoading && elections.length === 0) {
    return <LoaderScreen />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FiAward size={32} style={styles.headerIcon} />
        <h1 style={styles.title}>Submit Nomination</h1>
        <p style={styles.subtitle}>Complete the form below to apply as a candidate</p>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <FiAlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} style={styles.errorClose}>×</button>
        </div>
      )}

      <NominationStepper currentStep={step} />

      {step === 1 && (
        <div style={styles.electionSelectionContainer}>
          <div style={styles.filterInfo}>
            <FiFilter size={14} />
            <span>Showing elections with <strong>Nomination Open</strong> status</span>
          </div>
          
          {sortedElections.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📋</div>
              <h3>No Elections Available for Nomination</h3>
              <p>There are no elections currently accepting nominations.</p>
              <p style={styles.emptyHint}>Check back later when nomination period opens.</p>
            </div>
          ) : (
            <>
              <h2 style={styles.sectionTitle}>Select an Election</h2>
              <p style={styles.sectionDescription}>Choose the election you want to participate in</p>
              
              <div style={styles.electionsGrid}>
                {sortedElections.map((election) => {
                  const nominationStatus = nominationStatusMap[election._id];
                  const hasNomination = nominationStatus?.hasNomination || false;
                  const statusText = nominationStatus?.status === 'pending' ? 'Pending Review' : 
                                     nominationStatus?.status === 'approved' ? 'Approved' :
                                     nominationStatus?.status === 'rejected' ? 'Rejected' : '';
                  
                  return (
                    <CandidateElectionCard
                      key={election._id}
                      election={election}
                      onViewDetails={handleViewElectionDetail}
                      onSelectElection={handleElectionSelect}
                      hasNomination={hasNomination}
                      nominationStatus={statusText}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {step === 2 && selectedElection && (
        <PositionSelectionStep 
          selectedElection={selectedElection}
          selectedPosition={selectedPosition}
          onPositionSelect={handlePositionSelect}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      )}

      {step === 3 && selectedPosition && (
        <CampaignInfoStep 
          selectedPosition={selectedPosition}
          formData={formData}
          onUpdateFormData={updateFormData}
          onAddDocument={addSupportingDocument}
          onRemoveDocument={removeSupportingDocument}
          documentTypes={documentTypes}
          onBack={() => setStep(2)}
          onContinue={handleCampaignContinue}
          fieldErrors={fieldErrors}
        />
      )}

      {step === 4 && (
        <DeclarationsStep 
          declarations={formData.declarations}
          onDeclarationChange={(name) => setFormData(prev => ({
            ...prev,
            declarations: { ...prev.declarations, [name]: !prev.declarations[name] }
          }))}
          onBack={() => setStep(3)}
          onContinue={handleDeclarationsContinue}
          isLoading={loading || isSubmitting}
        />
      )}

      {step === 5 && (
        <ReviewStep 
          selectedElection={selectedElection}
          selectedPosition={selectedPosition}
          formData={formData}
          documentTypes={documentTypes}
          onBack={() => setStep(4)}
          onSubmit={handleSubmit}
          isLoading={loading || isSubmitting}
        />
      )}

      <ElectionDetailModal 
        election={viewingElection}
        isOpen={showElectionDetail}
        onClose={handleCloseModal}
      />
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    marginTop: 'clamp(60px, 10vh, 80px)', 
    padding: 'clamp(20px, 4vw, 32px)',
    minHeight: '100vh',
    background: '#f8fafc'
  },
  header: {
    textAlign: 'center',
    marginBottom: 'clamp(24px, 5vw, 32px)'
  },
  headerIcon: {
    color: '#D23A01',
    marginBottom: '12px'
  },
  title: {
    fontSize: 'clamp(28px, 6vw, 34px)',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  subtitle: {
    fontSize: 'clamp(14px, 3vw, 16px)',
    color: '#4b5563',
    fontFamily: "'Poppins', sans-serif"
  },
  errorBanner: { 
    background: '#fee2e2', 
    color: '#dc2626', 
    padding: '14px 18px', 
    borderRadius: '12px', 
    marginBottom: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif"
  },
  errorClose: { 
    background: 'none', 
    border: 'none', 
    fontSize: '20px', 
    cursor: 'pointer', 
    color: '#dc2626', 
    marginLeft: 'auto' 
  },
  electionSelectionContainer: {
    marginTop: '24px'
  },
  filterInfo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#D23A0110',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#D23A01',
    marginBottom: '20px',
    fontFamily: "'Poppins', sans-serif"
  },
  sectionTitle: {
    fontSize: 'clamp(22px, 5vw, 26px)',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  sectionDescription: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '24px',
    fontFamily: "'Poppins', sans-serif"
  },
  electionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: 'clamp(20px, 4vw, 24px)'
  },
  emptyState: {
    textAlign: 'center',
    padding: 'clamp(40px, 8vw, 60px)',
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e5e7eb'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyHint: {
    fontSize: '13px',
    color: '#9ca3af',
    marginTop: '8px',
    fontFamily: "'Poppins', sans-serif"
  }
};

export default SubmitNomination;