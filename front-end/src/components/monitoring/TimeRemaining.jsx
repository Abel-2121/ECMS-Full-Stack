// components/monitoring/TimeRemaining.jsx
import React, { useState, useEffect } from 'react';
import { FiClock, FiAlertCircle } from 'react-icons/fi';

const TimeRemaining = ({ votingEndDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    if (!votingEndDate) return;

    const calculateTimeLeft = () => {
      const end = new Date(votingEndDate);
      const now = new Date();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (86400000)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (3600000)) / (1000 * 60)),
        seconds: Math.floor((diff % (60000)) / 1000),
        isExpired: false
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [votingEndDate]);

  if (timeLeft.isExpired) {
    return (
      <div style={styles.expiredCard}>
        <FiClock size={28} style={styles.expiredIcon} />
        <div>
          <div style={styles.expiredTitle}>Voting Has Ended</div>
          <div style={styles.expiredSubtitle}>Results will be published soon</div>
        </div>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'Days', color: '#D23A01' },
    { value: timeLeft.hours, label: 'Hours', color: '#10b981' },
    { value: timeLeft.minutes, label: 'Minutes', color: '#f59e0b' },
    { value: timeLeft.seconds, label: 'Seconds', color: '#dc2626' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FiClock size={18} color="#D23A01" />
        <span>Time Remaining</span>
      </div>
      <div style={styles.countdownGrid}>
        {timeUnits.map((unit, idx) => (
          <div key={idx} style={styles.countdownItem}>
            <div style={{ ...styles.countdownValue, color: unit.color }}>
              {String(unit.value).padStart(2, '0')}
            </div>
            <div style={styles.countdownLabel}>{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '20px',
    padding: '20px 24px',
    border: '1px solid #e5e7eb',
    textAlign: 'center'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '16px',
    
  },
  countdownGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  countdownItem: {
    textAlign: 'center'
  },
  countdownValue: {
    fontSize: 'clamp(24px, 5vw, 32px)',
    fontWeight: '800',
    fontFamily: 'monospace'
  },
  countdownLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    marginTop: '4px',
    
  },
  expiredCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: '#f1f5f9',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid #e5e7eb'
  },
  expiredIcon: {
    color: '#6b7280'
  },
  expiredTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    
  },
  expiredSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
    
  }
};

export default TimeRemaining;