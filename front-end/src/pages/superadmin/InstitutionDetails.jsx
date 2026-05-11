
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiEdit2, FiTrash2, FiUsers, FiCalendar, 
  FiCheckCircle, FiMail, FiPhone, FiMapPin, 
  FiCode, FiClock, FiActivity, FiBarChart2,
  FiFileText, FiShield, FiUserPlus, FiEye,
  FiAlertCircle, FiLoader
} from 'react-icons/fi';
import { institutionService } from '../../services/institutionService';
import axiosPrivate from '../../utils/axiosPrivate';
import { formatLocalDate } from '../../utils/formatLocalDate';

const InstitutionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [institution, setInstitution] = useState(null);
  const [elections, setElections] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('elections');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadInstitutionData();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const loadInstitutionData = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get(`/institution/${id}`);
      const instData = response.data.data;
      
      setInstitution(instData.institution);
      setAdmins(instData.admins || []);
      
      const electionsResponse = await axiosPrivate.get(`/election?institutionId=${id}`);
      const electionsData = electionsResponse.data.data?.elections || [];
      setElections(electionsData);
      
    } catch (error) {
      console.error('Error loading institution data:', error);
      showToast('Failed to load institution data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${institution?.name}"? This will delete all associated elections, users, and data.`)) {
      try {
        await institutionService.deleteInstitution(id);
        navigate('/superAdmin/manage-institutions');
      } catch (error) {
        showToast('Failed to delete institution: ' + error.message, 'error');
      }
    }
  };

  const handleViewElection = (electionId) => {
    navigate(`/superAdmin/elections/${electionId}`);
  };

  const handleManageAdmins = () => {
    navigate(`/superAdmin/institutions/${id}/admins`);
  };

  const getStats = () => {
    const activeElections = elections.filter(e => e.status === 'voting_open' || e.status === 'nomination_open');
    const completedElections = elections.filter(e => e.status === 'completed' || e.status === 'results_published');
    return {
      totalElections: elections.length,
      activeElections: activeElections.length,
      completedElections: completedElections.length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading institution details...</p>
      </div>
    );
  }

  if (!institution) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle size={56} color="#dc2626" />
        <h2 style={styles.errorTitle}>Institution not found</h2>
        <button onClick={() => navigate('/superAdmin/manage-institutions')} style={styles.backBtn}>
          <FiArrowLeft size={16} /> Back to Institutions
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Toast Message */}
      {toastMessage && (
        <div style={{
          ...styles.toast,
          backgroundColor: toastMessage.type === 'error' ? '#dc2626' : '#D23A01'
        }}>
          <span style={styles.toastText}>{toastMessage.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FiArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Institution Info Card */}
      <div style={styles.instCard}>
        <div style={styles.instHeader}>
          <div style={styles.instIcon}>
            <FiUsers size={56} color="#D23A01" />
          </div>
          <div style={styles.instInfo}>
            <h1 style={styles.instName}>{institution.name}</h1>
            <div style={styles.instBadges}>
              <span style={{ 
                ...styles.badge, 
                backgroundColor: institution.status === 'active' ? '#dcfce7' : '#fee2e2', 
                color: institution.status === 'active' ? '#023430' : '#991b1b' 
              }}>
                {institution.status?.toUpperCase()}
              </span>
              <span style={{ ...styles.badge, backgroundColor: '#FEF3F0', color: '#D23A01' }}>
                Code: {institution.code}
              </span>
            </div>
          </div>
        </div>
        
        <div style={styles.instDetails}>
          <div style={styles.detailRow}>
            <FiMail size={18} style={styles.detailIcon} />
            <span style={styles.detailText}>{institution.email}</span>
          </div>
          <div style={styles.detailRow}>
            <FiPhone size={18} style={styles.detailIcon} />
            <span style={styles.detailText}>{institution.phone}</span>
          </div>
          <div style={styles.detailRow}>
            <FiMapPin size={18} style={styles.detailIcon} />
            <span style={styles.detailText}>{institution.address}</span>
          </div>
          <div style={styles.detailRow}>
            <FiClock size={18} style={styles.detailIcon} />
            <span style={styles.detailText}>Created: {formatLocalDate(institution.createdAt, false)}</span>
          </div>
        </div>
        
        {institution.about && (
          <div style={styles.aboutSection}>
            <h4 style={styles.aboutTitle}>About</h4>
            <p style={styles.aboutText}>{institution.about}</p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <FiBarChart2 size={28} color="#D23A01" />
          <div style={styles.statValue}>{stats.totalElections}</div>
          <div style={styles.statLabel}>Total Elections</div>
        </div>
        <div style={styles.statCard}>
          <FiActivity size={28} color="#f59e0b" />
          <div style={styles.statValue}>{stats.activeElections}</div>
          <div style={styles.statLabel}>Active Elections</div>
        </div>
        <div style={styles.statCard}>
          <FiCheckCircle size={28} color="#023430" />
          <div style={styles.statValue}>{stats.completedElections}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <FiShield size={28} color="#D23A01" />
          <div style={styles.statValue}>{admins.length}</div>
          <div style={styles.statLabel}>Administrators</div>
        </div>
      </div>

      {/* Tabs Section */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabsHeader}>
          <button 
            style={activeTab === 'elections' ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab('elections')}
          >
            <FiCalendar size={16} /> Elections ({stats.totalElections})
          </button>
          <button 
            style={activeTab === 'admins' ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab('admins')}
          >
            <FiShield size={16} /> Admins ({admins.length})
          </button>
        </div>
        
        {/* Elections Tab */}
        {activeTab === 'elections' && (
          <div style={styles.tabContent}>
            {elections.length === 0 ? (
              <div style={styles.emptyState}>
                <FiFileText size={56} color="#cbd5e1" />
                <p style={styles.emptyText}>No elections found for this institution</p>
              </div>
            ) : (
              <div style={styles.electionsTableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>Election Title</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Start Date</th>
                      <th style={styles.th}>End Date</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elections.map(election => (
                      <tr key={election._id} style={styles.tableRow}>
                        <td style={styles.td}>
                          <span style={styles.electionTitle}>{election.title}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: 
                              election.status === 'voting_open' ? '#FEF3F0' :
                              election.status === 'completed' ? '#fee2e2' : '#f1f5f9',
                            color:
                              election.status === 'voting_open' ? '#D23A01' :
                              election.status === 'completed' ? '#991b1b' : '#475569'
                          }}>
                            {election.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {election.timeline?.votingStart ? formatLocalDate(election.timeline.votingStart, true) : 'N/A'}
                        </td>
                        <td style={styles.td}>
                          {election.timeline?.votingEnd ? formatLocalDate(election.timeline.votingEnd, true) : 'N/A'}
                        </td>
                        <td style={styles.td}>
                          <button style={styles.viewBtn} onClick={() => handleViewElection(election._id)}>
                            <FiEye size={16} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Admins Tab - Card View Only, No Operations */}
        {activeTab === 'admins' && (
          <div style={styles.tabContent}>
            <div style={styles.adminsHeader}>
              <h3 style={styles.adminsTitle}>Institution Administrators</h3>
              <button style={styles.manageAdminsBtn} onClick={handleManageAdmins}>
                <FiUserPlus size={16} /> Manage Admins
              </button>
            </div>
            
            {admins.length === 0 ? (
              <div style={styles.emptyState}>
                <FiShield size={56} color="#cbd5e1" />
                <p style={styles.emptyText}>No administrators assigned to this institution</p>
                <button style={styles.addFirstAdminBtn} onClick={handleManageAdmins}>
                  <FiUserPlus size={16} /> Add First Admin
                </button>
              </div>
            ) : (
              <div style={styles.adminsGrid}>
                {admins.map((admin) => (
                  <div key={admin._id} style={styles.adminCard}>
                    <div style={styles.adminAvatar}>
                      <div style={styles.adminAvatarPlaceholder}>
                        {admin.firstName?.[0]}{admin.lastName?.[0]}
                      </div>
                    </div>
                    <div style={styles.adminInfo}>
                      <div style={styles.adminName}>
                        {admin.firstName} {admin.lastName}
                      </div>
                      <div style={styles.adminDetail}>
                        <FiMail size={14} /> {admin.email}
                      </div>
                      {admin.phone && (
                        <div style={styles.adminDetail}>
                          <FiPhone size={14} /> {admin.phone}
                        </div>
                      )}
                      <div style={styles.adminDetail}>
                        <FiClock size={14} /> Joined: {formatLocalDate(admin.createdAt, false)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 16px !important;
          }
          .inst-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .admins-grid {
            grid-template-columns: 1fr !important;
          }
          .tabs-header {
            flex-direction: column;
          }
          .tab-active, .tab-inactive {
            width: 100%;
            justify-content: center;
          }
          .admin-card {
            flex-direction: column;
            text-align: center;
          }
          .admin-detail {
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .inst-details {
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
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
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
    color: '#000000',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif"
  },
  spinner: {
    width: '56px',
    height: '56px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #D23A01',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px',
    color: '#4b5563'
  },
  errorTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#000000',
    marginTop: '16px',
    marginBottom: '20px',
    fontFamily: "'Poppins', sans-serif"
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    color: '#000000',
    marginTop: '16px',
    fontFamily: "'Poppins', sans-serif"
  },
  toast: {
    position: 'fixed',
    top: 'clamp(70px, 10vh, 90px)',
    right: '20px',
    padding: '14px 24px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    fontWeight: '500',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontFamily: "'Poppins', sans-serif"
  },
  toastText: {
    fontSize: '14px',
    fontWeight: '500'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    color: '#000000'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif"
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif"
  },
  instCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: 'clamp(24px, 5vw, 32px)',
    marginBottom: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  instHeader: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  instIcon: {
    width: '100px',
    height: '100px',
    backgroundColor: '#FEF3F0',
    borderRadius: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  instInfo: {
    flex: 1
  },
  instName: {
    fontSize: 'clamp(26px, 5vw, 32px)',
    fontWeight: '800',
    color: '#000000',
    marginBottom: '16px',
    fontFamily: "'Poppins', sans-serif"
  },
  instBadges: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap'
  },
  badge: {
    padding: '8px 16px',
    borderRadius: '24px',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif"
  },
  instDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    fontSize: '15px',
    color: '#000000'
  },
  detailText: {
    fontSize: '15px',
    color: '#000000',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif"
  },
  detailIcon: {
    color: '#9ca3af'
  },
  aboutSection: {
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  aboutTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#000000',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif"
  },
  aboutText: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.6',
    fontFamily: "'Poppins', sans-serif"
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '28px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  statValue: {
    fontSize: 'clamp(30px, 6vw, 36px)',
    fontWeight: '800',
    color: '#000000',
    margin: '10px 0 6px',
    fontFamily: "'Poppins', sans-serif"
  },
  statLabel: {
    fontSize: '14px',
    color: '#4b5563',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif"
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  tabsHeader: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f8fafc',
    flexWrap: 'wrap'
  },
  tabActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    backgroundColor: 'white',
    border: 'none',
    borderBottom: '2px solid #D23A01',
    color: '#D23A01',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '15px',
    fontFamily: "'Poppins', sans-serif"
  },
  tabInactive: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    backgroundColor: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif"
  },
  tabContent: {
    padding: 'clamp(20px, 4vw, 28px)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#9ca3af',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif"
  },
  electionsTableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px'
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e5e7eb'
  },
  th: {
    textAlign: 'left',
    padding: '16px 16px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#000000',
    fontFamily: "'Poppins', sans-serif"
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#000000',
    fontFamily: "'Poppins', sans-serif"
  },
  electionTitle: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#000000'
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    display: 'inline-block'
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#FEF3F0',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#D23A01',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif"
  },
  adminsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  adminsTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#000000',
    margin: 0,
    fontFamily: "'Poppins', sans-serif"
  },
  manageAdminsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif"
  },
  addFirstAdminBtn: {
    marginTop: '20px',
    padding: '12px 28px',
    backgroundColor: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: "'Poppins', sans-serif"
  },
  adminsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px'
  },
  adminCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s'
  },
  adminAvatar: {
    flexShrink: 0
  },
  adminAvatarPlaceholder: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: '#D23A01',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '800',
    fontFamily: "'Poppins', sans-serif"
  },
  adminInfo: {
    flex: 1
  },
  adminName: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#000000',
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  adminDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#000000',
    marginBottom: '6px',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif"
  }
};

export default InstitutionDetails;