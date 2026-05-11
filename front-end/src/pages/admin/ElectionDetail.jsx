// pages/electionAdmin/ElectionDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiArrowLeft, FiEdit2, FiTrash2, FiUsers, FiCalendar, 
  FiCheckCircle, FiAward, FiBarChart2, FiEye, FiClock,
  FiCalendar as FiCalendarIcon
} from 'react-icons/fi';
import { BsTrophy, BsPeopleFill, BsBarChartSteps, BsFileText } from 'react-icons/bs';
import { MdOutlinePeople, MdOutlineEdit } from 'react-icons/md';
import { GiVote } from 'react-icons/gi';

import { formatLocalDate } from '../../utils/formatLocalDate';
import { fetchElectionById, deleteElection } from '../../Js/election-slice';
import axiosPrivate from '../../utils/axiosPrivate';
import CandidateCard from '../../components/candidate/CandidateCard';
import CandidateModal from '../../components/candidate/CandidateModal';
import PositionCard from '../../components/common/PositionCard';
import PositionModal from '../../components/common/PositionModal';
import VoterTable from './VoterTable';

// Helper function to check period status (no emojis)
const checkPeriodStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    return <span style={styles.statusUpcoming}>Upcoming</span>;
  } else if (now > end) {
    return <span style={styles.statusEnded}>Ended</span>;
  } else {
    return <span style={styles.statusActive}>Active</span>;
  }
};

const checkPublicationStatus = (publicationDate, electionStatus) => {
  const now = new Date();
  const pubDate = new Date(publicationDate);
  
  if (electionStatus === 'results_published') {
    return <span style={styles.statusPublished}>Published</span>;
  } else if (now > pubDate) {
    return <span style={styles.statusReady}>Ready to Publish</span>;
  } else {
    return <span style={styles.statusUpcoming}>Upcoming</span>;
  }
};

const ElectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentElection, loading } = useSelector(state => state.election);
  const { user } = useSelector((state) => state.auth);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('candidates');
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [votersLoading, setVotersLoading] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [groupedCandidates, setGroupedCandidates] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchElectionById(id));
    loadCandidates();
    loadVoters();
  }, [dispatch, id]);

  const loadCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const response = await axiosPrivate.get(`/candidate/election/${id}/candidates`);
      const backendData = response.data?.data;
      
      if (backendData && backendData.positions && Array.isArray(backendData.positions)) {
        const positionsData = backendData.positions;
        const allCandidates = [];
        const groupedByPosition = {};
        
        positionsData.forEach(position => {
          if (position.candidates && Array.isArray(position.candidates)) {
            groupedByPosition[position.positionId] = {
              positionName: position.positionName,
              electionType: position.electionType,
              totalSeats: position.totalSeats,
              candidates: position.candidates
            };
            
            position.candidates.forEach(candidate => {
              allCandidates.push({
                ...candidate,
                positionName: position.positionName,
                positionId: position.positionId,
                electionType: position.electionType
              });
            });
          }
        });
        
        setGroupedCandidates(groupedByPosition);
        setCandidates(allCandidates);
      } else {
        if (Array.isArray(backendData)) {
          setCandidates(backendData);
        } else {
          setCandidates([]);
        }
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const loadVoters = async () => {
    setVotersLoading(true);
    try {
      const response = await axiosPrivate.get(`/voter-eligibility/election/${id}/voters?limit=100`);
      setVoters(response.data.data.voters || []);
    } catch (error) {
      console.error('Error loading voters:', error);
    } finally {
      setVotersLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/${user?.role}/elections/${id}/edit`);
  };

  const handleDelete = async () => {
    await dispatch(deleteElection(id));
    setShowDeleteModal(false);
    navigate('/electionAdmin/elections');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return { bg: '#f1f5f9', color: '#475569', text: 'DRAFT' };
      case 'registration_open': return { bg: '#FEF3F0', color: '#D23A01', text: 'REGISTRATION OPEN' };
      case 'registration_closed': return { bg: '#f1f5f9', color: '#6b7280', text: 'REGISTRATION CLOSED' };
      case 'nomination_open': return { bg: '#E8F5E9', color: '#023430', text: 'NOMINATION OPEN' };
      case 'nomination_closed': return { bg: '#f1f5f9', color: '#6b7280', text: 'NOMINATION CLOSED' };
      case 'voting_open': return { bg: '#FEF3F0', color: '#D23A01', text: 'VOTING OPEN' };
      case 'voting_closed': return { bg: '#f1f5f9', color: '#6b7280', text: 'VOTING CLOSED' };
      case 'results_published': return { bg: '#E8F5E9', color: '#023430', text: 'RESULTS PUBLISHED' };
      case 'completed': return { bg: '#e5e7eb', color: '#4b5563', text: 'COMPLETED' };
      default: return { bg: '#f1f5f9', color: '#6b7280', text: status?.toUpperCase() || 'UNKNOWN' };
    }
  };

  const openPositionDetails = (position) => {
    setSelectedPosition(position);
    setShowPositionModal(true);
  };
  
  const handleCardClick = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };
  
  if (loading) return <div style={styles.loader}>Loading election details...</div>;
  if (!currentElection) return <div style={styles.loader}>Election not found</div>;

  const statusStyle = getStatusColor(currentElection.status);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} /> Back
        </button>
        {user.role === 'electionAdmin' &&     
          <div style={styles.headerActions}>
            <button style={styles.editBtn} onClick={handleEdit}>
              <FiEdit2 size={16} /> Edit Election
            </button>
          </div>
        }
      </div>

      {/* Election Info Card */}
      <div style={styles.mainCard}>
        <div style={styles.titleSection}>
          <div>
            <h1 style={styles.title}>{currentElection.title}</h1>
            <div style={styles.idBadge}>
              <p style={styles.idLabel}>Election ID:</p>
              <p style={styles.idValue}>{currentElection.electionId || currentElection._id?.slice(-8)}</p>
            </div>
          </div>
          <p style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.color }}>
            {statusStyle.text}
          </p>
        </div>
        <p style={styles.description}>{currentElection.description || 'No description provided.'}</p>
        
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <FiCalendar size={20} style={{ color: '#D23A01' }} />
            <div>
              <div style={styles.statLabel}>Created</div>
              <div style={styles.statValue}>{formatLocalDate(currentElection.createdAt, true)}</div>
            </div>
          </div>
          <div style={styles.statItem}>
            <FiUsers size={20} style={{ color: '#023430' }} />
            <div>
              <div style={styles.statLabel}>Total Voters</div>
              <div style={styles.statValue}>{currentElection.statistics?.totalEligibleVoters || 0}</div>
            </div>
          </div>
          <div style={styles.statItem}>
            <FiCheckCircle size={20} style={{ color: '#D23A01' }} />
            <div>
              <div style={styles.statLabel}>Votes Cast</div>
              <div style={styles.statValue}>{currentElection.statistics?.totalVotesCast || 0}</div>
            </div>
          </div>
          <div style={styles.statItem}>
            <FiAward size={20} style={{ color: '#023430' }} />
            <div>
              <div style={styles.statLabel}>Candidates</div>
              <div style={styles.statValue}>{candidates.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Card - TABLE FORMAT */}
      <div style={styles.timelineCard}>
        <h3 style={styles.sectionTitle}>
          <FiClock size={18} style={{ marginRight: '8px', color: '#D23A01' }} />
          Election Timeline
        </h3>
        
        {/* Timeline Table */}
        <div style={styles.timelineTableWrapper}>
          <table style={styles.timelineTable}>
            <thead>
              <tr style={styles.timelineHeaderRow}>
                <th style={styles.timelineTh}>#</th>
                <th style={styles.timelineTh}>Event</th>
                <th style={styles.timelineTh}>Start Date & Time</th>
                <th style={styles.timelineTh}>End Date & Time</th>
                <th style={styles.timelineTh}>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Registration Period */}
              <tr style={styles.timelineTr}>
                <td style={styles.timelineTd}>01</td>
                <td style={styles.timelineTd}>
                  <div style={styles.timelineEventCell}>
                    <BsFileText size={14} style={{ color: '#D23A01' }} />
                    <span>Registration Period</span>
                  </div>
                </td>
                <td style={styles.timelineTd}>
                  {formatLocalDate(currentElection.timeline?.registrationStart, true)}
                </td>
                <td style={styles.timelineTd}>
                  {formatLocalDate(currentElection.timeline?.registrationEnd, true)}
                </td>
                <td style={styles.timelineTd}>
                  {checkPeriodStatus(currentElection.timeline?.registrationStart, currentElection.timeline?.registrationEnd)}
                </td>
              </tr>

              {/* Nomination Period */}
              <tr style={styles.timelineTr}>
                <td style={styles.timelineTd}>02</td>
                <td style={styles.timelineTd}>
                  <div style={styles.timelineEventCell}>
                    <MdOutlineEdit size={14} style={{ color: '#023430' }} />
                    <span>Nomination Period</span>
                  </div>
                </td>
                <td style={styles.timelineTd}>
                  {formatLocalDate(currentElection.timeline?.nominationStart, true)}
                </td>
                <td style={styles.timelineTd}>
                  {formatLocalDate(currentElection.timeline?.nominationEnd, true)}
                </td>
                <td style={styles.timelineTd}>
                  {checkPeriodStatus(currentElection.timeline?.nominationStart, currentElection.timeline?.nominationEnd)}
                </td>
              </tr>

              {/* Voting Period */}
              <tr style={styles.timelineTr}>
                <td style={styles.timelineTd}>03</td>
                <td style={styles.timelineTd}>
                  <div style={styles.timelineEventCell}>
                    <GiVote size={14} style={{ color: '#D23A01' }} />
                    <span>Voting Period</span>
                  </div>
                </td>
                <td style={styles.timelineTd}>
                  {formatLocalDate(currentElection.timeline?.votingStart, true)}
                </td>
                <td style={styles.timelineTd}>
                  {formatLocalDate(currentElection.timeline?.votingEnd, true)}
                </td>
                <td style={styles.timelineTd}>
                  {checkPeriodStatus(currentElection.timeline?.votingStart, currentElection.timeline?.votingEnd)}
                </td>
              </tr>

              {/* Results Publication */}
              <tr style={{ ...styles.timelineTr, ...styles.timelineHighlightRow }}>
                <td style={styles.timelineTd}>04</td>
                <td style={styles.timelineTd}>
                  <div style={styles.timelineEventCell}>
                    <BsBarChartSteps size={14} style={{ color: '#D23A01' }} />
                    <span style={{ fontWeight: '700', color: '#D23A01' }}>Results Publication</span>
                  </div>
                </td>
                <td style={styles.timelineTd} colSpan="2">
                  {formatLocalDate(currentElection.timeline?.resultPublicationDate, true)}
                </td>
                <td style={styles.timelineTd}>
                  {checkPublicationStatus(currentElection.timeline?.resultPublicationDate, currentElection.status)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Positions Card */}
{/* Positions Card */}
          <div style={styles.positionsCard}>
            <h3 style={styles.sectionTitle}>Positions ({currentElection.positions?.length || 0})</h3>
            <div style={styles.positionsGrid}>
              {currentElection.positions?.map((pos, idx) => {
                // Get candidates for this position
                const positionCandidates = groupedCandidates[pos.positionId]?.candidates || 
                                          candidates.filter(c => c.positionId === pos.positionId);
                
                // Calculate total votes for this position
                const totalVotes = positionCandidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
                
                // Combine position metadata with candidates
                const positionWithCandidates = {
                  ...pos,
                  candidates: positionCandidates,
                  totalVotes: totalVotes
                };
                
                return (
                  <PositionCard 
                    key={idx}
                    position={positionWithCandidates}
                    onViewDetails={() => openPositionDetails(positionWithCandidates)}  
                  />
                );
              })}
            </div>
          </div>

      <PositionModal 
        position={selectedPosition}
        isOpen={showPositionModal}
        onClose={() => setShowPositionModal(false)}
      />

      {user.role === 'electionAdmin' && 
        <div style={styles.tabsContainer}>
          <button 
            style={{ ...styles.tab, ...(activeTab === 'candidates' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('candidates')}
          >
            <FiAward size={16} /> Candidates ({candidates.length})
          </button>
          <button 
            style={{ ...styles.tab, ...(activeTab === 'voters' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('voters')}
          >
            <FiUsers size={16} /> Voters ({voters.length})
          </button>
        </div>
      }

      {/* Tab Content - Candidates */}
      {user.role === 'electionAdmin' && activeTab === 'candidates' && (
        <div style={styles.tabContent}>
          {candidatesLoading ? (
            <div style={styles.loaderSmall}>Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div style={styles.emptyState}>
              <MdOutlinePeople size={48} color="#cbd5e1" />
              <p style={{ fontSize: '16px', color: '#4a5568' }}>No candidates approved yet</p>
            </div>
          ) : (
            <div style={styles.candidateContainer}>
              <div style={styles.candidateHeader}>
                <h1 style={styles.candidateTitle}>
                  <GiVote size={24} style={{ color: '#D23A01' }} /> Candidates
                </h1>
                <p style={styles.candidateSubtitle}>Browse all candidates and their campaign information</p>
              </div>

              <div style={styles.candidateGrid}>
                {candidates.map((candidate) => (
                  <CandidateCard 
                    key={candidate._id} 
                    candidate={candidate} 
                    onClick={handleCardClick}
                  />
                ))}
              </div>

              <CandidateModal
                candidate={selectedCandidate}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab Content - Voters */}
      {user.role === 'electionAdmin' && activeTab === 'voters' && (
        <div style={styles.tabContent}>
          <VoterTable voters={voters} loading={votersLoading} />
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Delete Election</h3>
            <p style={{ fontSize: '15px', marginBottom: '12px' }}>Are you sure you want to delete <strong style={{ color: '#D23A01' }}>"{currentElection.title}"</strong>?</p>
            <p style={styles.modalWarning}>⚠️ This action cannot be undone. All election data will be permanently removed.</p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button style={styles.confirmDeleteBtn} onClick={handleDelete}>Delete Election</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { 
    padding: 'clamp(20px, 4vw, 28px)', 
    maxWidth: '1200px', 
    margin: '0 auto', 
    marginTop: 'clamp(60px, 8vh, 80px)',
    minHeight: '100vh', 
    background: '#f8fafc' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: 'clamp(20px, 4vw, 24px)', 
    flexWrap: 'wrap', 
    gap: '14px' 
  },
  backBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 18px', 
    background: 'white', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  headerActions: { 
    display: 'flex', 
    gap: '12px' 
  },
  editBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 20px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: '600',
    fontSize: '15px',
    fontFamily: "'Poppins', sans-serif"
  },
  deleteBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 20px', 
    background: '#fee2e2', 
    color: '#dc2626', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: '600',
    fontSize: '15px',
    fontFamily: "'Poppins', sans-serif"
  },
  
  mainCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 28px)', 
    marginBottom: '24px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  titleSection: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: '16px', 
    flexWrap: 'wrap', 
    gap: '12px' 
  },
  title: { 
    fontSize: 'clamp(24px, 5vw, 28px)', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    margin: '0 0 10px 0',
    fontFamily: "'Poppins', sans-serif"
  },
  idBadge: { 
    display: 'flex', 
    gap: '10px', 
    alignItems: 'center' 
  },
  idLabel: { 
    fontSize: '13px', 
    fontWeight: '500',
    color: '#6b7280' 
  },
  idValue: { 
    fontSize: '13px', 
    fontFamily: 'monospace', 
    background: '#f1f5f9', 
    padding: '4px 8px', 
    borderRadius: '6px',
    fontWeight: '500'
  },
  statusBadge: { 
    padding: '6px 16px', 
    borderRadius: '24px', 
    fontSize: '13px', 
    fontWeight: '700' 
  },
  description: { 
    color: '#4a5568', 
    marginBottom: '20px', 
    lineHeight: '1.6',
    fontSize: '16px'
  },
  
  statsRow: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
    gap: '20px', 
    paddingTop: '20px', 
    borderTop: '1px solid #e5e7eb' 
  },
  statItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px' 
  },
  statLabel: { 
    fontSize: '13px', 
    fontWeight: '500',
    color: '#6b7280' 
  },
  statValue: { 
    fontSize: '18px', 
    fontWeight: '700', 
    color: '#1a1a1a' 
  },
  
  timelineCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 28px)', 
    marginBottom: '24px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  
  // Timeline Table Styles
  timelineTableWrapper: {
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  timelineTable: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px'
  },
  timelineHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e5e7eb'
  },
  timelineTh: {
    textAlign: 'left',
    padding: '14px 16px',
    fontWeight: '700',
    fontSize: '13px',
    color: '#1a1a1a',
    borderBottom: '1px solid #e5e7eb'
  },
  timelineTr: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background 0.2s'
  },
  timelineHighlightRow: {
    backgroundColor: '#FEF3F0'
  },
  timelineTd: {
    padding: '14px 16px',
    verticalAlign: 'middle',
    fontSize: '14px',
    color: '#1a1a1a'
  },
  timelineEventCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  
  // Status styles for timeline
  statusUpcoming: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600'
  },
  statusActive: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600'
  },
  statusEnded: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600'
  },
  statusPublished: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600'
  },
  statusReady: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600'
  },
  
  sectionTitle: { 
    fontSize: 'clamp(18px, 4vw, 20px)', 
    fontWeight: '700', 
    marginBottom: '20px', 
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif",
    display: 'flex',
    alignItems: 'center'
  },
  
  positionsCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 28px)', 
    marginBottom: '24px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  positionsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
    gap: '20px' 
  },
  
  tabsContainer: { 
    display: 'flex', 
    gap: '8px', 
    background: 'white', 
    borderRadius: '14px', 
    padding: '6px', 
    marginBottom: '24px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  tab: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 24px', 
    background: 'none', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '15px', 
    fontWeight: '600', 
    color: '#4a5568',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  },
  tabActive: { 
    background: '#D23A01', 
    color: 'white' 
  },
  
  tabContent: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(24px, 4vw, 32px)', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: 'rgba(0,0,0,0.5)', 
    zIndex: 1000, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: '20px'
  },
  modal: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: '28px', 
    width: '90%', 
    maxWidth: '450px' 
  },
  modalTitle: { 
    fontSize: '22px', 
    fontWeight: '700', 
    marginBottom: '16px',
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  modalWarning: { 
    fontSize: '14px', 
    color: '#dc2626', 
    background: '#fef2f2', 
    padding: '12px', 
    borderRadius: '10px', 
    marginTop: '12px' 
  },
  modalActions: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '12px', 
    marginTop: '20px' 
  },
  cancelBtn: { 
    padding: '10px 20px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif"
  },
  confirmDeleteBtn: { 
    padding: '10px 20px', 
    background: '#dc2626', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif"
  },
  
  loader: { 
    textAlign: 'center', 
    padding: '60px', 
    color: '#4a5568',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '16px'
  },
  loaderSmall: { 
    textAlign: 'center', 
    padding: '40px', 
    color: '#4a5568',
    fontSize: '15px'
  },
  emptyState: { 
    textAlign: 'center', 
    padding: '60px', 
    color: '#9ca3af',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },

  candidateContainer: {
    maxWidth: '100%',
    margin: '0 auto'
  },
  candidateHeader: {
    marginBottom: '28px'
  },
  candidateTitle: {
    fontSize: 'clamp(22px, 4vw, 24px)',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  candidateSubtitle: {
    color: '#4a5568',
    fontSize: '15px'
  },
  candidateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px'
  }
};

export default ElectionDetail;