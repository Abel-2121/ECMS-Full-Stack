import React from 'react';
import { FiCheckSquare, FiAlertCircle, FiMonitor, FiShield, FiUsers, FiInfo, FiTrendingUp } from 'react-icons/fi';

const RulesStep = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({ [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>4. Voting & Participation Protocols</h3>
          <p style={styles.subtitle}>Establish eligibility criteria and core participation rules for all voters.</p>
        </div>
      </div>

      <div style={styles.formSection}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <FiUsers size={16} style={styles.labelIcon} /> Eligible Organizations / Levels
          </label>
          <div style={styles.inputWrapper}>
            <input
              name="eligibleLevels"
              placeholder="e.g., Year 1, Year 2, Faculty of Science"
              value={data.eligibleLevels}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            <FiInfo size={16} style={styles.labelIcon} /> Detailed Eligibility Definitions
          </label>
          <div style={styles.inputWrapper}>
            <textarea
              name="eligibilityRules"
              placeholder="Define specific rules (e.g., Only students with GPA above 2.0 can vote)"
              value={data.eligibilityRules}
              onChange={handleChange}
              rows={4}
              style={styles.textarea}
            />
          </div>
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <FiCheckSquare size={16} style={styles.labelIcon} /> Maximum Vote Allotment
          </label>
          <div style={styles.inputWrapper}>
            <input
              type="number"
              min="1"
              name="maxVotes"
              value={data.maxVotes}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <p style={styles.helperText}>How many votes each voter can cast</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            <FiTrendingUp size={16} style={styles.labelIcon} /> Target Turnout Threshold (%)
          </label>
          <div style={styles.inputWrapper}>
            <input
              type="number"
              min="0"
              max="100"
              name="minTurnout"
              value={data.minTurnout}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <p style={styles.helperText}>Minimum voter turnout required for valid election</p>
        </div>
      </div>

      <div style={styles.infoBox}>
        <FiShield size={18} />
        <p>These rules will be displayed to voters before they cast their ballots.</p>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: '800px', 
    margin: '0 auto' 
  },
  header: { 
    marginBottom: 'clamp(24px, 5vw, 32px)' 
  },
  title: { 
    fontSize: 'clamp(22px, 4vw, 26px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    margin: 0 
  },
  subtitle: { 
    fontSize: '15px', 
    color: '#4a5568', 
    marginTop: '6px' 
  },
  formSection: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 'clamp(20px, 4vw, 24px)', 
    marginBottom: 'clamp(24px, 5vw, 32px)' 
  },
  formGroup: { 
    display: 'flex', 
    flexDirection: 'column' 
  },
  label: { 
    fontSize: '16px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px' 
  },
  labelIcon: { 
    color: '#D23A01' 
  },
  inputWrapper: { 
    position: 'relative' 
  },
  input: { 
    width: '100%', 
    padding: '14px 18px', 
    borderRadius: '14px', 
    border: '2px solid #E2E8F0', 
    fontSize: '15px', 
    fontWeight: '500', 
    color: '#1a1a1a', 
    outline: 'none', 
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  textarea: { 
    width: '100%', 
    padding: '14px 18px', 
    borderRadius: '14px', 
    border: '2px solid #E2E8F0', 
    fontSize: '15px', 
    fontWeight: '500', 
    color: '#1a1a1a', 
    outline: 'none', 
    resize: 'vertical', 
    minHeight: '120px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  row: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: 'clamp(16px, 4vw, 24px)', 
    marginBottom: 'clamp(24px, 5vw, 32px)' 
  },
  helperText: { 
    fontSize: '12px', 
    color: '#94a3b8', 
    marginTop: '6px' 
  },
  infoBox: { 
    marginTop: 'clamp(20px, 4vw, 24px)', 
    padding: '14px 18px', 
    background: '#FEF3F0', 
    borderRadius: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    fontSize: '14px', 
    color: '#D23A01', 
    border: '1px solid #FDE5D6'
  }
};

export default RulesStep;