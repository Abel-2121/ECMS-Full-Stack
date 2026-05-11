// pages/electionAdmin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminDashboard } from '../../Js/admin-dashboard-slice';
import { formatLocalDate } from '../../utils/formatLocalDate';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  FiCalendar, FiUsers, FiAward, FiCheckCircle, FiClock,
  FiTrendingUp, FiActivity, FiAlertCircle, FiRefreshCw,
  FiLoader, FiEye, FiEdit2, FiBarChart2, FiFileText,
  FiSend, FiFlag
} from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { dashboard, loading, lastUpdated } = useSelector(state => state.adminDashboard);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    await dispatch(fetchAdminDashboard());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return 'Ended';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (86400000)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#1a1a1a', fontSize: '14px' }}>{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ margin: '5px 0 0 0', color: entry.color, fontSize: '13px' }}>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !dashboard) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading dashboard...</p>
      </div>
    );
  }

  const data = dashboard || {};
  const summary = data.summary || {};
  const currentElection = data.currentElection;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Manage and monitor your institution's elections</h3>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.lastUpdated}>
            <FiClock size={14} />
            <span>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--:--'}</span>
          </div>
          <button style={styles.refreshBtn} onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <FiLoader size={16} className="spin" /> : <FiRefreshCw size={16} />}
            Refresh
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div style={styles.welcomeCard}>
        <div>
          <h2 style={styles.welcomeTitle}>Welcome back!</h2>
          <p style={styles.welcomeText}>Here's your institution's election overview</p>
        </div>
        <button style={styles.createElectionBtn} onClick={() => navigate('/electionAdmin/create-election')}>
          <FiCalendar size={16} /> Create New Election
        </button>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#FEF3F0', color: '#D23A01' }}>
            <FiCalendar size={24} />
          </div>
          <div>
            <div style={styles.kpiValue}>{summary.totalElections || 0}</div>
            <div style={styles.kpiLabel}>Total Elections</div>
            <div style={styles.kpiChange}>{summary.activeElections || 0} active, {summary.completedElections || 0} completed</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#E8F5E9', color: '#023430' }}>
            <FiUsers size={24} />
          </div>
          <div>
            <div style={styles.kpiValue}>{summary.totalVoters?.toLocaleString() || 0}</div>
            <div style={styles.kpiLabel}>Eligible Voters</div>
            <div style={styles.kpiChange}>{summary.registeredVoters?.toLocaleString() || 0} registered</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#FEF3F0', color: '#D23A01' }}>
            <FiAward size={24} />
          </div>
          <div>
            <div style={styles.kpiValue}>{summary.totalNominations || 0}</div>
            <div style={styles.kpiLabel}>Nominations</div>
            <div style={styles.kpiChange}>{summary.pendingCandidates || 0} pending review</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#E8F5E9', color: '#023430' }}>
            <FiCheckCircle size={24} />
          </div>
          <div>
            <div style={styles.kpiValue}>{summary.totalVotes?.toLocaleString() || 0}</div>
            <div style={styles.kpiLabel}>Total Votes Cast</div>
            <div style={styles.kpiChange}>+{summary.votesToday || 0} today</div>
          </div>
        </div>
      </div>

      {/* Rest of your content - keep as is */}

      {/* Elections Summary Table - FIXED */}
      <div style={styles.electionsCard}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>
            <FiBarChart2 size={18} style={{ color: '#023430' }} /> All Elections
          </h3>
          <button style={styles.viewAllBtn} onClick={() => navigate('/electionAdmin/elections')}>
            View All →
          </button>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Election Title</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Turnout</th>
                <th style={styles.th}>Votes Cast</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.elections?.slice(0, 5).map((election) => (
                <tr key={election.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.electionName}>{election.title}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: election.status === 'voting_open' ? '#FEF3F0' : 
                                 election.status === 'nomination_open' ? '#E8F5E9' :
                                 election.status === 'results_published' ? '#FEF3F0' : '#f1f5f9',
                      color: election.status === 'voting_open' ? '#D23A01' :
                             election.status === 'nomination_open' ? '#023430' :
                             election.status === 'results_published' ? '#D23A01' : '#475569'
                    }}>
                      {election.status === 'voting_open' ? 'Voting Open' :
                       election.status === 'nomination_open' ? 'Nominations Open' :
                       election.status === 'results_published' ? 'Results Published' :
                       election.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.turnoutValue}>{election.turnout || 0}%</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.votesValue}>{election.votesCast?.toLocaleString()} / {election.totalVoters?.toLocaleString()}</span>
                  </td>
                  <td style={styles.td}>
                    <button 
                      style={styles.viewBtn}
                      onClick={() => navigate(`/electionAdmin/elections/${election.id}`)}
                    >
                      <FiEye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 16px !important;
          }
          .kpi-grid {
            gap: 12px !important;
          }
          .charts-row {
            grid-template-columns: 1fr !important;
          }
          .two-column-grid {
            grid-template-columns: 1fr !important;
          }
          .table-wrapper {
            overflow-x: auto;
          }
          .th, .td {
            padding: 10px 8px !important;
            font-size: 12px !important;
          }
          .quick-actions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    padding: 'clamp(20px, 4vw, 32px)', 
    marginTop: "clamp(60px, 8vh, 80px)", 
    maxWidth: '1400px', 
    margin: '0 auto', 
    background: '#f8fafc', 
    minHeight: '100vh' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 'clamp(24px, 5vw, 32px)', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  title: { 
    fontSize: 'clamp(18px, 4vw, 20px)', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    fontFamily: "'Poppins', sans-serif"
  },
  headerActions: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px' 
  },
  lastUpdated: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontSize: '13px', 
    color: '#4a5568', 
    background: '#f1f5f9', 
    padding: '8px 16px', 
    borderRadius: '20px',
    fontFamily: "'Poppins', sans-serif"
  },
  refreshBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 20px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif"
  },
  welcomeCard: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    background: 'linear-gradient(135deg, #023430 0%, #045a52 100%)', 
    borderRadius: '24px', 
    padding: 'clamp(24px, 5vw, 32px)', 
    marginBottom: 'clamp(24px, 5vw, 32px)', 
    color: 'white', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  welcomeTitle: { 
    fontSize: 'clamp(22px, 5vw, 24px)', 
    fontWeight: '800', 
    marginBottom: '8px', 
    color: 'white',
    fontFamily: "'Poppins', sans-serif"
  },
  welcomeText: { 
    fontSize: '14px', 
    opacity: 0.9, 
    margin: 0, 
    color: 'white',
    fontFamily: "'Poppins', sans-serif"
  },
  createElectionBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 28px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '700', 
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif"
  },
  kpiGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '20px', 
    marginBottom: 'clamp(24px, 5vw, 32px)' 
  },
  kpiCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 24px)', 
    border: '1px solid #e5e7eb', 
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
  },
  kpiIcon: { 
    width: '56px', 
    height: '56px', 
    borderRadius: '16px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  kpiValue: { 
    fontSize: 'clamp(26px, 5vw, 32px)', 
    fontWeight: '800', 
    color: '#000000',
    fontFamily: "'Poppins', sans-serif"
  },
  kpiLabel: { 
    fontSize: '14px', 
    color: '#4b5563', 
    fontWeight: '600', 
    marginTop: '4px',
    fontFamily: "'Poppins', sans-serif"
  },
  kpiChange: { 
    fontSize: '12px', 
    color: '#6b7280', 
    marginTop: '4px', 
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif"
  },
  chartsRow: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
    gap: '24px', 
    marginBottom: 'clamp(24px, 5vw, 32px)' 
  },
  currentElectionCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 24px)', 
    border: '1px solid #e5e7eb' 
  },
  chartCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 24px)', 
    border: '1px solid #e5e7eb' 
  },
  cardTitle: { 
    fontSize: '18px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '16px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    fontFamily: "'Poppins', sans-serif"
  },
  chartSubtitle: { 
    fontSize: '13px', 
    color: '#6b7280', 
    marginBottom: '16px',
    fontFamily: "'Poppins', sans-serif"
  },
  electionHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '16px', 
    flexWrap: 'wrap', 
    gap: '8px' 
  },
  electionTitle: { 
    fontSize: 'clamp(17px, 3vw, 19px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    margin: 0,
    fontFamily: "'Poppins', sans-serif"
  },
  liveBadge: { 
    fontSize: '11px', 
    fontWeight: '700', 
    padding: '4px 12px', 
    borderRadius: '20px' 
  },
  electionStats: { 
    marginBottom: '20px' 
  },
  statRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '14px', 
    fontSize: '14px', 
    flexWrap: 'wrap', 
    gap: '8px' 
  },
  progressBar: { 
    width: '120px', 
    height: '6px', 
    background: '#e5e7eb', 
    borderRadius: '3px', 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    borderRadius: '3px' 
  },
  monitorBtn: { 
    width: '100%', 
    padding: '12px', 
    background: '#FEF3F0', 
    color: '#D23A01', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '700', 
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif"
  },
  noElectionCard: { 
    textAlign: 'center', 
    padding: '40px' 
  },
  createBtn: { 
    marginTop: '16px', 
    padding: '10px 24px', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: '600', 
    fontSize: '14px' 
  },
  twoColumnGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
    gap: '24px', 
    marginBottom: 'clamp(24px, 5vw, 32px)' 
  },
  deadlinesCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 24px)', 
    border: '1px solid #e5e7eb' 
  },
  deadlinesList: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  deadlineItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '14px', 
    padding: '14px', 
    background: '#f8fafc', 
    borderRadius: '14px' 
  },
  deadlineIcon: { 
    flexShrink: 0 
  },
  deadlineInfo: { 
    flex: 1 
  },
  deadlineTitle: { 
    fontSize: '15px', 
    fontWeight: '700', 
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  deadlineType: { 
    fontSize: '12px', 
    color: '#6b7280', 
    marginTop: '2px' 
  },
  deadlineDate: { 
    textAlign: 'right' 
  },
  deadlineDay: { 
    fontSize: '13px', 
    fontWeight: '500', 
    color: '#1a1a1a' 
  },
  deadlineDaysLeft: { 
    fontSize: '12px', 
    fontWeight: '600' 
  },
  quickActionsCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 24px)', 
    border: '1px solid #e5e7eb' 
  },
  quickActionsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
    gap: '12px' 
  },
  quickActionBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '10px', 
    padding: '14px', 
    background: '#f8fafc', 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: '700', 
    transition: 'all 0.2s',
    fontFamily: "'Poppins', sans-serif"
  },
  activitiesCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 24px)', 
    border: '1px solid #e5e7eb', 
    marginBottom: 'clamp(24px, 5vw, 32px)' 
  },
  activitiesList: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  activityItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '14px', 
    padding: '14px', 
    background: '#f8fafc', 
    borderRadius: '14px' 
  },
  activityIcon: { 
    flexShrink: 0 
  },
  activityContent: { 
    flex: 1 
  },
  activityMessage: { 
    fontSize: '14px', 
    fontWeight: '600', 
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  activityTime: { 
    fontSize: '12px', 
    color: '#6b7280', 
    marginTop: '2px' 
  },
  reviewBtn: { 
    padding: '6px 14px', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '12px', 
    fontWeight: '700' 
  },
  electionsCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 24px)', 
    border: '1px solid #e5e7eb' 
  },
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '20px', 
    flexWrap: 'wrap', 
    gap: '12px' 
  },
  viewAllBtn: { 
    padding: '8px 16px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '600', 
    color: '#D23A01',
    fontFamily: "'Poppins', sans-serif"
  },
  tableWrapper: { 
    overflowX: 'auto' 
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse',
    minWidth: '600px'
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e5e7eb'
  },
  th: { 
    textAlign: 'left',
    padding: '14px 16px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#000000',
    fontFamily: "'Poppins', sans-serif",
    borderBottom: '1px solid #e5e7eb'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background 0.2s'
  },
  td: { 
    padding: '14px 16px',
    verticalAlign: 'middle',
    fontSize: '14px',
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  electionName: { 
    fontSize: '15px', 
    fontWeight: '600', 
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  statusBadge: { 
    padding: '6px 14px', 
    borderRadius: '20px', 
    fontSize: '12px', 
    fontWeight: '700', 
    display: 'inline-block' 
  },
  turnoutValue: {
    fontWeight: '600',
    color: '#D23A01',
    fontSize: '14px'
  },
  votesValue: {
    fontWeight: '500',
    color: '#1a1a1a',
    fontSize: '14px'
  },
  viewBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '8px 16px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '600', 
    color: '#D23A01',
    fontFamily: "'Poppins', sans-serif"
  },
  noData: { 
    textAlign: 'center', 
    padding: '40px', 
    color: '#6b7280', 
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif"
  },
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '400px', 
    gap: '20px' 
  },
  loaderText: {
    fontSize: '16px',
    color: '#6b7280',
    fontFamily: "'Poppins', sans-serif"
  },
  spinner: { 
    width: '50px', 
    height: '50px', 
    border: '3px solid #e5e7eb', 
    borderTop: '3px solid #D23A01', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  },
  tooltip: { 
    background: 'white', 
    padding: '12px 16px', 
    borderRadius: '12px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
    border: '1px solid #e5e7eb' 
  }
};

export default AdminDashboard;