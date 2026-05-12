// pages/superadmin/SystemAnalytics.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemAnalytics } from '../../Js/dashboard-slice';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  FiTrendingUp, FiUsers, FiCalendar, FiBarChart2, FiPieChart,
  FiActivity, FiClock, FiAward, FiLoader, FiRefreshCw
} from 'react-icons/fi';

// Updated color palette using your primary and secondary colors
const COLORS = ['#D23A01', '#023430', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const SystemAnalytics = () => {
  const dispatch = useDispatch();
  const { analytics, analyticsLoading, lastUpdated } = useSelector(state => state.dashboard);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    await dispatch(fetchSystemAnalytics());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setTimeout(() => setRefreshing(false), 500);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#ffffff',
          padding: '12px 18px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: `1px solid #D23A01`,
          
        }}>
          <p style={{ margin: 0, fontWeight: '700', color: '#1a1a1a', fontSize: '14px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '8px 0 0 0', color: entry.color, fontSize: '13px', fontWeight: '500' }}>
              {entry.name}: <p style={{ fontWeight: '700', color: '#1a1a1a' }}>{entry.value}</p>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (analyticsLoading && !analytics) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading analytics data...</p>
      </div>
    );
  }

  const data = analytics || {};

  const userTrendData = data.monthlyUsers || [];
  const electionStatusData = Object.entries(data.electionStatus || {}).map(([name, value]) => ({ name, value }));
  const voteTrendData = data.monthlyVotes || [];
  const institutionGrowthData = data.institutionGrowth || [];
  const topInstitutionsData = data.topInstitutions?.byElections || [];
  const roleDistributionData = Object.entries(data.roleDistribution || {}).map(([name, value]) => ({ name, value }));
  const hourlyVotesData = data.hourlyVotes || [];
  const weeklyActivityData = data.weeklyActivity || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>System Analytics</h1>
          <p style={styles.subtitle}>Comprehensive platform performance and growth metrics</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.lastUpdated}>
            <FiClock size={14} />
            <p>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--:--'}</p>
          </div>
          <button style={styles.refreshBtn} onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <FiLoader size={16} className="spin" /> : <FiRefreshCw size={16} />}
            Refresh
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#D23A1010', color: '#D23A01' }}><FiCalendar size={28} /></div>
          <div>
            <div style={styles.kpiValue}>{data.summary?.totalElections || 0}</div>
            <div style={styles.kpiLabel}>Total Elections</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#02343010', color: '#023430' }}><FiActivity size={28} /></div>
          <div>
            <div style={styles.kpiValue}>{(data.summary?.totalVotes || 0).toLocaleString()}</div>
            <div style={styles.kpiLabel}>Total Votes Cast</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#D23A0110', color: '#D23A01' }}><FiUsers size={28} /></div>
          <div>
            <div style={styles.kpiValue}>{(data.summary?.totalUsers || 0).toLocaleString()}</div>
            <div style={styles.kpiLabel}>Total Users</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#02343010', color: '#023430' }}><FiAward size={28} /></div>
          <div>
            <div style={styles.kpiValue}>{data.summary?.totalInstitutions || 0}</div>
            <div style={styles.kpiLabel}>Institutions</div>
          </div>
        </div>
      </div>

      {/* Row 1: User Growth Trend + Election Status */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><FiTrendingUp size={18} /> User Registration Trend</h3>
            <p style={styles.chartSubtitle}>Monthly new users</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={userTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 13, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Line type="monotone" dataKey="voters" stroke="#D23A01" strokeWidth={3} name="Voters" dot={{ r: 5, strokeWidth: 2 }} />
              <Line type="monotone" dataKey="candidates" stroke="#023430" strokeWidth={3} name="Candidates" dot={{ r: 5, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><FiPieChart size={18} /> Election Status Distribution</h3>
            <p style={styles.chartSubtitle}>Current election status</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={electionStatusData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={true}
              >
                {electionStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: '13px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Vote Trends + Institution Growth */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><FiActivity size={18} /> Vote Trends</h3>
            <p style={styles.chartSubtitle}>Monthly vote volume</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={voteTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 13, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="votes" stroke="#D23A01" fill="#D23A01" fillOpacity={0.15} name="Votes" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><FiBarChart2 size={18} /> Institution Growth</h3>
            <p style={styles.chartSubtitle}>New institutions per month</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={institutionGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 13, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="institutions" fill="#023430" name="New Institutions" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Top Institutions + User Role Distribution */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><FiAward size={18} /> Top Performing Institutions</h3>
            <p style={styles.chartSubtitle}>By number of elections</p>
          </div>
          <div style={styles.topInstitutionsList}>
            {topInstitutionsData.slice(0, 8).map((inst, idx) => {
              const maxElections = topInstitutionsData[0]?.electionCount || 1;
              const widthPercent = (inst.electionCount / maxElections) * 100;
              return (
                <div key={idx} style={styles.topInstItem}>
                  <div style={{ ...styles.topInstRank, color: idx === 0 ? '#D23A01' : '#023430' }}>#{idx + 1}</div>
                  <div style={styles.topInstInfo}>
                    <div style={styles.topInstName}>{inst.name}</div>
                    <div style={styles.topInstMeta}>{inst.electionCount} elections • {inst.voteCount?.toLocaleString()} votes</div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${widthPercent}%`, background: idx === 0 ? '#D23A01' : '#023430' }} />
                    </div>
                  </div>
                  <div style={{ ...styles.topInstValue, color: '#D23A01' }}>{inst.electionCount}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><FiUsers size={18} /> User Role Distribution</h3>
            <p style={styles.chartSubtitle}>Platform user breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={roleDistributionData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={true}
              >
                {roleDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: '13px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Hourly Voting Pattern + Weekly Activity */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><FiClock size={18} /> Hourly Voting Pattern</h3>
            <p style={styles.chartSubtitle}>Votes by hour of day</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={hourlyVotesData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#1a1a1a' }} stroke="#9ca3af" interval={2} />
              <YAxis tick={{ fontSize: 13, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="votes" stroke="#D23A01" strokeWidth={3} name="Votes" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={styles.insightText}>
            💡 Peak voting hour: {hourlyVotesData.reduce((max, h) => h.votes > max.votes ? h : max, { votes: 0 }).hour || 'N/A'}
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><FiCalendar size={18} /> Weekly Activity Pattern</h3>
            <p style={styles.chartSubtitle}>Votes by day of week</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={weeklyActivityData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 13, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 13, fill: '#1a1a1a' }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="votes" fill="#023430" name="Votes" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={styles.insightText}>
            💡 Most active day: {weeklyActivityData.reduce((max, d) => d.votes > max.votes ? d : max, { votes: 0 }).day || 'N/A'}
          </div>
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
    padding: 'clamp(20px, 4vw, 40px)', 
    maxWidth: '1200px', 
    margin: '0 auto',
    background: '#f8fafc',
    minHeight: '100vh'
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 'clamp(24px, 5vw, 40px)', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  title: { 
    fontSize: 'clamp(24px, 5vw, 32px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '8px',
    
  },
  subtitle: { 
    fontSize: 'clamp(13px, 2.5vw, 15px)', 
    color: '#07080a',
    fontWeight: '400'
  },
  headerActions: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
    flexWrap: 'wrap' 
  },
  lastUpdated: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontSize: '13px', 
    color: '#1a1a1a', 
    background: '#f1f5f9', 
    padding: '8px 16px', 
    borderRadius: '30px',
    fontWeight: '500'
  },
  refreshBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '8px 20px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '30px', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  kpiGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: 'clamp(16px, 3vw, 24px)', 
    marginBottom: 'clamp(24px, 5vw, 40px)' 
  },
  kpiCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px', 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 3vw, 24px)', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  kpiIcon: { 
    width: 'clamp(60px, 8vw, 70px)', 
    height: 'clamp(60px, 8vw, 70px)', 
    borderRadius: '18px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  kpiValue: { 
    fontSize: 'clamp(26px, 5vw, 34px)', 
    fontWeight: '800', 
    color: '#1a1a1a',
    
  },
  kpiLabel: { 
    fontSize: 'clamp(12px, 2vw, 14px)', 
    color: '#000000',
    fontWeight: '500'
  },
  chartsRow: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
    gap: 'clamp(20px, 4vw, 28px)', 
    marginBottom: 'clamp(24px, 5vw, 32px)' 
  },
  chartCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 3vw, 24px)', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  chartHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px', 
    flexWrap: 'wrap', 
    gap: '12px' 
  },
  chartTitle: { 
    fontSize: 'clamp(16px, 3vw, 18px)', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    margin: 0, 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    
  },
  chartSubtitle: { 
    fontSize: 'clamp(12px, 2vw, 13px)', 
    color: '#000000',
    
  },
  topInstitutionsList: { 
    maxHeight: '340px', 
    overflowY: 'auto' 
  },
  topInstItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '14px', 
    padding: '14px', 
    borderBottom: '1px solid #e5e7eb' 
  },
  topInstRank: { 
    width: '45px', 
    fontWeight: '800', 
    fontSize: '16px',
    
  },
  topInstInfo: { 
    flex: 1 
  },
  topInstName: { 
    fontSize: '15px', 
    fontWeight: '700', 
    color: '#1a1a1a',
    
  },
  topInstMeta: { 
    fontSize: '12px', 
    color: '#000000', 
    marginTop: '3px',
    
  },
  topInstValue: { 
    fontSize: '16px', 
    fontWeight: '800',
    
  },
  progressBar: { 
    height: '6px', 
    background: '#e5e7eb', 
    borderRadius: '3px', 
    overflow: 'hidden', 
    marginTop: '8px' 
  },
  progressFill: { 
    height: '100%', 
    borderRadius: '3px', 
    transition: 'width 0.3s ease' 
  },
  insightText: { 
    marginTop: '20px', 
    padding: '12px 16px', 
    background: '#f8fafc', 
    borderRadius: '12px', 
    fontSize: '13px', 
    color: '#1a1a1a', 
    textAlign: 'center',
    fontWeight: '500',
    borderLeft: `3px solid #D23A01`
  },
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh', 
    gap: '20px' 
  },
  loaderText: {
    fontSize: '16px',
    color: '#1a1a1a',
    fontWeight: '500'
  },
  spinner: { 
    width: '50px', 
    height: '50px', 
    border: '3px solid #e5e7eb', 
    borderTop: `3px solid #D23A01`, 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  }
};

// Responsive media queries via CSS injection
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 1100px) {
    .charts-row {
      grid-template-columns: 1fr !important;
    }
  }
  
  @media (max-width: 768px) {
    .kpi-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
    }
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(210, 58, 1, 0.3);
  }
  
  button:active:not(:disabled) {
    transform: translateY(0);
  }
`;
if (!document.head.querySelector('#system-analytics-styles')) {
  styleSheet.id = 'system-analytics-styles';
  document.head.appendChild(styleSheet);
}

export default SystemAnalytics;