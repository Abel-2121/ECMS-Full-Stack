import React from 'react';
import { FiCheckCircle, FiTarget, FiAward, FiClock, FiShield, FiUsers, FiCalendar, FiArrowRight, FiCheckSquare, FiTrendingUp } from 'react-icons/fi';

const ReviewStep = ({ data }) => {
  const formatLocalDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(includeTime && { hour: '2-digit', minute: '2-digit', hour12: true })
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const getVoteTypeStyle = (type) => {
    if (type === 'SINGLE') return { color: '#D23A01', bg: '#FEF3F0', label: 'Single Choice' };
    if (type === 'MULTIPLE') return { color: '#D23A01', bg: '#FEF3F0', label: 'Multiple Choice' };
    if (type === 'RANKED') return { color: '#023430', bg: '#E8F5E9', label: 'Ranked Choice' };
    return { color: '#64748b', bg: '#f8fafc', label: type };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Final Review & Deployment</h2>
          <p style={styles.subtitle}>Verify all electoral parameters before finalizing the launch.</p>
        </div>
        <div style={styles.readyBadge}>
          <FiCheckCircle size={16} /> 
          <p>System Ready</p>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.column}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <FiTarget size={22} color="#D23A01" />
              <h3 style={styles.cardTitle}>Election Identity</h3>
            </div>
            <div style={styles.infoGroup}>
              <p style={styles.label}>OFFICIAL TITLE</p>
              <div style={styles.valLarge}>{data.title || 'Untitled Election'}</div>
            </div>
            <div style={styles.infoGroup}>
              <p style={styles.label}>DESCRIPTION</p>
              <div style={styles.valMedium}>{data.description || 'No description provided.'}</div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <FiAward size={22} color="#D23A01" />
              <h3 style={styles.cardTitle}>Positions & Structure</h3>
            </div>
            <div style={styles.positionsStack}>
              {data.positions?.map((p, idx) => {
                const style = getVoteTypeStyle(p.voteType);
                return (
                  <div key={idx} style={styles.posItem}>
                    <div style={styles.posTop}>
                      <p style={styles.posIndex}>{idx + 1}</p>
                      <div style={{ flex: 1 }}>
                        <div style={styles.posTitle}>{p.title}</div>
                        <div style={styles.posBadges}>
                          <p style={styles.pillBlue}>{p.seats} SEATS</p>
                          <p style={{ ...styles.pillType, color: style.color, background: style.bg }}>{style.label}</p>
                        </div>
                      </div>
                    </div>
                    {p.voteType === 'RANKED' && (
                      <div style={styles.roleTable}>
                        {p.roleAllocations?.map(r => (
                          <div key={r.rank} style={styles.roleRow}>
                            <p style={styles.roleRank}>Rank {r.rank}</p>
                            <p style={styles.roleName}>{r.roleName}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={styles.column}>
          <div style={{ ...styles.card, borderTop: `3px solid #D23A01` }}>
            <div style={styles.cardHeader}>
              <FiClock size={22} color="#D23A01" />
              <h3 style={styles.cardTitle}>Phase Timeline</h3>
            </div>
            <div style={styles.timelineList}>
              <TimelineRow label="Registration" start={data.regStart} end={data.regEnd} format={formatLocalDate} />
              <TimelineRow label="Nomination" start={data.nomStart} end={data.nomEnd} format={formatLocalDate} />
              <TimelineRow label="Voting" start={data.voteStart} end={data.voteEnd} format={formatLocalDate} isBold />
              <div style={styles.resultBox}>
                <p style={styles.label}>PUBLIC RESULTS RELEASE</p>
                <div style={styles.resultDate}>{formatLocalDate(data.resultDate, true)}</div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <FiShield size={22} color="#D23A01" />
              <h3 style={styles.cardTitle}>Voter Governance</h3>
            </div>
            <div style={styles.govGrid}>
              <div style={styles.govItem}>
                <FiUsers size={18} color="#023430" />
                <p><strong>Target:</strong> {data.eligibleLevels || 'All Levels'}</p>
              </div>
              <div style={styles.govItem}>
                <FiCheckSquare size={18} color="#023430" />
                <p><strong>Max Votes:</strong> {data.maxVotes} Per Person</p>
              </div>
              <div style={styles.govItem}>
                <FiTrendingUp size={18} color="#023430" />
                <p><strong>Turnout Threshold:</strong> {data.minTurnout || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineRow = ({ label, start, end, format, isBold }) => (
  <div style={styles.tRow}>
    <div style={styles.tLabel}>{label.toUpperCase()}</div>
    <div style={{ ...styles.tDates, fontWeight: isBold ? '800' : '600' }}>
      <p>{format(start, true)}</p>
      <FiArrowRight size={14} color="#94a3b8" />
      <p>{format(end, true)}</p>
    </div>
  </div>
);

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', paddingBottom: 'clamp(20px, 4vw, 40px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: 'clamp(24px, 5vw, 28px)', fontWeight: '900', color: '#1a1a1a', margin: 0 },
  subtitle: { fontSize: '16px', color: '#4a5568', marginTop: '6px', fontWeight: '500' },
  readyBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: '#023430', color: '#fff', padding: '8px 18px', borderRadius: '30px', fontSize: '14px', fontWeight: '700' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'clamp(24px, 5vw, 32px)' },
  column: { display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 5vw, 32px)' },
  card: { background: '#fff', borderRadius: '20px', padding: 'clamp(20px, 4vw, 28px)', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' },
  cardTitle: { fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: '800', color: '#1a1a1a', margin: 0 },
  label: { fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' },
  valLarge: { fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '800', color: '#D23A01', lineHeight: '1.3' },
  valMedium: { fontSize: '15px', color: '#4a5568', fontWeight: '500', lineHeight: '1.6' },
  infoGroup: { marginBottom: '20px' },
  positionsStack: { display: 'flex', flexDirection: 'column', gap: '14px' },
  posItem: { padding: '18px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' },
  posTop: { display: 'flex', gap: '14px', alignItems: 'center' },
  posIndex: { width: '34px', height: '34px', background: '#D23A01', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800' },
  posTitle: { fontSize: '17px', fontWeight: '700', color: '#1a1a1a' },
  posBadges: { display: 'flex', gap: '8px', marginTop: '6px' },
  pillBlue: { padding: '3px 10px', background: '#FEF3F0', color: '#D23A01', borderRadius: '8px', fontSize: '11px', fontWeight: '700' },
  pillType: { padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' },
  roleTable: { marginTop: '14px', padding: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' },
  roleRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px', fontWeight: '600' },
  roleRank: { color: '#D23A01' },
  roleName: { color: '#1a1a1a' },
  timelineList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  tRow: { display: 'flex', flexDirection: 'column', gap: '6px' },
  tLabel: { fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.05em' },
  tDates: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#1a1a1a' },
  resultBox: { padding: '18px', background: '#FEF3F0', borderRadius: '16px', border: '1px solid #FDE5D6', marginTop: '10px' },
  resultDate: { fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: '800', color: '#023430', marginTop: '4px' },
  govGrid: { display: 'grid', gap: '14px' },
  govItem: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#1a1a1a', fontWeight: '500' },
  '@media (max-width: 768px)': {
    mainGrid: { gridTemplateColumns: '1fr' }
  }
};

export default ReviewStep;