import React, { useState } from 'react';
import { FiUser, FiAward, FiTrendingUp, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiEye } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:4001';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const normalizedPath = imagePath.replace(/\\/g, '/');
  let cleanPath = normalizedPath;
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath;
  } else if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(1);
  }
  return `${API_BASE_URL}/${cleanPath}`;
};

const CandidatesView = ({ voteCounts, election }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [sortBy, setSortBy] = useState('votes');
  const [expandedCandidate, setExpandedCandidate] = useState(null);

  if (!voteCounts || voteCounts.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>👥</div>
        <h3>No Candidate Data Available</h3>
        <p>Vote counts will appear here once voting begins.</p>
      </div>
    );
  }

  let allCandidates = [];
  voteCounts.forEach(position => {
    const totalVotes = position.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    
    position.candidates.forEach((candidate, index) => {
      const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
      const isWinner = index < position.totalSeats;
      
      allCandidates.push({
        id: candidate.candidateId,
        name: candidate.candidateName,
        positionId: position.positionId,
        positionName: position.positionName,
        positionType: position.electionType,
        totalSeats: position.totalSeats,
        votes: candidate.votes || 0,
        percentage: parseFloat(percentage),
        isWinner,
        rank: index + 1,
        photoUrl: candidate.photoUrl || candidate.campaignPhoto
      });
    });
  });

  let filteredCandidates = [...allCandidates];
  
  if (selectedPosition !== 'all') {
    filteredCandidates = filteredCandidates.filter(c => c.positionId === selectedPosition);
  }
  
  if (searchTerm) {
    filteredCandidates = filteredCandidates.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.positionName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  filteredCandidates.sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'position') return a.positionName.localeCompare(b.positionName);
    if (sortBy === 'percentage') return b.percentage - a.percentage;
    return 0;
  });

  const positionOptions = voteCounts.map(p => ({
    id: p.positionId,
    name: p.positionName
  }));

  const totalVotesAll = allCandidates.reduce((sum, c) => sum + c.votes, 0);

  const toggleExpand = (candidateId) => {
    setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
  };

  const renderAvatar = (candidate) => {
    const imageUrl = getImageUrl(candidate.photoUrl);
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={candidate.name} 
          style={styles.avatarImg}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div style="${Object.entries(styles.avatarPlaceholder).map(([k, v]) => `${k}:${v}`).join(';')}">${candidate.name.charAt(0)}</div>`;
          }}
        />
      );
    }
    return <div style={styles.avatarPlaceholder}>{candidate.name.charAt(0)}</div>;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Candidate Performance</h3>
        <div style={styles.filtersRow}>
          <div style={styles.searchBox}>
            <FiSearch size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.filterBox}>
            <FiFilter size={16} color="#94a3b8" />
            <select 
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Positions</option>
              {positionOptions.map(pos => (
                <option key={pos.id} value={pos.id}>{pos.name}</option>
              ))}
            </select>
          </div>
          
          <div style={styles.sortBox}>
            <span style={styles.sortLabel}>Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="votes">Votes (Highest)</option>
              <option value="percentage">Percentage</option>
              <option value="name">Name (A-Z)</option>
              <option value="position">Position</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.summaryStats}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>👥</span>
          <div>
            <div style={styles.summaryValue}>{allCandidates.length}</div>
            <div style={styles.summaryLabel}>Total Candidates</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>🗳️</span>
          <div>
            <div style={styles.summaryValue}>{totalVotesAll.toLocaleString()}</div>
            <div style={styles.summaryLabel}>Total Votes Cast</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>🏆</span>
          <div>
            <div style={styles.summaryValue}>{allCandidates.filter(c => c.isWinner).length}</div>
            <div style={styles.summaryLabel}>Current Winners</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>📊</span>
          <div>
            <div style={styles.summaryValue}>
              {allCandidates.filter(c => c.percentage > 0).length}
            </div>
            <div style={styles.summaryLabel}>With Votes</div>
          </div>
        </div>
      </div>

      <div style={styles.candidatesGrid}>
        {filteredCandidates.map((candidate) => {
          const isExpanded = expandedCandidate === candidate.id;
          
          return (
            <div 
              key={candidate.id}
              style={{
                ...styles.candidateCard,
                ...(candidate.isWinner ? styles.winnerCard : {})
              }}
            >
              <div style={styles.candidateHeader}>
                <div style={styles.candidateAvatar}>
                  {renderAvatar(candidate)}
                </div>
                
                <div style={styles.candidateInfo}>
                  <div style={styles.candidateNameRow}>
                    <h4 style={styles.candidateName}>{candidate.name}</h4>
                    {candidate.isWinner && (
                      <span style={styles.winnerBadge}>
                        <FiAward size={12} /> WINNER
                      </span>
                    )}
                    {candidate.rank === 1 && !candidate.isWinner && (
                      <span style={styles.leadingBadge}>Leading</span>
                    )}
                  </div>
                  <div style={styles.candidateMeta}>
                    <span style={styles.positionTag}>{candidate.positionName}</span>
                    <span style={styles.rankTag}>Rank #{candidate.rank}</span>
                  </div>
                </div>
                
                <div style={styles.voteStats}>
                  <div style={styles.voteNumber}>{candidate.votes.toLocaleString()} votes</div>
                  <div style={styles.percentageCircle}>
                    <svg width="50" height="50" viewBox="0 0 50 50">
                      <circle cx="25" cy="25" r="22" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                      <circle 
                        cx="25" cy="25" r="22" fill="none" 
                        stroke={candidate.isWinner ? '#10b981' : '#3b82f6'} 
                        strokeWidth="3"
                        strokeDasharray={`${2 * Math.PI * 22 * candidate.percentage / 100} ${2 * Math.PI * 22}`}
                        strokeDashoffset={2 * Math.PI * 22 * 0.25}
                        transform="rotate(-90 25 25)"
                      />
                      <text x="25" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b">
                        {candidate.percentage}%
                      </text>
                    </svg>
                  </div>
                </div>
                
                <button 
                  style={styles.expandBtn}
                  onClick={() => toggleExpand(candidate.id)}
                >
                  {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
              </div>
              
              {isExpanded && (
                <div style={styles.expandedContent}>
                  <div style={styles.detailRow}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Position:</span>
                      <span style={styles.detailValue}>{candidate.positionName}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Election Type:</span>
                      <span style={styles.detailValue}>
                        {candidate.positionType === 'single_winner' && 'Single Winner'}
                        {candidate.positionType === 'multiple_winners' && `Top ${candidate.totalSeats} Winners`}
                        {candidate.positionType === 'ranked' && 'Ranked Voting'}
                      </span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Current Rank:</span>
                      <span style={styles.detailValue}>#{candidate.rank}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Vote Share:</span>
                      <div style={styles.progressBarSmall}>
                        <div style={{ ...styles.progressFillSmall, width: `${candidate.percentage}%` }} />
                      </div>
                      <span style={styles.detailValue}>{candidate.percentage}%</span>
                    </div>
                  </div>
                  
                  {candidate.rank === 1 && candidate.percentage > 0 && (
                    <div style={styles.leadInfo}>
                      <FiTrendingUp size={14} color="#10b981" />
                      <span>
                        Leading by {candidate.percentage - (filteredCandidates.find(c => 
                          c.positionId === candidate.positionId && c.rank === 2
                        )?.percentage || 0)}% over next competitor
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCandidates.length === 0 && (
        <div style={styles.noResults}>
          <p>No candidates found matching your search.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #e2e8f0'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '16px'
  },
  filtersRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    flex: 1,
    minWidth: '200px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px'
  },
  filterBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px'
  },
  filterSelect: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    cursor: 'pointer'
  },
  sortBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px'
  },
  sortLabel: {
    fontSize: '13px',
    color: '#64748b'
  },
  sortSelect: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    cursor: 'pointer'
  },
  summaryStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px'
  },
  summaryIcon: {
    fontSize: '28px'
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a'
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#64748b'
  },
  candidatesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  candidateCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s'
  },
  winnerCard: {
    borderColor: '#10b981',
    background: '#f0fdf4'
  },
  candidateHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    flexWrap: 'wrap'
  },
  candidateAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    background: '#D23A01',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '600'
  },
  candidateInfo: {
    flex: 2,
    minWidth: '180px'
  },
  candidateNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '6px'
  },
  candidateName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0
  },
  winnerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    background: '#dcfce7',
    color: '#166534',
    padding: '2px 8px',
    borderRadius: '20px'
  },
  leadingBadge: {
    fontSize: '11px',
    background: '#dbeafe',
    color: '#1e40af',
    padding: '2px 8px',
    borderRadius: '20px'
  },
  candidateMeta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  positionTag: {
    fontSize: '12px',
    color: '#2563EB',
    background: '#eff6ff',
    padding: '2px 8px',
    borderRadius: '20px'
  },
  rankTag: {
    fontSize: '12px',
    color: '#64748b',
    background: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '20px'
  },
  voteStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0
  },
  voteNumber: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a'
  },
  percentageCircle: {
    width: '50px',
    height: '50px'
  },
  expandBtn: {
    padding: '8px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  expandedContent: {
    padding: '16px',
    borderTop: '1px solid #e2e8f0',
    background: '#fafafa'
  },
  detailRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748b'
  },
  detailValue: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1e293b'
  },
  progressBarSmall: {
    width: '80px',
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressFillSmall: {
    height: '100%',
    background: '#3b82f6',
    borderRadius: '3px'
  },
  leadInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '8px 12px',
    background: '#dcfce7',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#166534'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8'
  }
};

export default CandidatesView;