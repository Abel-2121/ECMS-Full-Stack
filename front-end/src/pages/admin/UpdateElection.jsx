// pages/electionAdmin/UpdateElection.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiClock, FiXCircle, FiAlertCircle, FiCheckCircle, FiHash, FiUsers, FiAward } from 'react-icons/fi';
import { fetchElectionById, updateElection } from '../../Js/election-slice';
import { securityValidators } from '../../utils/validators';

const UpdateElection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentElection, loading } = useSelector(state => state.election);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    registrationStart: '',
    registrationEnd: '',
    nominationStart: '',
    nominationEnd: '',
    votingStart: '',
    votingEnd: '',
    resultPublicationDate: '',
    positions: []
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    dispatch(fetchElectionById(id));
  }, [dispatch, id]);

  // Transform backend data to match PositionsStep format
  useEffect(() => {
    if (currentElection) {
      const transformedPositions = currentElection.positions?.map(pos => {
        let voteType = 'SINGLE';
        let maxSelections = 1;
        let maxRankings = 3;
        let roleAllocations = [];

        if (pos.electionType === 'multiple_winners') {
          voteType = 'MULTIPLE';
          maxSelections = pos.maxCandidates || 5;
        } else if (pos.electionType === 'ranked') {
          voteType = 'RANKED';
          maxRankings = pos.totalSeats || 3;
          roleAllocations = (pos.seatAllocation || []).map(alloc => ({
            rank: alloc.rank,
            roleName: alloc.roleName || '',
            description: alloc.description || ''
          }));
        }

        return {
          id: pos.positionId || `POS-${Date.now()}`,
          title: pos.positionName || '',
          requirements: pos.positionDescription || '',
          seats: pos.totalSeats || 1,
          voteType: voteType,
          maxSelections: maxSelections,
          maxRankings: maxRankings,
          roleAllocations: roleAllocations
        };
      }) || [];
      
      setFormData({
        title: currentElection.title || '',
        description: currentElection.description || '',
        registrationStart: currentElection.timeline?.registrationStart?.slice(0, 16) || '',
        registrationEnd: currentElection.timeline?.registrationEnd?.slice(0, 16) || '',
        nominationStart: currentElection.timeline?.nominationStart?.slice(0, 16) || '',
        nominationEnd: currentElection.timeline?.nominationEnd?.slice(0, 16) || '',
        votingStart: currentElection.timeline?.votingStart?.slice(0, 16) || '',
        votingEnd: currentElection.timeline?.votingEnd?.slice(0, 16) || '',
        resultPublicationDate: currentElection.timeline?.resultPublicationDate?.slice(0, 10) || '',
        positions: transformedPositions
      });
    }
  }, [currentElection]);

  // Validation functions
  const validateTitle = (title) => {
    return securityValidators.isValidElectionTitle(title);
  };

  const validateDescription = (description) => {
    if (!description || description.trim() === '') return null;
    return securityValidators.isValidElectionDescription(description);
  };

  const validateTimeline = () => {
    return securityValidators.isValidElectionTimeline({
      registrationStart: formData.registrationStart,
      registrationEnd: formData.registrationEnd,
      nominationStart: formData.nominationStart,
      nominationEnd: formData.nominationEnd,
      votingStart: formData.votingStart,
      votingEnd: formData.votingEnd,
      resultPublicationDate: formData.resultPublicationDate
    });
  };

  const validatePositionName = (name) => {
    return securityValidators.isValidPositionName(name);
  };

  // Real-time validation
  useEffect(() => {
    const errors = {};
    
    const titleError = validateTitle(formData.title);
    if (titleError) errors.title = titleError;
    
    if (formData.description && formData.description.trim()) {
      const descError = validateDescription(formData.description);
      if (descError) errors.description = descError;
    }
    
    const timelineErrors = validateTimeline();
    if (Object.keys(timelineErrors).length > 0) {
      errors.timeline = timelineErrors;
    }
    
    if (formData.positions.length === 0) {
      errors.positions = 'At least one position is required';
    } else {
      formData.positions.forEach((pos, idx) => {
        const nameError = validatePositionName(pos.title);
        if (nameError) {
          errors[`position_${idx}_name`] = `Position ${idx + 1}: ${nameError}`;
        }
        
        if (pos.voteType === 'RANKED' && pos.roleAllocations) {
          pos.roleAllocations.forEach((alloc, rankIdx) => {
            if (!alloc.roleName || !alloc.roleName.trim()) {
              errors[`position_${idx}_rank_${rankIdx + 1}`] = `Position "${pos.title || idx + 1}" - Rank ${alloc.rank} role name is required`;
            }
          });
        }
      });
    }
    
    setValidationErrors(errors);
  }, [formData.title, formData.description, formData.registrationStart, formData.registrationEnd, 
      formData.nominationStart, formData.nominationEnd, formData.votingStart, formData.votingEnd, 
      formData.resultPublicationDate, formData.positions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'title') {
      processedValue = securityValidators.sanitizeInput(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePositionChange = (index, field, value) => {
    setFormData(prev => {
      const updatedPositions = [...prev.positions];
      updatedPositions[index] = { ...updatedPositions[index], [field]: value };
      return { ...prev, positions: updatedPositions };
    });
  };
  
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };
  
  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate(`/electionAdmin/elections/${id}`);
  };
  
  const handleCloseModal = () => {
    setShowCancelModal(false);
  };
  
  const handleAddPosition = () => {
    setFormData(prev => ({
      ...prev,
      positions: [
        ...prev.positions,
        {
          id: Date.now(),
          title: '',
          requirements: '',
          seats: 1,
          voteType: 'SINGLE',
          maxSelections: 3,
          maxRankings: 3,
          roleAllocations: []
        }
      ]
    }));
  };

  const handleRemovePosition = (index) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index)
    }));
  };

  const handleAddRoleAllocation = (positionIndex) => {
    setFormData(prev => {
      const updatedPositions = [...prev.positions];
      const currentAllocations = [...(updatedPositions[positionIndex].roleAllocations || [])];
      const newRank = currentAllocations.length + 1;
      updatedPositions[positionIndex] = {
        ...updatedPositions[positionIndex],
        roleAllocations: [...currentAllocations, { rank: newRank, roleName: '', description: '' }],
        seats: newRank
      };
      return { ...prev, positions: updatedPositions };
    });
  };

  const handleRemoveRoleAllocation = (positionIndex, rankToRemove) => {
    setFormData(prev => {
      const updatedPositions = [...prev.positions];
      const currentAllocations = [...(updatedPositions[positionIndex].roleAllocations || [])];
      const filteredAllocations = currentAllocations.filter(alloc => alloc.rank !== rankToRemove);
      const renumberedAllocations = filteredAllocations.map((alloc, idx) => ({
        ...alloc,
        rank: idx + 1
      }));
      updatedPositions[positionIndex] = {
        ...updatedPositions[positionIndex],
        roleAllocations: renumberedAllocations,
        seats: renumberedAllocations.length
      };
      return { ...prev, positions: updatedPositions };
    });
  };

  const handleRoleAllocationChange = (positionIndex, rankIndex, field, value) => {
    setFormData(prev => {
      const updatedPositions = [...prev.positions];
      const currentAllocations = [...(updatedPositions[positionIndex].roleAllocations || [])];
      currentAllocations[rankIndex] = {
        ...currentAllocations[rankIndex],
        [field]: value
      };
      updatedPositions[positionIndex] = {
        ...updatedPositions[positionIndex],
        roleAllocations: currentAllocations
      };
      return { ...prev, positions: updatedPositions };
    });
  };

  // Transform back to backend format
  const transformToBackendFormat = () => {
    return {
      title: formData.title,
      description: formData.description,
      registrationStart: formData.registrationStart,
      registrationEnd: formData.registrationEnd,
      nominationStart: formData.nominationStart,
      nominationEnd: formData.nominationEnd,
      votingStart: formData.votingStart,
      votingEnd: formData.votingEnd,
      resultPublicationDate: formData.resultPublicationDate,
      positions: formData.positions.map(pos => {
        let electionType = 'single_winner';
        let totalSeats = parseInt(pos.seats) || 1;
        let seatAllocation = [];
        let maxCandidates = 10;

        if (pos.voteType === 'MULTIPLE') {
          electionType = 'multiple_winners';
          maxCandidates = pos.maxSelections || 5;
        } else if (pos.voteType === 'RANKED') {
          electionType = 'ranked';
          seatAllocation = (pos.roleAllocations || []).map(alloc => ({
            rank: alloc.rank,
            roleName: alloc.roleName || `Position ${alloc.rank}`,
            description: alloc.description || ''
          }));
        }

        return {
          positionName: pos.title,
          positionDescription: pos.requirements || '',
          electionType,
          totalSeats,
          seatAllocation,
          maxCandidates,
          requiredDocuments: ['photo', 'manifesto']
        };
      })
    };
  };

  const validateForm = () => {
    const errors = {};
    
    const titleError = validateTitle(formData.title);
    if (titleError) errors.title = titleError;
    
    const timelineErrors = validateTimeline();
    if (Object.keys(timelineErrors).length > 0) {
      errors.timeline = timelineErrors;
    }
    
    if (formData.positions.length === 0) {
      errors.positions = 'At least one position is required';
    } else {
      for (let i = 0; i < formData.positions.length; i++) {
        const pos = formData.positions[i];
        const nameError = validatePositionName(pos.title);
        if (nameError) {
          errors[`position_${i}`] = `Position ${i + 1}: ${nameError}`;
          break;
        }
        
        if (pos.voteType === 'RANKED' && pos.roleAllocations) {
          for (let j = 0; j < pos.roleAllocations.length; j++) {
            if (!pos.roleAllocations[j].roleName.trim()) {
              errors[`position_${i}_rank_${j + 1}`] = `Position "${pos.title || i + 1}" - Rank ${j + 1} role name is required`;
              break;
            }
          }
        }
      }
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  };

  // Helper function to extract error messages properly (Fixes [object Object] issue)
  const extractErrorMessage = (errors) => {
    const messages = [];
    
    // Title error
    if (errors.title) messages.push(errors.title);
    
    // Description error
    if (errors.description) messages.push(errors.description);
    
    // Positions error
    if (errors.positions) messages.push(errors.positions);
    
    // Timeline errors (nested object)
    if (errors.timeline && typeof errors.timeline === 'object') {
      Object.values(errors.timeline).forEach(err => {
        if (err && typeof err === 'string') messages.push(err);
      });
    }
    
    // Position-specific errors
    Object.keys(errors).forEach(key => {
      if (key.startsWith('position_') && errors[key]) {
        messages.push(errors[key]);
      }
      if (key.includes('_rank_') && errors[key]) {
        messages.push(errors[key]);
      }
    });
    
    return messages.join('. ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (errors) {
      const errorMessage = extractErrorMessage(errors);
      setError(errorMessage || 'Please fix validation errors');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const updateData = transformToBackendFormat();

    try {
      const result = await dispatch(updateElection({ id, electionData: updateData })).unwrap();
      setSuccess('Election updated successfully!');
      setTimeout(() => navigate(`/electionAdmin/elections/${id}`), 1500);
    } catch (err) {
      console.error('Update failed:', err);
      setError(err.message || 'Failed to update election');
    } finally {
      setSaving(false);
    }
  };

  const getInputStyle = (fieldName) => {
    const hasError = validationErrors[fieldName];
    return {
      ...styles.input,
      ...(hasError && styles.inputError)
    };
  };

  if (loading) return <div style={styles.loader}>Loading election data...</div>;
  if (!currentElection) return <div style={styles.loader}>Election not found</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(`/electionAdmin/elections/${id}`)}>
          <FiArrowLeft size={18} /> Back to Election
        </button>
        <h1 style={styles.pageTitle}>Update Election</h1>
        <div style={styles.headerActions}>
          <button style={styles.cancelBtn} onClick={handleCancelClick}>
            <FiXCircle size={16} /> Cancel
          </button>
          <button style={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? <FiClock className="spin" /> : <FiSave />} {saving ? 'Saving...' : 'Update Election'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={styles.errorBanner}>
          <FiAlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div style={styles.successBanner}>
          <FiCheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Basic Info Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Basic Information</h2>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Election Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter election title"
              style={getInputStyle('title')}
              maxLength={100}
            />
            {validationErrors.title && (
              <div style={styles.fieldError}>{validationErrors.title}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter election description"
              rows={4}
              style={styles.textarea}
            />
            {validationErrors.description && (
              <div style={styles.fieldError}>{validationErrors.description}</div>
            )}
          </div>
        </div>

        {/* Timeline Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Timeline</h2>
          
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Registration Start *</label>
              <input
                type="datetime-local"
                name="registrationStart"
                value={formData.registrationStart}
                onChange={handleInputChange}
                style={getInputStyle('registrationStart')}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Registration End *</label>
              <input
                type="datetime-local"
                name="registrationEnd"
                value={formData.registrationEnd}
                onChange={handleInputChange}
                style={getInputStyle('registrationEnd')}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nomination Start *</label>
              <input
                type="datetime-local"
                name="nominationStart"
                value={formData.nominationStart}
                onChange={handleInputChange}
                style={getInputStyle('nominationStart')}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nomination End *</label>
              <input
                type="datetime-local"
                name="nominationEnd"
                value={formData.nominationEnd}
                onChange={handleInputChange}
                style={getInputStyle('nominationEnd')}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Voting Start *</label>
              <input
                type="datetime-local"
                name="votingStart"
                value={formData.votingStart}
                onChange={handleInputChange}
                style={getInputStyle('votingStart')}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Voting End *</label>
              <input
                type="datetime-local"
                name="votingEnd"
                value={formData.votingEnd}
                onChange={handleInputChange}
                style={getInputStyle('votingEnd')}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Results Publication Date</label>
            <input
              type="date"
              name="resultPublicationDate"
              value={formData.resultPublicationDate}
              onChange={handleInputChange}
              style={getInputStyle('resultPublicationDate')}
            />
          </div>
        </div>

        {/* Positions Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Positions ({formData.positions.length})
            {validationErrors.positions && (
              <span style={styles.errorBadge}>⚠️ {validationErrors.positions}</span>
            )}
          </h2>
          
          {formData.positions.map((position, idx) => (
            <div key={position.id || idx} style={styles.positionCard}>
              <div style={styles.positionHeader}>
                <h3 style={styles.positionTitle}>
                  Position {idx + 1}: {position.title || 'Untitled'}
                </h3>
                <button
                  type="button"
                  style={styles.removeBtn}
                  onClick={() => handleRemovePosition(idx)}
                >
                  <FiTrash2 /> Remove Position
                </button>
              </div>

              {validationErrors[`position_${idx}_name`] && (
                <div style={styles.fieldError}>{validationErrors[`position_${idx}_name`]}</div>
              )}

              {/* Position Name and Seats */}
              <div style={styles.row}>
                <div style={{ flex: 2 }}>
                  <label style={styles.label}>Position Name *</label>
                  <input
                    type="text"
                    value={position.title}
                    onChange={(e) => handlePositionChange(idx, 'title', e.target.value)}
                    placeholder="e.g., President"
                    style={getInputStyle(`position_${idx}_name`)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Number of Seats</label>
                  <input
                    type="number"
                    min="1"
                    max={position.voteType === 'RANKED' ? 20 : 10}
                    value={position.seats}
                    onChange={(e) => handlePositionChange(idx, 'seats', parseInt(e.target.value))}
                    style={styles.input}
                    disabled={position.voteType === 'RANKED'}
                  />
                </div>
              </div>

              {/* Vote Type Selection */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Voting Protocol</label>
                <div style={styles.voteTypeRow}>
                  {['SINGLE', 'MULTIPLE', 'RANKED'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const newSeats = type === 'RANKED' ? (position.roleAllocations?.length || 1) : 1;
                        handlePositionChange(idx, 'voteType', type);
                        handlePositionChange(idx, 'seats', newSeats);
                      }}
                      style={{
                        ...styles.voteTypeBtn,
                        background: position.voteType === type ? '#D23A01' : '#f1f5f9',
                        color: position.voteType === type ? '#fff' : '#64748b'
                      }}
                    >
                      {type === 'SINGLE' ? 'Single Choice' : type === 'MULTIPLE' ? 'Multiple Choice' : 'Ranked Choice'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vote Type Specific Fields */}
              {position.voteType === 'MULTIPLE' && (
                <div style={styles.voteConfig}>
                  <label style={styles.label}>Maximum Selections</label>
                  <input
                    type="number"
                    min="1"
                    max={position.seats || 10}
                    value={position.maxSelections}
                    onChange={(e) => handlePositionChange(idx, 'maxSelections', parseInt(e.target.value))}
                    style={{ ...styles.input, maxWidth: '200px' }}
                  />
                  <p style={styles.helperText}>How many candidates each voter can select</p>
                </div>
              )}

              {position.voteType === 'RANKED' && (
                <div style={styles.voteConfig}>
                  <label style={styles.label}>Ranking Limit</label>
                  <input
                    type="number"
                    min="1"
                    max={position.seats || 20}
                    value={position.maxRankings}
                    onChange={(e) => handlePositionChange(idx, 'maxRankings', parseInt(e.target.value))}
                    style={{ ...styles.input, maxWidth: '200px' }}
                  />
                  <p style={styles.helperText}>How many rankings each voter can submit</p>
                </div>
              )}

              {/* Requirements */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Nomination Requirements</label>
                <textarea
                  value={position.requirements}
                  onChange={(e) => handlePositionChange(idx, 'requirements', e.target.value)}
                  placeholder="e.g., Minimum GPA 3.0, No academic probation"
                  rows={3}
                  style={styles.textarea}
                />
              </div>

              {/* Role Allocations for Ranked Voting */}
              {position.voteType === 'RANKED' && (
                <div style={styles.rankedSection}>
                  <div style={styles.sectionHeader}>
                    <label style={styles.label}>
                      <FiHash size={14} /> Role Assignments by Rank
                    </label>
                    <button
                      type="button"
                      style={styles.addRankBtn}
                      onClick={() => handleAddRoleAllocation(idx)}
                    >
                      <FiPlus size={14} /> Add Rank
                    </button>
                  </div>
                  <p style={styles.helperText}>Define what each winner will be called based on their rank</p>
                  
                  {(position.roleAllocations || []).map((alloc, rankIdx) => (
                    <div key={rankIdx} style={styles.rankRow}>
                      <div style={styles.rankBadge}>
                        <p style={styles.rankNumber}>{alloc.rank}</p>
                        <p style={styles.rankSuffix}>
                          {alloc.rank === 1 ? 'st' : alloc.rank === 2 ? 'nd' : alloc.rank === 3 ? 'rd' : 'th'} Place
                        </p>
                        {alloc.rank > 3 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoleAllocation(idx, alloc.rank)}
                            style={styles.removeRankBtn}
                            title="Remove this rank"
                          >
                            <FiTrash2 size={12} />
          </button>
                        )}
                      </div>
                      <div style={styles.rankFields}>
                        <input
                          type="text"
                          placeholder="Role name (e.g., President)"
                          value={alloc.roleName}
                          onChange={(e) => handleRoleAllocationChange(idx, rankIdx, 'roleName', e.target.value)}
                          style={styles.rankInput}
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={alloc.description}
                          onChange={(e) => handleRoleAllocationChange(idx, rankIdx, 'description', e.target.value)}
                          style={styles.rankDescInput}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {validationErrors[`position_${idx}_rank_1`] && (
                    <div style={styles.fieldError}>{validationErrors[`position_${idx}_rank_1`]}</div>
                  )}
                  
                  {(!position.roleAllocations || position.roleAllocations.length === 0) && (
                    <div style={styles.noRanksMessage}>
                      No ranks defined. Click "Add Rank" to add positions.
                    </div>
                  )}
                </div>
              )}

              <hr style={styles.divider} />
            </div>
          ))}

          <button type="button" style={styles.addPositionBtn} onClick={handleAddPosition}>
            <FiPlus /> Add Position
          </button>
        </div>
      </form>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <FiAlertCircle size={24} color="#f59e0b" />
              <h3 style={styles.modalTitle}>Cancel Update</h3>
              <button style={styles.modalClose} onClick={handleCloseModal}>×</button>
            </div>
            <div style={styles.modalBody}>
              <p>Are you sure you want to cancel?</p>
              <p style={styles.modalWarning}>Any unsaved changes will be lost.</p>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.modalCancelBtn} onClick={handleCloseModal}>
                No, Stay
              </button>
              <button style={styles.modalConfirmBtn} onClick={handleConfirmCancel}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};
const styles = {
container: { 
  padding: 'clamp(16px, 4vw, 24px)', 
  maxWidth: '1000px', 
  margin: '0 auto', 
  marginTop:"10vh" 
},
header: { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: 'clamp(16px, 4vw, 24px)', 
  flexWrap: 'wrap', 
  gap: 'clamp(12px, 3vw, 16px)' 
},
backBtn: { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px', 
  padding: 'clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)', 
  background: 'white', 
  border: '1px solid #e2e8f0', 
  borderRadius: '8px', 
  cursor: 'pointer',
  fontSize: 'clamp(14px, 4vw, 16px)'
},
pageTitle: { 
  fontSize: 'clamp(20px, 5vw, 24px)', 
  fontWeight: '700', 
  margin: 0 
},
headerActions: { 
  display: 'flex', 
  gap: 'clamp(8px, 2vw, 12px)' 
},
cancelBtn: { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '6px', 
  padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)', 
  background: '#f1f5f9', 
  color: '#303b49', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: '500',
  fontSize: 'clamp(14px, 4vw, 16px)'
},
saveBtn: { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '6px', 
  padding: 'clamp(8px, 2vw, 10px) clamp(20px, 4vw, 24px)', 
  background: '#10b981', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: '500',
  fontSize: 'clamp(14px, 4vw, 16px)'
},

errorBanner: { 
  background: '#fee2e2', 
  color: '#dc2626', 
  padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)', 
  borderRadius: '8px', 
  marginBottom: '20px', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px',
  fontSize: 'clamp(14px, 4vw, 16px)',
  flexWrap: 'wrap'
},
successBanner: { 
  background: '#dcfce7', 
  color: '#166534', 
  padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)', 
  borderRadius: '8px', 
  marginBottom: '20px', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px',
  fontSize: 'clamp(14px, 4vw, 16px)',
  flexWrap: 'wrap'
},

section: { 
  background: 'white', 
  borderRadius: 'clamp(12px, 3vw, 16px)', 
  padding: 'clamp(16px, 4vw, 24px)', 
  marginBottom: 'clamp(16px, 4vw, 24px)', 
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
},
sectionTitle: { 
  fontSize: 'clamp(16px, 4vw, 18px)', 
  fontWeight: '600', 
  marginBottom: 'clamp(16px, 4vw, 20px)', 
  color: '#000', 
  borderBottom: '1px solid #e2e8f0', 
  paddingBottom: 'clamp(10px, 2.5vw, 12px)' 
},

fieldGroup: { 
  marginBottom: 'clamp(16px, 4vw, 20px)' 
},
label: { 
  display: 'block', 
  fontSize: 'clamp(14px, 3.5vw, 16px)', 
  fontWeight: '600', 
  color: '#000000', 
  marginBottom: '6px', 
  textTransform: 'uppercase' 
},
input: { 
  width: '100%', 
  padding: 'clamp(10px, 2.5vw, 12px)', 
  border: '1px solid #e2e8f0', 
  borderRadius: '8px', 
  fontSize: 'clamp(14px, 4vw, 16px)',
  boxSizing: 'border-box'
},
inputError: { 
  borderColor: '#dc2626', 
  backgroundColor: '#fef2f2' 
},
fieldError: { 
  fontSize: 'clamp(11px, 2.5vw, 12px)', 
  color: '#dc2626', 
  marginTop: '4px' 
},
textarea: { 
  width: '100%', 
  padding: 'clamp(10px, 2.5vw, 12px)', 
  border: '1px solid #e2e8f0', 
  borderRadius: '8px', 
  fontSize: 'clamp(14px, 4vw, 16px)', 
  resize: 'vertical', 
  fontFamily: 'inherit',
  boxSizing: 'border-box'
},
row: { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
  gap: 'clamp(16px, 4vw, 20px)', 
  marginBottom: 'clamp(16px, 4vw, 20px)' 
},
errorBadge: { 
  fontSize: 'clamp(11px, 2.5vw, 12px)', 
  color: '#dc2626', 
  marginLeft: 'clamp(8px, 2vw, 12px)', 
  fontWeight: 'normal' 
},

voteTypeRow: { 
  display: 'flex', 
  gap: 'clamp(8px, 2vw, 12px)', 
  flexWrap: 'wrap',
  flexDirection: 'row'
},
voteTypeBtn: { 
  flex: '1 1 auto',
  minWidth: 'clamp(90px, 20vw, 100px)',
  padding: 'clamp(8px, 2vw, 10px)', 
  borderRadius: '10px', 
  border: 'none', 
  cursor: 'pointer', 
  fontWeight: '600', 
  fontSize: 'clamp(11px, 2.5vw, 13px)', 
  transition: 'all 0.2s'
},
voteConfig: { 
  marginBottom: 'clamp(12px, 3vw, 16px)' 
},
helperText: { 
  fontSize: 'clamp(10px, 2vw, 11px)', 
  color: '#000000', 
  marginTop: '4px' 
},

positionCard: { 
  background: '#f8fafc', 
  borderRadius: 'clamp(10px, 2.5vw, 12px)', 
  padding: 'clamp(16px, 4vw, 20px)', 
  marginBottom: 'clamp(16px, 4vw, 24px)', 
  border: '1px solid #e2e8f0',
  overflowX: 'auto'
},
positionHeader: { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '16px', 
  paddingBottom: '12px', 
  borderBottom: '1px solid #e2e8f0',
  flexWrap: 'wrap',
  gap: '12px'
},
positionTitle: { 
  fontSize: 'clamp(14px, 4.5vw, 16px)', 
  fontWeight: '600', 
  margin: 0 
},
removeBtn: { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '6px', 
  padding: '6px 12px', 
  background: '#fee2e2', 
  color: '#dc2626', 
  border: 'none', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontSize: 'clamp(11px, 2.5vw, 12px)' 
},

rankedSection: { 
  marginTop: '16px', 
  padding: 'clamp(12px, 3vw, 16px)', 
  background: 'white', 
  borderRadius: '8px', 
  border: '1px solid #e2e8f0',
  overflowX: 'auto'
},
sectionHeader: { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '12px',
  flexWrap: 'wrap',
  gap: '10px'
},
addRankBtn: { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '4px', 
  padding: '4px 12px', 
  background: '#e0e7ff', 
  color: '#4338ca', 
  border: 'none', 
  borderRadius: '16px', 
  cursor: 'pointer', 
  fontSize: 'clamp(11px, 2.5vw, 12px)' 
},
rankRow: { 
  display: 'flex', 
  gap: 'clamp(10px, 2.5vw, 12px)', 
  marginBottom: '12px', 
  alignItems: 'flex-start', 
  flexWrap: 'wrap' 
},
rankBadge: { 
  minWidth: 'clamp(70px, 15vw, 85px)', 
  textAlign: 'center', 
  position: 'relative' 
},
rankNumber: { 
  fontSize: 'clamp(18px, 4vw, 20px)', 
  fontWeight: '700', 
  color: '#D23A01', 
  display: 'block' 
},
rankSuffix: { 
  fontSize: 'clamp(10px, 2.5vw, 11px)', 
  color: '#000000' 
},
rankFields: { 
  flex: 1, 
  minWidth: 'clamp(180px, 40vw, 200px)' 
},
rankInput: { 
  width: '100%', 
  padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 12px)', 
  border: '1px solid #e2e8f0', 
  borderRadius: '8px', 
  fontSize: 'clamp(13px, 3vw, 14px)', 
  marginBottom: '8px', 
  outline: 'none',
  boxSizing: 'border-box'
},
rankDescInput: { 
  width: '100%', 
  padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 12px)', 
  border: '1px solid #e2e8f0', 
  borderRadius: '8px', 
  fontSize: 'clamp(12px, 2.5vw, 13px)', 
  outline: 'none',
  boxSizing: 'border-box'
},
removeRankBtn: { 
  position: 'absolute', 
  top: '-8px', 
  right: '-8px', 
  background: '#fee2e2', 
  color: '#dc2626', 
  border: 'none', 
  borderRadius: '50%', 
  width: '18px', 
  height: '18px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  cursor: 'pointer', 
  fontSize: '10px' 
},
noRanksMessage: { 
  textAlign: 'center', 
  padding: 'clamp(16px, 4vw, 20px)', 
  color: '#000000', 
  fontSize: 'clamp(12px, 3vw, 13px)' 
},

addPositionBtn: { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px', 
  padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)', 
  background: '#f1f5f9', 
  border: '1px dashed #cbd5e1', 
  borderRadius: '12px', 
  cursor: 'pointer', 
  width: '100%', 
  justifyContent: 'center', 
  fontSize: 'clamp(13px, 3vw, 14px)', 
  fontWeight: '500' 
},
divider: { 
  margin: 'clamp(16px, 4vw, 20px) 0', 
  border: 'none', 
  borderTop: '1px solid #e2e8f0' 
},

footerActions: { 
  position: 'fixed', 
  bottom: 0, 
  left: 0, 
  right: 0, 
  background: 'white', 
  borderTop: '1px solid #e2e8f0', 
  padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)', 
  display: 'flex', 
  justifyContent: 'flex-end', 
  gap: 'clamp(12px, 3vw, 16px)', 
  zIndex: 100,
  flexWrap: 'wrap'
},
cancelFooterBtn: { 
  padding: 'clamp(10px, 2.5vw, 12px) clamp(20px, 4vw, 24px)', 
  background: '#f1f5f9', 
  color: '#000000', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: '500', 
  fontSize: 'clamp(13px, 3vw, 14px)' 
},
updateFooterBtn: { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px', 
  padding: 'clamp(10px, 2.5vw, 12px) clamp(24px, 5vw, 32px)', 
  background: '#10b981', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: '500', 
  fontSize: 'clamp(13px, 3vw, 14px)' 
},

loader: { 
  textAlign: 'center', 
  padding: 'clamp(40px, 10vw, 60px)', 
  color: '#000000',
  fontSize: 'clamp(14px, 3vw, 16px)'
},

modalOverlay: { 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  background: 'rgba(0,0,0,0.5)', 
  zIndex: 1000, 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  padding: 'clamp(16px, 4vw, 20px)'
},
modal: { 
  background: 'white', 
  borderRadius: 'clamp(10px, 3vw, 12px)', 
  width: '90%', 
  maxWidth: '400px', 
  overflow: 'hidden' 
},
modalHeader: { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  padding: 'clamp(14px, 3vw, 16px) clamp(16px, 4vw, 20px)', 
  borderBottom: '1px solid #e2e8f0' 
},
modalTitle: { 
  fontSize: 'clamp(16px, 4vw, 18px)', 
  fontWeight: '600', 
  margin: 0, 
  flex: 1 
},
modalClose: { 
  background: 'none', 
  border: 'none', 
  fontSize: 'clamp(20px, 5vw, 24px)', 
  cursor: 'pointer', 
  color: '#000000' 
},
modalBody: { 
  padding: 'clamp(16px, 4vw, 20px)' 
},
modalWarning: { 
  fontSize: 'clamp(12px, 3vw, 13px)', 
  color: '#dc2626', 
  marginTop: '8px' 
},
modalFooter: { 
  display: 'flex', 
  justifyContent: 'flex-end', 
  gap: '12px', 
  padding: 'clamp(14px, 3vw, 16px) clamp(16px, 4vw, 20px)', 
  borderTop: '1px solid #e2e8f0',
  flexWrap: 'wrap'
},
modalCancelBtn: { 
  padding: 'clamp(6px, 1.5vw, 8px) clamp(14px, 3vw, 16px)', 
  background: '#f1f5f9', 
  color: '#000000', 
  border: 'none', 
  borderRadius: '6px', 
  cursor: 'pointer',
  fontSize: 'clamp(14px, 4vw, 16px)'
},
modalConfirmBtn: { 
  padding: 'clamp(6px, 1.5vw, 8px) clamp(14px, 3vw, 16px)', 
  background: '#dc2626', 
  color: 'white', 
  border: 'none', 
  borderRadius: '6px', 
  cursor: 'pointer',
  fontSize: 'clamp(14px, 4vw, 16px)'
}
}

export default UpdateElection;