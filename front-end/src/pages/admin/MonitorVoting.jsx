// pages/electionAdmin/MonitorVoting.jsx
import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllElections } from '../../Js/election-slice';
import { monitoringService } from '../../services/monitoringService';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import {
  setActiveElection,
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
  toggleAutoRefresh,
  setActiveElectionData
} from '../../Js/monitoring-slice';

import StatisticsCards from '../../components/monitoring/StatisticsCards';
import TimeRemaining from '../../components/monitoring/TimeRemaining';
import PositionSummary from '../../components/monitoring/PositionSummary';
import PositionLeaderboard from '../../components/monitoring/PositionLeaderboard';
import { 
  FiRefreshCw, FiPause, FiPlay, FiCheckCircle, FiAlertCircle, 
  FiBarChart2, FiAward, FiTrendingUp, FiInfo, FiXCircle, 
  FiChevronDown, FiCalendar
} from 'react-icons/fi';

const MonitorVoting = () => {
  const dispatch = useDispatch();
  const { elections, loading: electionsLoading } = useSelector(state => state.election);
  const monitoring = useSelector(state => state.monitoring);
  const { activeElectionId, statistics, voteCounts, loading, error, lastUpdated, isAutoRefreshing, activeElection } = monitoring;
  
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchAllElections());
  }, [dispatch]);

  useEffect(() => {
    if (elections && elections.length > 0 && !activeElectionId) {
      const votingElections = elections.filter(e => e.status === 'voting_open');
      if (votingElections.length > 0) {
        dispatch(setActiveElection(votingElections[0]._id));
      }
    }
  }, [elections, activeElectionId, dispatch]);

  const fetchMonitoringData = useCallback(async () => {
    if (!activeElectionId) return null;
    
    dispatch(fetchDataStart());
    try {
      const data = await monitoringService.fetchElectionData(activeElectionId);
      dispatch(fetchDataSuccess(data));
      return data;
    } catch (err) {
      dispatch(fetchDataFailure(err.response?.data?.message || err.message));
      throw err;
    }
  }, [activeElectionId, dispatch]);

  const { isRefreshing, manualRefresh } = useAutoRefresh(
    fetchMonitoringData,
    isAutoRefreshing ? 10000 : 0,
    !!activeElectionId
  );

  const handleElectionSelect = (electionId) => {
    dispatch(setActiveElection(electionId));
    setToastMessage(null);
  };

  const handleRefresh = () => {
    manualRefresh();
    showToast('Refreshing data...', 'info');
  };

  const handleToggleAutoRefresh = () => {
    dispatch(toggleAutoRefresh());
    showToast(isAutoRefreshing ? 'Auto-refresh paused' : 'Auto-refresh resumed', 'success');
  };

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const votingElections = elections.filter(e => e.status === 'voting_open');
  const hasVotingElections = votingElections.length > 0;
  const selectedElection = votingElections.find(e => e._id === activeElectionId);

  return (
    <div style={styles.container}>
      {/* Toast Message */}
      {toastMessage && (
        <div style={{
          ...styles.toast,
          ...(toastMessage.type === 'error' ? styles.toastError : 
             toastMessage.type === 'success' ? styles.toastSuccess : 
             styles.toastInfo)
        }}>
          {toastMessage.type === 'error' ? <FiXCircle size={16} /> : 
           toastMessage.type === 'success' ? <FiCheckCircle size={16} /> : 
           <FiInfo size={16} />}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            <FiBarChart2 size={32} style={styles.titleIcon} />
            Live Vote Monitoring
          </h1>
          <p style={styles.subtitle}>Real-time election tracking and analytics dashboard</p>
        </div>
        
        {activeElectionId && (
          <div style={styles.headerRight}>
            <div style={styles.autoRefreshCard}>
              <button 
                style={isAutoRefreshing ? styles.autoRefreshBtnActive : styles.autoRefreshBtn}
                onClick={handleToggleAutoRefresh}
              >
                {isAutoRefreshing ? <FiPause size={14} /> : <FiPlay size={14} />}
                <span>{isAutoRefreshing ? 'Auto Refresh ON' : 'Auto Refresh OFF'}</span>
                {isAutoRefreshing && <span style={styles.refreshBadge}>10s</span>}
              </button>
              
              <div style={styles.lastUpdatedWrapper}>
                <span style={styles.lastUpdatedLabel}>Last sync</span>
                <span style={styles.lastUpdatedValue}>
                  {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--:--'}
                </span>
              </div>
              
              <button 
                style={{ ...styles.refreshBtn, ...(isRefreshing ? styles.refreshing : {}) }}
                onClick={handleRefresh}
                disabled={loading}
              >
                <FiRefreshCw size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Election Dropdown Selector - Instead of Tabs */}
      {hasVotingElections && (
        <div style={styles.dropdownContainer}>
          <div style={styles.dropdownWrapper}>
            <FiCalendar size={18} style={styles.dropdownIcon} />
            <select 
              value={activeElectionId || ''}
              onChange={(e) => handleElectionSelect(e.target.value)}
              style={styles.electionSelect}
            >
              {votingElections.map(election => (
                <option key={election._id} value={election._id}>
                  {election.title}
                </option>
              ))}
            </select>
            <FiChevronDown size={16} style={styles.dropdownChevron} />
          </div>
          {selectedElection && (
            <div style={styles.selectedInfo}>
              <span style={styles.selectedBadge}>Active Election</span>
              <span style={styles.selectedName}>{selectedElection.title}</span>
            </div>
          )}
        </div>
      )}

      {/* No Voting Elections Message */}
      {!hasVotingElections && (
        <div style={styles.noVotingCard}>
          <FiTrendingUp size={64} style={styles.noVotingIcon} />
          <h3 style={styles.noVotingTitle}>No Active Voting Elections</h3>
          <p style={styles.noVotingText}>
            There are currently no elections with voting in progress.
            Please check back later when voting has started.
          </p>
        </div>
      )}

      {/* Time Remaining */}
      {activeElection && hasVotingElections && (
        <div style={styles.timeRemainingWrapper}>
          <TimeRemaining votingEndDate={activeElection.timeline?.votingEnd} />
        </div>
      )}

      {/* Error State */}
      {error && hasVotingElections && (
        <div style={styles.errorContainer}>
          <div style={styles.errorCard}>
            <FiAlertCircle size={24} style={styles.errorIcon} />
            <div style={styles.errorContent}>
              <h4 style={styles.errorTitle}>Failed to load data</h4>
              <p style={styles.errorMessage}>{error}</p>
            </div>
            <button style={styles.errorRetryBtn} onClick={handleRefresh}>
              <FiRefreshCw size={14} /> Try Again
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {hasVotingElections && activeElectionId ? (
        loading && !statistics ? (
          <div style={styles.loaderContainer}>
            <div style={styles.loaderCard}>
              <div style={styles.spinner}></div>
              <h3 style={styles.loaderTitle}>Loading Monitoring Data</h3>
              <p style={styles.loaderText}>Fetching real-time election statistics...</p>
            </div>
          </div>
        ) : (
          <div style={styles.contentWrapper}>
            {/* KPI Cards */}
            <div style={styles.kpiSection}>
              <StatisticsCards statistics={statistics} />
            </div>
            
            {/* Position Summary */}
            <div style={styles.summarySection}>
              <PositionSummary voteCounts={voteCounts} />
            </div>
            
            {/* Leaderboard */}
            <div style={styles.leaderboardSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  <FiAward size={24} style={styles.sectionIcon} />
                  Vote Leaderboard
                </h2>
                <div style={styles.sectionBadge}>
                  <FiCheckCircle size={12} />
                  <span>Live Results</span>
                </div>
              </div>
              
              <div style={styles.leaderboardGrid}>
                {voteCounts && voteCounts.map((position, idx) => (
                  <div key={position.positionId} style={styles.leaderboardCard}>
                    <PositionLeaderboard position={position} />
                  </div>
                ))}
              </div>
              
              {(!voteCounts || voteCounts.length === 0) && !loading && (
                <div style={styles.noDataCard}>
                  <FiBarChart2 size={48} style={styles.noDataIcon} />
                  <p>No vote data available for this election</p>
                </div>
              )}
            </div>
          </div>
        )
      ) : hasVotingElections && !activeElectionId ? (
        <div style={styles.emptyStateContainer}>
          <div style={styles.emptyStateCard}>
            <FiBarChart2 size={64} style={styles.emptyStateIcon} />
            <h3 style={styles.emptyStateTitle}>Select an Election</h3>
            <p style={styles.emptyStateText}>
              Please select an election from the dropdown above to start monitoring live votes.
            </p>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .hide-on-mobile {
            display: none;
          }
          .dropdown-container {
            flex-direction: column;
            align-items: stretch;
          }
          .header-right {
            width: 100%;
          }
          .auto-refresh-card {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: 'clamp(16px, 4vw, 32px)',
    marginTop: 'clamp(60px, 8vh, 80px)',
    minHeight: '100vh',
    background: '#f8fafc'
  },
  
  // Header Styles
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    flexShrink: 0
  },
  title: {
    fontSize: 'clamp(26px, 5vw, 32px)',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    
  },
  titleIcon: {
    color: '#D23A01'
  },
  subtitle: {
    fontSize: 'clamp(13px, 3vw, 15px)',
    color: '#6b7280',
    
  },
  
  // Dropdown Selector
  dropdownContainer: {
    marginBottom: '28px',
    background: 'white',
    borderRadius: '16px',
    padding: '16px 20px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px'
  },
  dropdownWrapper: {
    position: 'relative',
    minWidth: '280px'
  },
  dropdownIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#D23A01',
    zIndex: 1
  },
  electionSelect: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    color: '#1a1a1a'
  },
  dropdownChevron: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none'
  },
  selectedInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  selectedBadge: {
    padding: '4px 12px',
    background: '#D23A0110',
    color: '#D23A01',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    
  },
  selectedName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    
  },
  
  // No Voting Elections Card
  noVotingCard: {
    textAlign: 'center',
    padding: 'clamp(40px, 8vw, 60px)',
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e5e7eb'
  },
  noVotingIcon: {
    color: '#9ca3af',
    marginBottom: '20px'
  },
  noVotingTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '12px',
    
  },
  noVotingText: {
    fontSize: '14px',
    color: '#6b7280',
    maxWidth: '450px',
    margin: '0 auto',
    lineHeight: '1.6',
    
  },
  
  // Auto Refresh Card
  autoRefreshCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'white',
    padding: '8px 16px',
    borderRadius: '48px',
    border: '1px solid #e5e7eb'
  },
  autoRefreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '32px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    color: '#4b5563',
    
  },
  autoRefreshBtnActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    background: '#D23A01',
    border: 'none',
    borderRadius: '32px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    color: 'white',
    
  },
  refreshBadge: {
    background: 'rgba(255,255,255,0.2)',
    padding: '2px 6px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600'
  },
  lastUpdatedWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0 8px'
  },
  lastUpdatedLabel: {
    fontSize: '9px',
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    
  },
  lastUpdatedValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'monospace'
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    background: '#D23A01',
    border: 'none',
    borderRadius: '32px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    color: 'white',
    
  },
  
  // Time Remaining
  timeRemainingWrapper: {
    marginBottom: '28px'
  },
  
  // Toast
  toast: {
    position: 'fixed',
    top: 'clamp(70px, 12vh, 90px)',
    right: '20px',
    padding: '12px 18px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    animation: 'slideIn 0.3s ease',
    
  },
  toastInfo: {
    background: '#D23A01'
  },
  toastSuccess: {
    background: '#10b981'
  },
  toastError: {
    background: '#dc2626'
  },
  
  // Error State
  errorContainer: {
    marginBottom: '24px'
  },
  errorCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '18px 22px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #fee2e2',
    flexWrap: 'wrap'
  },
  errorIcon: {
    color: '#dc2626'
  },
  errorContent: {
    flex: 1
  },
  errorTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#991b1b',
    marginBottom: '4px',
    
  },
  errorMessage: {
    fontSize: '12px',
    color: '#7f1d1d',
    margin: 0,
    
  },
  errorRetryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    
  },
  
  // Loader
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },
  loaderCard: {
    textAlign: 'center',
    padding: '48px',
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e5e7eb'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #D23A01',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  loaderTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
    
  },
  loaderText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    
  },
  
  // Content Sections
  contentWrapper: {
    animation: 'fadeIn 0.4s ease'
  },
  kpiSection: {
    marginBottom: '32px'
  },
  summarySection: {
    marginBottom: '40px'
  },
  
  // Leaderboard Section
  leaderboardSection: {
    marginTop: '16px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  sectionTitle: {
    fontSize: 'clamp(18px, 4vw, 22px)',
    fontWeight: '800',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0,
    
  },
  sectionIcon: {
    color: '#D23A01'
  },
  sectionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: '#10b98120',
    borderRadius: '32px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#10b981',
    
  },
  leaderboardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  leaderboardCard: {
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb'
  },
  
  // Empty State
  emptyStateContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },
  emptyStateCard: {
    textAlign: 'center',
    padding: '48px',
    background: 'white',
    borderRadius: '20px',
    maxWidth: '480px',
    border: '1px solid #e5e7eb'
  },
  emptyStateIcon: {
    color: '#9ca3af',
    marginBottom: '20px'
  },
  emptyStateTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
    
  },
  emptyStateText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px',
    lineHeight: '1.6',
    
  },
  
  // No Data Card
  noDataCard: {
    textAlign: 'center',
    padding: '48px',
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    color: '#9ca3af'
  },
  noDataIcon: {
    marginBottom: '12px',
    opacity: 0.5,
    color: '#9ca3af'
  }
};

export default MonitorVoting;