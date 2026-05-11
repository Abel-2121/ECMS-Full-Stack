// pages/superadmin/InstitutionDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiArrowLeft, FiEdit2, FiTrash2, FiUsers, FiCalendar, 
  FiCheckCircle, FiXCircle, FiMail, FiPhone, FiMapPin, 
  FiCode, FiClock, FiUser, FiActivity, FiBarChart2,
  FiAward, FiCheckSquare, FiFileText  
} from 'react-icons/fi';
import { institutionService } from '../../services/institutionService';
import { fetchElectionsByInstitution } from '../../Js/election-slice';

const InstitutionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const{user}=useSelector((state)=>state.auth)
  const [institution, setInstitution] = useState(null);
  const [elections, setElections] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    completedElections: 0,
    totalUsers: 0,
    totalVoters: 0,
    totalCandidates: 0,
    totalVotesCast: 0
  });

  useEffect(() => {
    loadInstitutionData();
  }, [id]);

  const loadInstitutionData = async () => {
    setLoading(true);
    try {
      // Fetch institution details
      const inst = await institutionService.getInstitutionById(id);
      setInstitution(inst);
      
      // Fetch elections for this institution
      const electionsData = await fetchElectionsByInstitution(id);
      setElections(electionsData);
      
      // Calculate statistics
      const activeElections = electionsData.filter(e => e.status === 'voting_open' || e.status === 'nomination_open');
      const completedElections = electionsData.filter(e => e.status === 'completed' || e.status === 'results_published');
      
      setStats({
        totalElections: electionsData.length,
        activeElections: activeElections.length,
        completedElections: completedElections.length,
        totalUsers: inst.totalUsers || 0,
        totalVoters: inst.totalVoters || 0,
        totalCandidates: inst.totalCandidates || 0,
        totalVotesCast: inst.totalVotesCast || 0
      });
      
    } catch (error) {
      console.error('Error loading institution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/superadmin/institutions/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${institution?.name}"? This will delete all associated elections, users, and data.`)) {
      try {
        await institutionService.deleteInstitution(id);
        navigate('/superadmin/manage-institutions');
      } catch (error) {
        alert('Failed to delete institution: ' + error.message);
      }
    }
  };

  const handleViewElection = (electionId) => {
    navigate(`/superadmin/elections/${electionId}`);
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p>Loading institution details...</p>
      </div>
    );
  }

  if (!institution) {
    return (
      <div style={styles.errorContainer}>
        <h2>Institution not found</h2>
        <button onClick={() => navigate('/superadmin/manage-institutions')} style={styles.backBtn}>
          ← Back to Institutions
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/superAdmin/manage-institutions')} style={styles.backButton}>
          <FiArrowLeft size={20} /> Back
        </button>
        <div style={styles.headerActions}>
          <button style={styles.editButton} onClick={handleEdit}>
            <FiEdit2 size={16} /> Edit Institution
          </button>
          <button style={styles.deleteButton} onClick={handleDelete}>
            <FiTrash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Institution Info Card */}
      <div style={styles.instCard}>
        <div style={styles.instHeader}>
          <div style={styles.instIcon}>
            <FiUsers size={48} color="#2563EB" />
          </div>
          <div style={styles.instInfo}>
            <h1 style={styles.instName}>{institution.name}</h1>
            <div style={styles.instBadges}>
              <p style={{ ...styles.badge, background: institution.status === 'active' ? '#dcfce7' : '#fee2e2', color: institution.status === 'active' ? '#166534' : '#991b1b' }}>
                {institution.status?.toUpperCase()}
              </p>
              <p style={{ ...styles.badge, background: '#e0e7ff', color: '#4338ca' }}>
                Code: {institution.code}
              </p>
            </div>
          </div>
        </div>
        
        <div style={styles.instDetails}>
          <div style={styles.detailRow}>
            <FiMail size={16} style={styles.detailIcon} />
            <p>{institution.email}</p>
          </div>
          <div style={styles.detailRow}>
            <FiPhone size={16} style={styles.detailIcon} />
            <p>{institution.phone}</p>
          </div>
          <div style={styles.detailRow}>
            <FiMapPin size={16} style={styles.detailIcon} />
            <p>{institution.address}</p>
          </div>
          <div style={styles.detailRow}>
            <FiClock size={16} style={styles.detailIcon} />
            <p>Created: {new Date(institution.createdAt).toLocaleDateString()}</p>
          </div>
          <div style={styles.detailRow}>
            <FiUser size={16} style={styles.detailIcon} />
            <p>Requested by: {institution.requestedBy?.firstName} {institution.requestedBy?.lastName} ({institution.requestedBy?.email})</p>
          </div>
        </div>
        
        {institution.about && (
          <div style={styles.aboutSection}>
            <h4>About</h4>
            <p>{institution.about}</p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <FiBarChart2 size={24} color="#2563EB" />
          <div style={styles.statValue}>{stats.totalElections}</div>
          <div style={styles.statLabel}>Total Elections</div>
        </div>
        <div style={styles.statCard}>
          <FiActivity size={24} color="#f59e0b" />
          <div style={styles.statValue}>{stats.activeElections}</div>
          <div style={styles.statLabel}>Active Elections</div>
        </div>
        <div style={styles.statCard}>
          <FiCheckCircle size={24} color="#10b981" />
          <div style={styles.statValue}>{stats.completedElections}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <FiUsers size={24} color="#8b5cf6" />
          <div style={styles.statValue}>{stats.totalUsers}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div style={styles.statCard}>
          <FiAward size={24} color="#ec4899" />
          <div style={styles.statValue}>{stats.totalVoters}</div>
          <div style={styles.statLabel}>Registered Voters</div>
        </div>
        <div style={styles.statCard}>
          <FiVote size={24} color="#06b6d4" />
          <div style={styles.statValue}>{stats.totalVotesCast}</div>
          <div style={styles.statLabel}>Votes Cast</div>
        </div>
      </div>

      {/* Tabs Section */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabsHeader}>
          <button style={styles.tabActive}>Elections</button>
          <button style={styles.tabInactive}>Users & Admins</button>
          <button style={styles.tabInactive}>Activity Log</button>
        </div>
        
        {/* Elections Tab */}
        <div style={styles.tabContent}>
          {elections.length === 0 ? (
            <div style={styles.emptyState}>
              <FiFileText size={48} color="#cbd5e1" />
              <p>No elections found for this institution</p>

              {user?.role==="electionAdmin" &&
              <button style={styles.createElectionBtn} onClick={() => navigate(`/electionAdmin/create-election?institution=${id}`)}>
              + Create First Election
            </button>
              }
              
            </div>
          ) : (
            <div style={styles.electionsTable}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Election Title</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Votes Cast</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {elections.map(election => (
                    <tr key={election._id}>
                      <td style={styles.electionTitle}>{election.title}</td>
                      <td>
                        <p style={{
                          ...styles.statusBadge,
                          background: 
                            election.status === 'voting_open' ? '#dcfce7' :
                            election.status === 'draft' ? '#f1f5f9' :
                            election.status === 'completed' ? '#fee2e2' : '#fef3c7',
                          color:
                            election.status === 'voting_open' ? '#166534' :
                            election.status === 'draft' ? '#475569' :
                            election.status === 'completed' ? '#991b1b' : '#92400e'
                        }}>
                          {election.status?.replace('_', ' ').toUpperCase()}
                        </p>
                      </td>
                      <td>{new Date(election.timeline?.votingStart).toLocaleDateString()}</td>
                      <td>{new Date(election.timeline?.votingEnd).toLocaleDateString()}</td>
                      <td>{election.statistics?.totalVotesCast || 0}</td>
                      <td>
                        <button style={styles.viewElectionBtn} onClick={() => handleViewElection(election._id)}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
    background: '#f8fafc'
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #2563EB',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px',
    color: '#64748b'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    background: '#2563EB',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  instCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  instHeader: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px'
  },
  instIcon: {
    width: '80px',
    height: '80px',
    background: '#eff6ff',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  instInfo: {
    flex: 1
  },
  instName: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '12px'
  },
  instBadges: {
    display: 'flex',
    gap: '12px'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  instDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '12px',
    marginBottom: '20px'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#475569'
  },
  detailIcon: {
    color: '#94a3b8'
  },
  aboutSection: {
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '8px 0 4px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b'
  },
  tabsContainer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  tabsHeader: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc'
  },
  tabActive: {
    padding: '14px 24px',
    background: 'white',
    border: 'none',
    borderBottom: '2px solid #2563EB',
    color: '#2563EB',
    fontWeight: '600',
    cursor: 'pointer'
  },
  tabInactive: {
    padding: '14px 24px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer'
  },
  tabContent: {
    padding: '24px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#94a3b8'
  },
  electionsTable: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  electionTitle: {
    fontWeight: '500',
    color: '#1e293b'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block'
  },
  viewElectionBtn: {
    padding: '4px 12px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  createElectionBtn: {
    marginTop: '16px',
    padding: '10px 24px',
    background: '#2563EB',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default InstitutionDetails;