// components/elections/TimelineStep.jsx
import React, { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiArrowRight, FiInfo, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { securityValidators } from '../../utils/validators';

const TimelineStep = ({ data, onChange }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Use your existing validator from validators.js
    const errors = securityValidators.isValidElectionTimeline({
      registrationStart: data.regStart,
      registrationEnd: data.regEnd,
      nominationStart: data.nomStart,
      nominationEnd: data.nomEnd,
      votingStart: data.voteStart,
      votingEnd: data.voteEnd,
      resultPublicationDate: data.resultDate
    });
    
    setValidationErrors(errors);
    setIsValid(Object.keys(errors).length === 0);
  }, [data.regStart, data.regEnd, data.nomStart, data.nomEnd, data.voteStart, data.voteEnd, data.resultDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const getFieldError = (fieldName) => {
    return touchedFields[fieldName] && validationErrors[fieldName];
  };

  const getInputStyle = (fieldName) => {
    const hasError = getFieldError(fieldName);
    return {
      ...styles.input,
      ...(hasError && styles.inputError),
      ...(touchedFields[fieldName] && !hasError && data[fieldName] && styles.inputSuccess)
    };
  };

  const getPhaseStatus = (start, end, errors, endField) => {
    if (!start || !end) return 'pending';
    if (errors[endField]) return 'error';
    return 'valid';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Timeline Configuration</h3>
          <p style={styles.subtitle}>Establish the chronological flow of the election phases.</p>
        </div>
        {isValid && Object.keys(validationErrors).length === 0 && Object.keys(data).some(key => data[key]) && (
          <div style={styles.validBadge}>
            <FiCheckCircle size={16} />
            <p>Timeline Valid</p>
          </div>
        )}
      </div>

      

      <div style={styles.timelineGrid}>
        <PhaseCard 
          title="1. Voter Registration" 
          description="Period when voters can register their accounts."
          status={getPhaseStatus(data.regStart, data.regEnd, validationErrors, 'regEnd')}
        >
          <DateRow 
            startName="regStart" startVal={data.regStart} 
            endName="regEnd" endVal={data.regEnd} 
            onChange={handleChange}
            onBlur={handleBlur}
            errors={validationErrors}
            touched={touchedFields}
            getInputStyle={getInputStyle}
          />
        </PhaseCard>

        <PhaseCard 
          title="2. Candidate Nomination" 
          description="Window for candidates to submit their applications."
          status={getPhaseStatus(data.nomStart, data.nomEnd, validationErrors, 'nomEnd')}
        >
          <DateRow 
            startName="nomStart" startVal={data.nomStart} 
            endName="nomEnd" endVal={data.nomEnd} 
            onChange={handleChange}
            onBlur={handleBlur}
            errors={validationErrors}
            touched={touchedFields}
            getInputStyle={getInputStyle}
          />
        </PhaseCard>

        <PhaseCard 
          title="3. Voting Period" 
          description="The active window when ballots can be cast."
          highlight
          status={getPhaseStatus(data.voteStart, data.voteEnd, validationErrors, 'voteEnd')}
        >
          <DateRow 
            startName="voteStart" startVal={data.voteStart} 
            endName="voteEnd" endVal={data.voteEnd} 
            onChange={handleChange}
            onBlur={handleBlur}
            errors={validationErrors}
            touched={touchedFields}
            getInputStyle={getInputStyle}
          />
        </PhaseCard>

        <div style={styles.resultSection}>
          <div style={styles.resultInfo}>
            <h4 style={styles.sectionTitle}>Publication of Results</h4>
            <p style={styles.smallSub}>Date when winners are officially announced.</p>
            {getFieldError('resultDate') && <div style={styles.fieldError}>{validationErrors.resultDate}</div>}
          </div>
          <div style={styles.inputWrapper}>
            <FiCalendar style={styles.icon} />
            <input 
              type="date" 
              name="resultDate" 
              value={data.resultDate || ''} 
              onChange={handleChange}
              onBlur={() => handleBlur('resultDate')}
              style={getInputStyle('resultDate')}
            />
            {touchedFields.resultDate && data.resultDate && !validationErrors.resultDate && (
              <FiCheckCircle style={styles.successIcon} size={18} />
            )}
          </div>
        </div>
      </div>

      <div style={styles.infoBox}>
        <FiInfo size={18} />
        <p>All dates and times are in your local timezone. Ensure chronological order: Registration → Nomination → Voting → Results.</p>
      </div>
    </div>
  );
};

const PhaseCard = ({ title, description, children, highlight, status }) => (
  <div style={{ 
    ...styles.card, 
    borderLeft: highlight ? `4px solid #D23A01` : '1px solid #E2E8F0',
    ...(status === 'error' && styles.cardError),
    ...(status === 'valid' && styles.cardValid)
  }}>
    <div style={styles.cardHeader}>
      <div>
        <h4 style={styles.sectionTitle}>{title}</h4>
        <p style={styles.smallSub}>{description}</p>
      </div>
      {status === 'valid' && (
        <div style={styles.phaseValidBadge}>
          <FiCheckCircle size={12} /> Valid
        </div>
      )}
      {status === 'error' && (
        <div style={styles.phaseErrorBadge}>
          <FiAlertCircle size={12} /> Invalid
        </div>
      )}
    </div>
    {children}
  </div>
);

const DateRow = ({ startName, startVal, endName, endVal, onChange, onBlur, errors, touched, getInputStyle }) => {
  const startError = touched[startName] && errors[startName];
  const endError = touched[endName] && errors[endName];
  const startTouched = touched[startName];
  const endTouched = touched[endName];

  return (
    <div style={styles.row}>
      <div style={styles.col}>
        <label style={{ ...styles.label, ...(startError && styles.labelError) }}>Opening Date & Time</label>
        <div style={styles.inputWrapper}>
          <FiClock style={styles.icon} />
          <input 
            type="datetime-local" 
            name={startName} 
            value={startVal || ''} 
            onChange={onChange}
            onBlur={() => onBlur(startName)}
            style={getInputStyle(startName)}
          />
          {startTouched && startVal && !startError && <FiCheckCircle style={styles.successIcon} size={18} />}
        </div>
        {startError && <div style={styles.fieldError}>{errors[startName]}</div>}
      </div>
      
      <div style={styles.arrowCol}>
        <FiArrowRight color="#CBD5E1" size={20} />
      </div>
      
      <div style={styles.col}>
        <label style={{ ...styles.label, ...(endError && styles.labelError) }}>Closing Date & Time</label>
        <div style={styles.inputWrapper}>
          <FiClock style={styles.icon} />
          <input 
            type="datetime-local" 
            name={endName} 
            value={endVal || ''} 
            onChange={onChange}
            onBlur={() => onBlur(endName)}
            style={getInputStyle(endName)}
          />
          {endTouched && endVal && !endError && <FiCheckCircle style={styles.successIcon} size={18} />}
        </div>
        {endError && <div style={styles.fieldError}>{errors[endName]}</div>}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(20px, 5vw, 28px)', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: 'clamp(22px, 4vw, 26px)', fontWeight: '800', color: '#1a1a1a', margin: 0 },
  subtitle: { fontSize: '15px', color: '#4a5568', marginTop: '6px' },
  validBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', background: '#023430', borderRadius: '30px', color: '#fff', fontSize: '13px', fontWeight: '600' },
  errorSummary: { display: 'flex', gap: '12px', padding: '16px', background: '#fef2f2', borderRadius: '12px', marginBottom: 'clamp(20px, 4vw, 24px)', border: '1px solid #fecaca' },
  errorSummaryContent: { flex: 1 },
  errorList: { margin: '8px 0 0 20px', fontSize: '13px', color: '#dc2626' },
  timelineGrid: { display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 4vw, 20px)' },
  card: { background: '#FFF', padding: 'clamp(20px, 4vw, 24px)', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', transition: 'all 0.2s ease' },
  cardError: { borderColor: '#fecaca', background: '#fef2f2' },
  cardValid: { borderColor: '#bbf7d0', background: '#f0fdf4' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' },
  sectionTitle: { fontSize: '17px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  smallSub: { fontSize: '13px', color: '#4a5568', marginTop: '4px' },
  phaseValidBadge: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#023430', borderRadius: '20px', fontSize: '10px', fontWeight: '600', color: '#fff' },
  phaseErrorBadge: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#fee2e2', borderRadius: '20px', fontSize: '10px', fontWeight: '600', color: '#dc2626' },
  row: { display: 'flex', alignItems: 'flex-start', gap: '15px', flexWrap: 'wrap' },
  col: { flex: 1, minWidth: '200px' },
  arrowCol: { paddingTop: '32px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  labelError: { color: '#dc2626' },
  inputWrapper: { position: 'relative' },
  icon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', zIndex: 1 },
  input: { width: '100%', padding: '14px 12px 14px 44px', border: '2px solid #E2E8F0', borderRadius: '14px', fontSize: '15px', fontWeight: '500', color: '#1a1a1a', outline: 'none', transition: 'all 0.2s', background: '#FFFFFF' },
  inputError: { borderColor: '#dc2626', background: '#fef2f2' },
  inputSuccess: { borderColor: '#10b981', background: '#f0fdf4', paddingRight: '40px' },
  successIcon: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#10b981' },
  fieldError: { fontSize: '12px', color: '#dc2626', marginTop: '6px', fontWeight: '500' },
  resultSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(20px, 4vw, 24px)', background: '#FEF3F0', borderRadius: '20px', marginTop: '10px', border: '2px dashed #FDE5D6', flexWrap: 'wrap', gap: '16px' },
  resultInfo: { flex: 1 },
  infoBox: { marginTop: 'clamp(20px, 4vw, 24px)', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#D23A01', border: '1px solid #e2e8f0' },
  '@media (max-width: 700px)': { row: { flexDirection: 'column' }, arrowCol: { paddingTop: '0', textAlign: 'center' }, resultSection: { flexDirection: 'column', textAlign: 'center' } }
};

export default TimelineStep;