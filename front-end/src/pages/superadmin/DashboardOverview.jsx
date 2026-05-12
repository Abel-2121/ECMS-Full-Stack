
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPlatformSummary,
  fetchUserGrowth,
  fetchElectionTrend,
  fetchInstitutionActivity,
  fetchTopInstitutions,
  fetchRecentActivities,
  updateLastUpdated,
  setRefreshing
} from '../../Js/dashboard-slice';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  FiRefreshCw, FiPlus, FiUsers, FiCalendar, FiAward, FiHome, 
  FiClock, FiTrendingUp, FiActivity, FiServer, FiUserPlus, 
  FiInbox, FiLoader, FiBox, FiPieChart, FiCheckCircle,
  FiFileText, FiBarChart2, FiFlag, FiMapPin, FiMail, FiPhone,
  FiStar, FiEye, FiMessageCircle
} from 'react-icons/fi';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { 
    platformSummary, 
    userGrowth, 
    electionTrend, 
    institutionActivity,
    topInstitutions, 
    recentActivities, 
    loading, 
    lastUpdated,
    refreshing 
  } = useSelector(state => state.dashboard);

  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);

  useEffect(() => {
    loadAllDashboardData();
    
    const interval = setInterval(() => {
      handleAutoRefresh();
    }, 60000);
    
    setAutoRefreshInterval(interval);
    
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, []);

  const loadAllDashboardData = async () => {
    await Promise.all([
      dispatch(fetchPlatformSummary()),
      dispatch(fetchUserGrowth()),
      dispatch(fetchElectionTrend()),
      dispatch(fetchInstitutionActivity()),
      dispatch(fetchTopInstitutions()),
      dispatch(fetchRecentActivities())
    ]);
    dispatch(updateLastUpdated());
  };

  const handleRefresh = async () => {
    dispatch(setRefreshing(true));
    await loadAllDashboardData();
  };

  const handleAutoRefresh = async () => {
    console.log('Auto-refreshing dashboard...');
    await loadAllDashboardData();
  };

  const getUserGrowthData = () => {
    const months = userGrowth.months || [];
    const voters = userGrowth.voterGrowth || [];
    const candidates = userGrowth.candidateGrowth || [];
    
    return months.map((month, index) => ({
      month,
      voters: voters[index] || 0,
      candidates: candidates[index] || 0
    }));
  };

  const getElectionActivityData = () => {
    const months = electionTrend.months || [];
    const created = electionTrend.created || [];
    const completed = electionTrend.completed || [];
    
    return months.map((month, index) => ({
      month,
      created: created[index] || 0,
      completed: completed[index] || 0
    }));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const getTimeAgo = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'INSTITUTION_REQUEST': return <FiFileText size={16} />;
      case 'INSTITUTION_CREATED': return <FiHome size={16} />;
      case 'ELECTION_CREATED': return <FiBarChart2 size={16} />;
      case 'VOTE_CAST': return <FiCheckCircle size={16} />;
      default: return <FiMessageCircle size={16} />;
    }
  };
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#ffffff',
          padding: '10px 14px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: `1px solid #D23A01`
        }}>
          <p style={{ margin: 0, fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '6px 0 0 0', color: entry.color, fontSize: '12px' }}>
              {entry.name}: <span style={{ fontWeight: '700', color: '#1a1a1a' }}>{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !platformSummary?.institutions?.total) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading dashboard data...</p>
      </div>
    );
  }

  const userGrowthData = getUserGrowthData();
  const electionActivityData = getElectionActivityData();

  return (
    <div style={styles.container}>
     
      <div style={styles.header}>
        <div>
          <h2 style={styles.welcomeTitle}>Welcome back, Super Admin!</h2>
          <p style={styles.welcomeText}>Here's what's happening across your platform today.</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.autoRefreshBadge}>
            <FiClock size={12} />
            <span>Auto-refresh: 1 min</span>
          </div>
          <div style={styles.lastUpdated}>
            <FiClock size={12} />
            <span>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--:--'}</span>
          </div>
          <button style={styles.refreshBtn} onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <FiLoader size={14} className="spin" /> : <FiRefreshCw size={14} />}
            Refresh
          </button>
        </div>
      </div>

      
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#D23A0110', color: '#D23A01' }}><FiHome size={22} /></div>
          <div style={styles.kpiInfo}>
            <div style={styles.kpiValue}>{platformSummary?.institutions?.total || 0}</div>
            <div style={styles.kpiTitle}>Total Institutions</div>
            <div style={styles.kpiChange}>{platformSummary?.institutions?.active || 0} active</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#02343010', color: '#023430' }}><FiCalendar size={22} /></div>
          <div style={styles.kpiInfo}>
            <div style={styles.kpiValue}>{platformSummary?.elections?.total || 0}</div>
            <div style={styles.kpiTitle}>Total Elections</div>
            <div style={styles.kpiChange}>{platformSummary?.elections?.active || 0} active</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#D23A0110', color: '#D23A01' }}><FiUsers size={22} /></div>
          <div style={styles.kpiInfo}>
            <div style={styles.kpiValue}>{formatNumber(platformSummary?.users?.voters)}</div>
            <div style={styles.kpiTitle}>Total Voters</div>
            <div style={styles.kpiChange}>+{platformSummary?.users?.newVotersThisMonth || 0} this month</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#02343010', color: '#023430' }}><FiAward size={22} /></div>
          <div style={styles.kpiInfo}>
            <div style={styles.kpiValue}>{formatNumber(platformSummary?.users?.candidates)}</div>
            <div style={styles.kpiTitle}>Total Candidates</div>
            <div style={styles.kpiChange}>Across all elections</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#D23A0110', color: '#D23A01' }}><FiBox size={22} /></div>
          <div style={styles.kpiInfo}>
            <div style={styles.kpiValue}>{formatNumber(platformSummary?.votes?.total)}</div>
            <div style={styles.kpiTitle}>Total Votes Cast</div>
            <div style={styles.kpiChange}>{platformSummary?.votes?.yesterday || 0} votes yesterday</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#02343010', color: '#023430' }}><FiServer size={22} /></div>
          <div style={styles.kpiInfo}>
            <div style={styles.kpiValue}>{platformSummary?.users?.admins || 0}</div>
            <div style={styles.kpiTitle}>System Admins</div>
            <div style={styles.kpiChange}>Election administrators</div>
          </div>
        </div>
      </div>

     
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><FiUserPlus size={16} /> User Growth Trends</h3>
            <span style={styles.chartSubtitle}>Last 12 months</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={userGrowthData} margin={{ top: 5, right: 25, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="voters" stroke="#D23A01" strokeWidth={2} dot={{ r: 3 }} name="New Voters" />
              <Line type="monotone" dataKey="candidates" stroke="#023430" strokeWidth={2} dot={{ r: 3 }} name="New Candidates" />
            </LineChart>
          </ResponsiveContainer>
          <div style={styles.chartStats}>
            <span>Total New Voters: <strong style={{ color: '#D23A01' }}>{userGrowth.voterGrowth?.reduce((a, b) => a + b, 0) || 0}</strong></span>
            <span>Total New Candidates: <strong style={{ color: '#023430' }}>{userGrowth.candidateGrowth?.reduce((a, b) => a + b, 0) || 0}</strong></span>
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><FiTrendingUp size={16} /> Election Activity</h3>
            <span style={styles.chartSubtitle}>Last 12 months</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={electionActivityData} margin={{ top: 5, right: 25, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="created" fill="#D23A01" name="Elections Created" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#023430" name="Elections Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={styles.chartStats}>
            <span>Total Created: <strong style={{ color: '#D23A01' }}>{electionTrend.created?.reduce((a, b) => a + b, 0) || 0}</strong></span>
            <span>Total Completed: <strong style={{ color: '#023430' }}>{electionTrend.completed?.reduce((a, b) => a + b, 0) || 0}</strong></span>
          </div>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.chartTitle}><FiActivity size={16} /> Institution Activity</h3>
          <button style={styles.viewAllBtnSmall} onClick={() => navigate('/superAdmin/manage-institutions')}>
            Manage Institutions →
          </button>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Institution</th>
                <th style={styles.th}>Elections</th>
                <th style={styles.th}>Active</th>
                <th style={styles.th}>Voters</th>
                <th style={styles.th}>Votes</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {institutionActivity.institutions?.slice(0, 5).map((inst, idx) => (
                <tr key={inst._id}>
                  <td style={styles.td}>
                    <div style={styles.cellInstitution}>
                      <span style={{ ...styles.institutionRank, color: idx === 0 ? '#D23A01' : '#023430' }}>{idx + 1}</span>
                      <div>
                        <div style={styles.institutionName}>{inst.name}</div>
                        <div style={styles.institutionCode}>{inst.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{inst.totalElections}</td>
                  <td style={styles.td}>{inst.activeElections}</td>
                  <td style={styles.td}>{inst.totalVoters?.toLocaleString()}</td>
                  <td style={styles.td}>{inst.totalVotes?.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, background: inst.status === 'active' ? '#D23A0110' : '#02343010', color: inst.status === 'active' ? '#D23A01' : '#023430' }}>
                      {inst.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!institutionActivity.institutions || institutionActivity.institutions.length === 0) && (
                <tr><td colSpan="6" style={styles.emptyState}>No institutions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={styles.tableFooter}>
          <span>Total: <strong>{institutionActivity.summary?.totalInstitutions || 0}</strong> institutions</span>
          <span>Total Elections: <strong>{institutionActivity.summary?.totalElections || 0}</strong></span>
          <span>Total Votes: <strong>{(institutionActivity.summary?.totalVotes || 0).toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={styles.twoColumnGrid}>
        <div style={styles.topInstitutionsCard}>
          <h3 style={styles.chartTitle}><FiHome size={16} /> Top Performing Institutions</h3>
          <div style={styles.topList}>
            {topInstitutions?.slice(0, 5).map((inst, idx) => {
              const maxElections = topInstitutions[0]?.electionCount || 1;
              const progressWidth = (inst.electionCount / maxElections) * 100;
              
              return (
                <div key={inst._id} style={styles.topItem}>
                  <div style={{ ...styles.topRank, color: idx === 0 ? '#D23A01' : '#023430' }}>#{idx + 1}</div>
                  <div style={styles.topInfo}>
                    <div style={styles.topName}>{inst.name}</div>
                    <div style={styles.topMeta}>{inst.electionCount} elections • {inst.voterCount?.toLocaleString() || 0} voters</div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${progressWidth}%`, background: idx === 0 ? '#D23A01' : '#023430' }} />
                    </div>
                  </div>
                  <div style={{ ...styles.topScore, color: '#D23A01' }}>{inst.electionCount}</div>
                </div>
              );
            })}
            {(!topInstitutions || topInstitutions.length === 0) && <div style={styles.emptyStateSmall}>No data available</div>}
          </div>
          <button style={styles.viewAllBtn} onClick={() => navigate('/superAdmin/manage-institutions')}>
            View All Institutions
          </button>
        </div>

        <div style={styles.activitiesCard}>
          <div style={styles.activitiesHeader}>
            <h3 style={styles.chartTitle}><FiClock size={16} /> Recent Activities</h3>
            <button style={styles.viewAllBtnSmall} onClick={() => navigate('/superAdmin/audit-logs')}>
              View All
            </button>
          </div>
          <div style={styles.activitiesList}>
            {recentActivities?.slice(0, 5).map((activity, idx) => (
              <div key={activity.id || idx} style={styles.activityItem}>
                <div style={styles.activityIcon}>
                  {getActivityIcon(activity.type)}
                </div>
                <div style={styles.activityContent}>
                  <div style={styles.activityMessage}>{activity.message?.substring(0, 60)}</div>
                  <div style={styles.activityTime}>{getTimeAgo(activity.timestamp)}</div>
                </div>
              </div>
            ))}
            {(!recentActivities || recentActivities.length === 0) && <div style={styles.emptyStateSmall}>No recent activities</div>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActionsCard}>
        <h3 style={styles.chartTitle}>Quick Actions</h3>
        <div style={styles.quickActionsGrid}>
          <button style={styles.quickActionBtn} onClick={() => navigate('/superAdmin/create-institution')}>
            <FiPlus size={16} /> Create Institution
          </button>
          <button style={styles.quickActionBtn} onClick={() => navigate('/superAdmin/manage-admins')}>
            <FiUsers size={16} /> Create Admin
          </button>
          <button style={styles.quickActionBtn} onClick={() => navigate('/superAdmin/pending-requests')}>
            <FiInbox size={16} /> Pending Requests
          </button>
          <button style={styles.quickActionBtn} onClick={() => navigate('/superAdmin/system-settings')}>
            <FiPieChart size={16} /> System Settings
          </button>
          <button style={styles.quickActionBtn} onClick={() => navigate('/superAdmin/system-analytics')}>
            <FiTrendingUp size={16} /> Advanced Analytics
          </button>
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
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    padding: '20px', 
    maxWidth: '1200px', 
    margin: '0 auto',
    background: '#f8fafc',
    minHeight: '100vh'
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px', 
    flexWrap: 'wrap', 
    gap: '12px' 
  },
  welcomeTitle: { 
    fontSize: '20px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '4px',
    
  },
  welcomeText: { 
    fontSize: '13px', 
    color: '#4b5563',
    
  },
  headerActions: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    flexWrap: 'wrap' 
  },
  autoRefreshBadge: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    fontSize: '11px', 
    color: '#D23A01', 
    background: '#D23A0110', 
    padding: '6px 12px', 
    borderRadius: '30px',
    
    fontWeight: '500'
  },
  lastUpdated: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    fontSize: '11px', 
    color: '#1a1a1a', 
    background: '#f1f5f9', 
    padding: '6px 12px', 
    borderRadius: '30px',
    
    fontWeight: '500'
  },
  refreshBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '6px 16px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '30px', 
    cursor: 'pointer', 
    fontSize: '12px', 
    fontWeight: '600',
    
    transition: 'all 0.3s ease'
  },
  kpiGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '16px', 
    marginBottom: '24px' 
  },
  kpiCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '14px', 
    background: 'white', 
    borderRadius: '16px', 
    padding: '16px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  kpiIcon: { 
    width: '48px', 
    height: '48px', 
    borderRadius: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  kpiInfo: { 
    flex: 1 
  },
  kpiValue: { 
    fontSize: '26px', 
    fontWeight: '800', 
    color: '#1a1a1a',
    
  },
  kpiTitle: { 
    fontSize: '18px', 
    color: '#111316',
    fontWeight: '500'
  },
  kpiChange: { 
    fontSize: '15px', 
    color: '#D23A01', 
    marginTop: '4px',
    
  },
  chartsRow: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
    gap: '20px', 
    marginBottom: '24px' 
  },
  chartCard: { 
    background: 'white', 
    borderRadius: '16px', 
    padding: '16px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  chartHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '16px', 
    flexWrap: 'wrap', 
    gap: '8px' 
  },
  chartTitle: { 
    fontSize: '15px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    margin: 0, 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    
  },
  chartSubtitle: { 
    fontSize: '11px', 
    color: '#6b7280',
    
  },
  chartStats: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginTop: '16px', 
    paddingTop: '12px', 
    borderTop: '1px solid #e5e7eb', 
    fontSize: '11px', 
    color: '#000000',

    fontWeight: '500',
    flexWrap: 'wrap',
    gap: '8px'
  },
  tableCard: { 
    background: 'white', 
    borderRadius: '16px', 
    padding: '16px', 
    border: '1px solid #e5e7eb', 
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  tableHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '16px', 
    flexWrap: 'wrap', 
    gap: '10px' 
  },
  tableWrapper: { 
    overflowX: 'auto' 
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse' 
  },
  th: {
    textAlign: 'left',
    padding: '10px 10px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
  
    borderBottom: '2px solid #e5e7eb'
  },
  td: {
    padding: '10px 10px',
    fontSize: '16px',
    color: '#000000',
    borderBottom: '1px solid #e5e7eb'
  },
  cellInstitution: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px' 
  },
  institutionRank: { 
    width: '28px', 
    fontWeight: '800', 
    fontSize: '13px',
    
  },
  institutionName: { 
    fontSize: '15px', 
    fontWeight: '600', 
    color: '#1a1a1a',
    
  },
  institutionCode: { 
    fontSize: '13px', 
    color: '#000000',
    
  },
  statusBadge: { 
    padding: '3px 10px', 
    borderRadius: '30px', 
    fontSize: '11px',
    fontWeight: '600',
    
    display: 'inline-block'
  },
  tableFooter: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginTop: '14px', 
    paddingTop: '12px', 
    borderTop: '1px solid #e5e7eb', 
    fontSize: '11px', 
    color: '#000000',
    
    fontWeight: '500',
    flexWrap: 'wrap',
    gap: '10px'
  },
  twoColumnGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
    gap: '20px', 
    marginBottom: '24px' 
  },
  topInstitutionsCard: { 
    background: 'white', 
    borderRadius: '16px', 
    padding: '16px', 
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  topList: { 
    marginTop: '12px', 
    marginBottom: '12px' 
  },
  topItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    padding: '10px', 
    borderBottom: '1px solid #e5e7eb' 
  },
  topRank: { 
    width: '35px', 
    fontWeight: '800', 
    fontSize: '16px',
    
  },
  topInfo: { 
    flex: 1 
  },
  topName: { 
    fontSize: '13px', 
    fontWeight: '600', 
    color: '#1a1a1a',
    
  },
  topMeta: { 
    fontSize: '10px', 
    color: '#000000', 
    marginTop: '2px',
    
  },
  progressBar: { 
    height: '4px', 
    background: '#e5e7eb', 
    borderRadius: '2px', 
    overflow: 'hidden', 
    marginTop: '6px' 
  },
  progressFill: { 
    height: '100%', 
    borderRadius: '2px', 
    transition: 'width 0.3s ease' 
  },
  topScore: { 
    fontSize: '15px', 
    fontWeight: '800',
    
  },
  viewAllBtn: { 
    width: '100%', 
    padding: '8px', 
    background: '#f8fafc', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '16px', 
    fontWeight: '600',
    color: '#D23A01',
    transition: 'all 0.2s ease'
  },
  viewAllBtnSmall: { 
    padding: '4px 12px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: '600',
    color: '#020706',
  
    transition: 'all 0.2s ease'
  },
  activitiesCard: { 
    background: 'white', 
    borderRadius: '16px', 
    padding: '16px', 
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  activitiesHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '12px' 
  },
  activitiesList: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px' 
  },
  activityItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    padding: '10px', 
    background: '#f8fafc', 
    borderRadius: '10px',
    transition: 'all 0.2s ease'
  },
  activityIcon: { 
    fontSize: '18px',
    color: '#D23A01'
  },
  activityContent: { 
    flex: 1 
  },
  activityMessage: { 
    fontSize: '15px', 
    fontWeight: '600', 
    color: '#000000',
    
  },
  activityTime: { 
    fontSize: '14px', 
    color: '#17191d', 
    marginTop: '2px',
    
  },
  quickActionsCard: { 
    background: 'white', 
    borderRadius: '16px', 
    padding: '16px', 
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  quickActionsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
    gap: '10px', 
    marginTop: '14px' 
  },
  quickActionBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px', 
    padding: '10px', 
    background: '#f8fafc', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '15px', 
    fontWeight: '600', 
    color: '#011413',
    transition: 'all 0.2s ease'
  },
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '400px', 
    gap: '16px' 
  },
  loaderText: {
    fontSize: '14px',
    color: '#1a1a1a',
    fontWeight: '500'
  },
  spinner: { 
    width: '40px', 
    height: '40px', 
    border: '3px solid #e5e7eb', 
    borderTop: `3px solid #D23A01`, 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  },
  emptyState: { 
    textAlign: 'center', 
    padding: '30px', 
    color: '#000000',
    fontSize: '12px'
  },
  emptyStateSmall: { 
    textAlign: 'center', 
    padding: '20px', 
    color: '#000000',
  
    fontSize: '11px'
  }
};

// Response media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 900px) {
    .charts-row {
      grid-template-columns: 1fr !important;
    }
    .two-column-grid {
      grid-template-columns: 1fr !important;
    }
  }
  
  @media (max-width: 640px) {
    .kpi-grid {
      grid-template-columns: 1fr !important;
    }
    .quick-actions-grid {
      grid-template-columns: 1fr !important;
    }
    .table-footer {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .chart-stats {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(210, 58, 1, 0.2);
  }
  
  .view-all-btn:hover, .view-all-btn-small:hover, .quick-action-btn:hover {
    background: #D23A01;
    color: white;
    border-color: #D23A01;
  }
  
  tr:hover {
    background: #f8fafc;
  }
  
  .activity-item:hover {
    background: #D23A0110;
    transform: translateX(2px);
  }
`;
if (!document.head.querySelector('#dashboard-overview-styles')) {
  styleSheet.id = 'dashboard-overview-styles';
  document.head.appendChild(styleSheet);
}

export default DashboardOverview;