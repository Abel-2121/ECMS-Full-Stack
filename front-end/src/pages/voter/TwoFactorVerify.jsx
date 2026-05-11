// pages/voter/TwoFactorVerify.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { voteService } from '../../services/voteService';
import { FiShield, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiMail, FiLock } from 'react-icons/fi';

const TwoFactorVerify = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const election = location.state?.election;
  
  const [electionCode, setElectionCode] = useState('');
  const [voterId, setVoterId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (!electionCode.trim() || !voterId.trim()) {
      setError('Please enter both Election ID and Voter ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await voteService.verifyCredentials(election._id, electionCode, voterId);
      sessionStorage.setItem(`verified_${election._id}`, 'true');
      sessionStorage.setItem(`voterId_${election._id}`, voterId);
      navigate(`/voter/cast/${election._id}`, { state: { election, voterId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Election ID or Voter ID. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  if (!election) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <FiAlertCircle size={48} color="#dc2626" />
          <h2>Election Not Found</h2>
          <button onClick={() => navigate('/voter/elections')}>Back to Elections</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      <div style={styles.card}>
        <div style={styles.iconWrapper}>
          <FiShield size={56} color="#D23A01" />
        </div>
        
        <h2 style={styles.title}>Two-Factor Verification</h2>
        <p style={styles.subtitle}>For <strong>{election.title}</strong></p>
        <p style={styles.hint}>
          <FiMail size={14} /> Check your email for your unique credentials
        </p>

        {error && (
          <div style={styles.errorBox}>
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={styles.formGroup}>
          <label style={styles.label}>Election ID</label>
          <div style={styles.inputWrapper}>
            <FiLock size={16} style={styles.inputIcon} />
            <input
              type="text"
              style={styles.input}
              placeholder="ELEC-2024-001"
              value={electionCode}
              onChange={(e) => setElectionCode(e.target.value)}
            />
          </div>
          <p style={styles.helperText}>Found in your email subject line</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Voter ID</label>
          <div style={styles.inputWrapper}>
            <FiShield size={16} style={styles.inputIcon} />
            <input
              type="text"
              style={styles.input}
              placeholder="VOTER-ABC123"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
            />
          </div>
          <p style={styles.helperText}>Unique identifier sent to your registered email</p>
        </div>

        <button style={styles.verifyBtn} onClick={handleVerify} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify & Continue'}
          {!loading && <FiCheckCircle size={16} />}
        </button>

        <div style={styles.infoBox}>
          <FiShield size={20} style={{ color: '#D23A01' }} />
          <div>
            <strong>Secure Verification</strong>
            <p>Your credentials are verified in real-time. This ensures only eligible voters can participate.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: 'clamp(20px, 5vw, 32px)', marginTop: 'clamp(60px, 8vh, 80px)' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', marginBottom: '24px', fontSize: '15px', fontWeight: '500' },
  card: { background: 'white', borderRadius: '28px', padding: 'clamp(32px, 6vw, 48px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
  iconWrapper: { textAlign: 'center', marginBottom: '24px' },
  title: { fontSize: 'clamp(24px, 5vw, 28px)', fontWeight: '800', textAlign: 'center', marginBottom: '8px', color: '#1a1a1a' },
  subtitle: { textAlign: 'center', color: '#4b5563', marginBottom: '16px', fontSize: '15px' },
  hint: { textAlign: 'center', fontSize: '13px', color: '#D23A01', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  errorBox: { background: '#fee2e2', color: '#dc2626', padding: '14px 18px', borderRadius: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' },
  formGroup: { marginBottom: '24px' },
  label: { display: 'block', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a', fontSize: '14px' },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
  input: { width: '100%', padding: '14px 16px 14px 44px', border: '2px solid #e5e7eb', borderRadius: '14px', fontSize: '15px', transition: 'all 0.2s', outline: 'none' },
  helperText: { fontSize: '12px', color: '#6b7280', marginTop: '6px' },
  verifyBtn: { width: '100%', padding: '14px', background: '#D23A01', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' },
  infoBox: { marginTop: '24px', padding: '16px', background: '#FEF3F0', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: '#4b5563' },
  errorCard: { textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px' }
};

export default TwoFactorVerify;