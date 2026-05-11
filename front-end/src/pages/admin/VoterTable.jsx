// components/electionAdmin/VoterTable.jsx
import React from 'react';
import { FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';

const VoterTable = ({ 
  voters, 
  loading, 
  currentPage = 1,
  itemsPerPage = 50,
  onEdit, 
  onDelete,
  showActions = false 
}) => {
  if (loading) {
    return (
      <div style={styles.loaderSmall}>
        <div style={styles.spinner}></div>
        <p>Loading voters...</p>
      </div>
    );
  }

  if (voters.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <FiUsers size={48} color="#D23A01" />
        </div>
        <p>No voters registered yet</p>
        <p style={styles.emptySubtext}>Add voters using the "Add Voter" button above</p>
      </div>
    );
  }

  return (
    <div style={styles.votersTableWrapper}>
      <table style={styles.voterTable}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.tableHeader}>#</th>
            <th style={styles.tableHeader}>Voter Name</th>
            <th style={styles.tableHeader}>Email</th>
            <th style={styles.tableHeader}>Phone</th>
            <th style={styles.tableHeader}>Status</th>
            <th style={styles.tableHeader}>Has Voted</th>
            {showActions && <th style={styles.tableHeader}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {voters.map((voter, idx) => (
            <tr key={voter._id || idx} style={styles.tableRow}>
              <td style={styles.tableCell}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
              <td style={styles.tableCell}>
                <div style={styles.voterNameCell}>
                  <div style={styles.voterAvatar}>
                    {voter.firstName?.charAt(0)}{voter.lastName?.charAt(0)}
                  </div>
                  <p>{voter.firstName} {voter.lastName}</p>
                </div>
              </td>
              <td style={styles.tableCell}>{voter.email}</td>
              <td style={styles.tableCell}>{voter.phone || '—'}</td>
              <td style={styles.tableCell}>
                <p style={voter.isRegistered ? styles.registeredBadge : styles.pendingBadge}>
                  {voter.isRegistered ? '✓ Registered' : '○ Pending'}
                </p>
              </td>
              <td style={styles.tableCell}>
                <p style={voter.hasVoted ? styles.votedBadge : styles.notVotedBadge}>
                  {voter.hasVoted ? '✓ Voted' : '○ Not Voted'}
                </p>
              </td>
              {showActions && (
                <td style={styles.tableCell}>
                  <div style={styles.actionButtons}>
                    {onEdit && (
                      <button style={styles.editBtn} onClick={() => onEdit(voter)} title="Edit Voter">
                        <FiEdit2 size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button style={styles.deleteBtn} onClick={() => onDelete(voter._id)} title="Delete Voter">
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  votersTableWrapper: {
    overflowX: 'auto',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    background: 'white',
    marginBottom: '20px'
  },
  voterTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    minWidth: '750px'
  },
  tableHeaderRow: {
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  tableHeader: {
    textAlign: 'left',
    padding: '16px 16px',
    fontWeight: '700',
    color: '#1a1a1a',
    fontSize: '14px',
    borderBottom: '1px solid #e2e8f0'
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
    transition: 'background 0.2s',
    ':hover': {
      background: '#f8fafc'
    }
  },
  tableCell: {
    padding: '14px 16px',
    color: '#1a1a1a',
    verticalAlign: 'middle',
    fontSize: '14px'
  },
  voterNameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  voterAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#FEF3F0',
    color: '#D23A01',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px'
  },
  registeredBadge: {
    fontSize: '12px',
    background: '#E8F5E9',
    color: '#023430',
    padding: '4px 12px',
    borderRadius: '20px',
    display: 'inline-block',
    fontWeight: '600'
  },
  pendingBadge: {
    fontSize: '12px',
    background: '#FEF3F0',
    color: '#D23A01',
    padding: '4px 12px',
    borderRadius: '20px',
    display: 'inline-block',
    fontWeight: '600'
  },
  votedBadge: {
    fontSize: '12px',
    background: '#023430',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    display: 'inline-block',
    fontWeight: '600'
  },
  notVotedBadge: {
    fontSize: '12px',
    background: '#f1f5f9',
    color: '#4a5568',
    padding: '4px 12px',
    borderRadius: '20px',
    display: 'inline-block',
    fontWeight: '600'
  },
  loaderSmall: {
    textAlign: 'center',
    padding: '60px',
    color: '#4a5568',
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #D23A01',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0'
  },
  emptyIcon: {
    marginBottom: '16px'
  },
  emptySubtext: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '8px'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px'
  },
  editBtn: {
    padding: '6px 10px',
    background: '#FEF3F0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#D23A01',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    ':hover': {
      background: '#FDE5D6'
    }
  },
  deleteBtn: {
    padding: '6px 10px',
    background: '#fee2e2',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#dc2626',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    ':hover': {
      background: '#fecaca'
    }
  }
};

// Add keyframe animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('#voter-table-styles')) {
  styleSheet.id = 'voter-table-styles';
  document.head.appendChild(styleSheet);
}

export default VoterTable;