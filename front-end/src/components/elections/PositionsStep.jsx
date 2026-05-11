// components/elections/PositionsStep.jsx
import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiAward, FiUsers, FiEdit3, FiHash, FiAlertCircle } from 'react-icons/fi';
import { securityValidators } from '../../utils/validators';

const PositionsStep = ({ data, onChange }) => {
  const [newPosition, setNewPosition] = useState({
    title: '',
    seats: 3,
    requirements: '',
    voteType: 'SINGLE',
    maxSelections: 3,
    maxRankings: 3,
    roleAllocations: []
  });
  const [positionErrors, setPositionErrors] = useState({});

  // Initialize default role allocations for ranked voting
  useEffect(() => {
    if (newPosition.voteType === 'RANKED') {
      const seats = parseInt(newPosition.seats) || 1;
      const currentAllocations = [...(newPosition.roleAllocations || [])];
      
      if (currentAllocations.length === 0) {
        for (let i = 0; i < seats; i++) {
          currentAllocations.push({
            rank: i + 1,
            roleName: getDefaultRoleName(i + 1),
            description: ''
          });
        }
      } else {
        for (let i = currentAllocations.length; i < seats; i++) {
          currentAllocations.push({
            rank: i + 1,
            roleName: getDefaultRoleName(i + 1),
            description: ''
          });
        }
        while (currentAllocations.length > seats) {
          currentAllocations.pop();
        }
      }
      
      setNewPosition(prev => ({ ...prev, roleAllocations: currentAllocations }));
    } else {
      setNewPosition(prev => ({ ...prev, roleAllocations: [] }));
    }
  }, [newPosition.seats, newPosition.voteType]);

  const getDefaultRoleName = (rank) => {
    const defaults = {
      1: 'President',
      2: 'Vice President',
      3: 'Secretary',
      4: 'Treasurer',
      5: 'Public Relations Officer',
      6: 'Organizer',
      7: 'Advisor',
      8: 'Member'
    };
    return defaults[rank] || `Position ${rank}`;
  };

  const validatePosition = (position) => {
    const errors = {};
    
    // Use your validator for position name
    const nameError = securityValidators.isValidPositionName(position.title);
    if (nameError) errors.title = nameError;
    
    // Validate requirements if provided
    if (position.requirements && position.requirements.trim()) {
      if (position.requirements.length < 10) {
        errors.requirements = 'Requirements should be at least 10 characters';
      } else if (position.requirements.length > 500) {
        errors.requirements = 'Requirements should not exceed 500 characters';
      }
    }
    
    return errors;
  };

  const handleRoleNameChange = (rank, roleName) => {
    const updatedAllocations = newPosition.roleAllocations.map(alloc =>
      alloc.rank === rank ? { ...alloc, roleName } : alloc
    );
    setNewPosition(prev => ({ ...prev, roleAllocations: updatedAllocations }));
  };

  const handleRoleDescriptionChange = (rank, description) => {
    const updatedAllocations = newPosition.roleAllocations.map(alloc =>
      alloc.rank === rank ? { ...alloc, description } : alloc
    );
    setNewPosition(prev => ({ ...prev, roleAllocations: updatedAllocations }));
  };

  const handleAddRank = () => {
    const newRank = newPosition.roleAllocations.length + 1;
    const updatedAllocations = [
      ...newPosition.roleAllocations,
      {
        rank: newRank,
        roleName: getDefaultRoleName(newRank),
        description: ''
      }
    ];
    setNewPosition(prev => ({ 
      ...prev, 
      roleAllocations: updatedAllocations,
      seats: updatedAllocations.length
    }));
  };

  const handleRemoveRank = (rank) => {
    const updatedAllocations = newPosition.roleAllocations.filter(r => r.rank !== rank);
    const renumberedAllocations = updatedAllocations.map((alloc, idx) => ({
      ...alloc,
      rank: idx + 1
    }));
    setNewPosition(prev => ({ 
      ...prev, 
      roleAllocations: renumberedAllocations,
      seats: renumberedAllocations.length
    }));
  };

  const handleAdd = () => {
    const errors = validatePosition(newPosition);
    if (Object.keys(errors).length > 0) {
      setPositionErrors(errors);
      return;
    }
    
    setPositionErrors({});
    
    const positionToAdd = {
      ...newPosition,
      id: Date.now(),
      roleAllocations: newPosition.voteType === 'RANKED' 
        ? newPosition.roleAllocations.filter(r => r.roleName.trim())
        : []
    };
    
    onChange({
      positions: [...(data.positions || []), positionToAdd]
    });
    
    setNewPosition({
      title: '',
      seats: 3,
      requirements: '',
      voteType: 'SINGLE',
      maxSelections: 3,
      maxRankings: 3,
      roleAllocations: []
    });
  };

  const handleRemove = (id) => {
    onChange({ positions: data.positions.filter(p => p.id !== id) });
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px 12px 40px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none'
  };

  const getInputErrorStyle = () => ({
    ...inputStyle,
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  });

  return (
    <div>
      <h3 style={styles.title}>3. Positions & Requirements</h3>
      <p style={styles.subtitle}>Define the available roles for this election.</p>

      {/* Vote Type Selection */}
      <div style={styles.voteTypeGroup}>
        <label style={styles.label}>Voting Protocol</label>
        <div style={styles.voteTypeRow}>
          {['SINGLE', 'MULTIPLE', 'RANKED'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setNewPosition({ ...newPosition, voteType: type })}
              style={{
                ...styles.voteTypeBtn,
                background: newPosition.voteType === type ? '#2563EB' : '#f1f5f9',
                color: newPosition.voteType === type ? '#fff' : '#64748b'
              }}
            >
              {type === 'SINGLE' ? 'Single Choice' : type === 'MULTIPLE' ? 'Multiple Choice' : 'Ranked Choice'}
            </button>
          ))}
        </div>
      </div>

      {/* Position List */}
      <div style={styles.grid}>
        {data.positions && data.positions.map((p) => (
          <div key={p.id} style={styles.positionCard}>
            <div style={styles.cardHeader}>
              <p style={styles.seatBadge}>{p.seats} SEAT{p.seats > 1 ? 'S' : ''}</p>
              <p style={styles.voteTypeBadge}>
                {p.voteType === 'SINGLE' ? 'Single Choice' : p.voteType === 'MULTIPLE' ? `Multiple (Max ${p.maxSelections})` : `Ranked (Top ${p.maxRankings})`}
              </p>
            </div>
            <h4 style={styles.positionTitle}>{p.title}</h4>
            {p.requirements && <p style={styles.requirements}>{p.requirements}</p>}
            
            {p.voteType === 'RANKED' && p.roleAllocations && p.roleAllocations.length > 0 && (
              <div style={styles.allocationsList}>
                <div style={styles.allocationsLabel}>Role Assignments:</div>
                {p.roleAllocations.map(alloc => (
                  <div key={alloc.rank} style={styles.allocationItem}>
                    <p style={styles.allocationRank}>#{alloc.rank}:</p>
                    <p style={styles.allocationRole}>{alloc.roleName}</p>
                  </div>
                ))}
              </div>
            )}
            
            <button style={styles.deleteBtn} onClick={() => handleRemove(p.id)}>
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Position Form */}
      <div style={styles.addForm}>
        <h4 style={styles.addTitle}><FiPlus /> Add Position</h4>

        {positionErrors.title && (
          <div style={styles.fieldErrorContainer}>
            <FiAlertCircle size={14} color="#dc2626" />
            <span>{positionErrors.title}</span>
          </div>
        )}

        <div style={styles.formRow}>
          <div style={styles.formField}>
            <label style={styles.label}>Position Name <span style={styles.required}>*</span></label>
            <div style={styles.inputWrapper}>
              <FiAward style={styles.icon} />
              <input
                placeholder="e.g., Executive Committee"
                value={newPosition.title}
                onChange={(e) => {
                  setNewPosition({ ...newPosition, title: e.target.value });
                  setPositionErrors({});
                }}
                style={positionErrors.title ? getInputErrorStyle() : inputStyle}
              />
            </div>
          </div>
          <div style={styles.formField}>
            <label style={styles.label}>Number of Seats</label>
            <div style={styles.inputWrapper}>
              <FiUsers style={styles.icon} />
              <input
                type="number"
                min="1"
                max="10"
                value={newPosition.seats}
                onChange={(e) => setNewPosition({ ...newPosition, seats: e.target.value })}
                style={inputStyle}
                disabled={newPosition.voteType === 'RANKED'}
              />
            </div>
          </div>
        </div>

        {/* Vote Type Specific Fields */}
        {newPosition.voteType !== 'SINGLE' && (
          <div style={styles.voteConfig}>
            <label style={styles.label}>
              {newPosition.voteType === 'MULTIPLE' ? 'Maximum Selections' : 'Ranking Limit'}
            </label>
            <input
              type="number"
              min="1"
              max={newPosition.voteType === 'RANKED' ? newPosition.seats : 10}
              value={newPosition.voteType === 'MULTIPLE' ? newPosition.maxSelections : newPosition.maxRankings}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (newPosition.voteType === 'MULTIPLE') {
                  setNewPosition({ ...newPosition, maxSelections: val });
                } else {
                  setNewPosition({ ...newPosition, maxRankings: val });
                }
              }}
              style={{ ...inputStyle, maxWidth: '200px' }}
            />
          </div>
        )}

        {/* Ranked Voting Role Allocations */}
        {newPosition.voteType === 'RANKED' && (
          <div style={styles.rankedSection}>
            <div style={styles.rankedHeader}>
              <label style={styles.label}>
                <FiHash size={14} /> Role Assignments by Rank
              </label>
              <button
                type="button"
                onClick={handleAddRank}
                style={styles.addRankBtn}
              >
                <FiPlus size={14} /> Add Rank
              </button>
            </div>
            <p style={styles.helperText}>Define what each winner will be called based on their rank</p>
            
            {newPosition.roleAllocations.map((alloc) => (
              <div key={alloc.rank} style={styles.rankRow}>
                <div style={styles.rankBadge}>
                  <p style={styles.rankNumber}>{alloc.rank}</p>
                  <p style={styles.rankSuffix}>
                    {alloc.rank === 1 ? 'st' : alloc.rank === 2 ? 'nd' : alloc.rank === 3 ? 'rd' : 'th'} Place
                  </p>
                  {alloc.rank > 3 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRank(alloc.rank)}
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
                    placeholder={`Role name (e.g., ${getDefaultRoleName(alloc.rank)})`}
                    value={alloc.roleName}
                    onChange={(e) => handleRoleNameChange(alloc.rank, e.target.value)}
                    style={styles.rankInput}
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={alloc.description}
                    onChange={(e) => handleRoleDescriptionChange(alloc.rank, e.target.value)}
                    style={styles.rankDescInput}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Requirements */}
        <div style={styles.formField}>
          <label style={styles.label}>Nomination Requirements</label>
          <div style={styles.inputWrapper}>
            <FiEdit3 style={{ ...styles.icon, top: '16px' }} />
            <textarea
              placeholder="e.g., Minimum GPA 3.0, No academic probation"
              value={newPosition.requirements}
              onChange={(e) => setNewPosition({ ...newPosition, requirements: e.target.value })}
              rows={3}
              style={{ ...inputStyle, paddingTop: '12px', resize: 'vertical' }}
            />
          </div>
          {positionErrors.requirements && (
            <div style={styles.fieldErrorContainer}>
              <FiAlertCircle size={12} color="#dc2626" />
              <span>{positionErrors.requirements}</span>
            </div>
          )}
        </div>

        <button type="button" style={styles.addBtn} onClick={handleAdd}>
          <FiPlus /> Add Position
        </button>
      </div>
    </div>
  );
};

const styles = {
  title: { fontSize: 'clamp(22px, 4vw, 24px)', fontWeight: '700', marginBottom: '8px', color: '#D23A01' },
  subtitle: { color: '#4a5568', marginBottom: 'clamp(24px, 5vw, 32px)', fontSize: '15px' },
  voteTypeGroup: { marginBottom: '32px' },
  voteTypeRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  voteTypeBtn: { 
    flex: 1, 
    padding: '12px', 
    borderRadius: '12px', 
    border: 'none', 
    cursor: 'pointer', 
    fontWeight: '600', 
    fontSize: '14px', 
    transition: 'all 0.2s',
    minWidth: '120px'
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' },
  positionCard: { padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', position: 'relative' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  seatBadge: { background: '#FEF3F0', color: '#D23A01', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  voteTypeBadge: { background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  positionTitle: { fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: '600', marginBottom: '8px', color: '#1a1a1a' },
  requirements: { fontSize: '13px', color: '#4a5568' },
  allocationsList: { marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' },
  allocationsLabel: { fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' },
  allocationItem: { fontSize: '12px', display: 'flex', gap: '8px', marginBottom: '4px' },
  allocationRank: { fontWeight: '600', color: '#D23A01' },
  allocationRole: { color: '#334155' },
  deleteBtn: { position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  addForm: { padding: 'clamp(20px, 4vw, 24px)', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' },
  addTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a1a' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' },
  formField: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' },
  required: { color: '#D23A01', fontSize: '12px' },
  inputWrapper: { position: 'relative' },
  icon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  voteConfig: { marginBottom: '20px' },
  rankedSection: { marginBottom: '20px', padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' },
  rankedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' },
  addRankBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#FEF3F0', color: '#D23A01', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  helperText: { fontSize: '12px', color: '#64748b', marginBottom: '16px' },
  rankRow: { display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start', flexWrap: 'wrap' },
  rankBadge: { minWidth: '85px', textAlign: 'center', position: 'relative' },
  rankNumber: { fontSize: '20px', fontWeight: '700', color: '#D23A01', display: 'block' },
  rankSuffix: { fontSize: '11px', color: '#64748b' },
  removeRankBtn: { position: 'absolute', top: '-8px', right: '-8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' },
  rankFields: { flex: 1, minWidth: '200px' },
  rankInput: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', marginBottom: '8px', outline: 'none' },
  rankDescInput: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: '#D23A01', color: '#fff', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', marginTop: '10px' },
  fieldErrorContainer: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: '#dc2626' }
};

export default PositionsStep;