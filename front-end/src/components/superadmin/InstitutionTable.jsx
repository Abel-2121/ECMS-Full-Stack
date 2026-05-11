// components/superadmin/InstitutionTable.jsx
import React from 'react';
import { FiEye, FiTrash2, FiUserCheck, FiUserX, FiAlertCircle } from 'react-icons/fi';

const InstitutionTable = ({ 
  institutions, 
  loading, 
  onView, 
  onDelete, 
  onToggleStatus,
  canDeleteInstitution
}) => {
  if (loading) {
    return <div style={styles.loader}>Loading institutions...</div>;
  }

  if (institutions.length === 0) {
    return (
      <div style={styles.emptyState}>
        <FiAlertCircle size={36} style={styles.emptyIcon} />
        <p>No institutions found</p>
      </div>
    );
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>Institution</th>
            <th style={styles.th}>Code</th>
            <th style={styles.th}>Contact</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Created</th>
            <th style={styles.th}>Actions</th>
           </tr>
        </thead>
        <tbody>
          {institutions.map((inst) => {
            const deleteCheck = canDeleteInstitution ? canDeleteInstitution(inst) : { allowed: true, reason: '' };
            const isDeleteDisabled = !deleteCheck.allowed;
            
            return (
              <tr key={inst._id} style={styles.row}>
                <td style={styles.td}>
                  <div style={styles.cellContent}>
                    <div style={styles.instName}>{inst.name}</div>
                    {inst.about && <div style={styles.instAbout}>{inst.about?.slice(0, 60)}...</div>}
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.code}>{inst.code}</span>
                </td>
                <td style={styles.td}>
                  <div style={styles.cellContent}>
                    <div style={styles.email}>{inst.email}</div>
                    {inst.phone && <div style={styles.phone}>{inst.phone}</div>}
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    background: inst.status === 'active' ? '#D23A0110' : 
                               inst.status === 'inactive' ? '#02343010' : '#fee2e2',
                    color: inst.status === 'active' ? '#D23A01' : 
                           inst.status === 'inactive' ? '#023430' : '#991b1b'
                  }}>
                    {inst.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={styles.date}>{new Date(inst.createdAt).toLocaleDateString()}</span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button 
                      style={styles.actionBtn} 
                      onClick={() => onView(inst)}
                      title="View Details"
                    >
                      <FiEye size={18} />
                    </button>
                    
                    <button 
                      style={{ 
                        ...styles.actionBtn, 
                        ...(inst.status === 'active' ? styles.warningBtn : styles.successBtn)
                      }}
                      onClick={() => onToggleStatus(inst)}
                      title={inst.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {inst.status === 'active' ? <FiUserX size={18} /> : <FiUserCheck size={18} />}
                    </button>
                    
                    <button 
                      style={{ 
                        ...styles.actionBtn, 
                        ...styles.dangerBtn,
                        opacity: isDeleteDisabled ? 0.5 : 1,
                        cursor: isDeleteDisabled ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => !isDeleteDisabled && onDelete(inst)}
                      title={isDeleteDisabled ? deleteCheck.reason : 'Delete Institution'}
                      disabled={isDeleteDisabled}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  tableWrapper: { 
    overflowX: 'auto', 
    background: 'white', 
    borderRadius: '20px', 
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse',
    minWidth: '900px'
  },
  headerRow: { 
    background: '#f8fafc',
    borderBottom: '2px solid #e5e7eb'
  },
  th: { 
    textAlign: 'left',
    padding: '16px 20px',
    fontWeight: '800',
    fontSize: '16px',
    color: '#000000',
    fontFamily: "'Poppins', sans-serif",
    borderBottom: '1px solid #e5e7eb'
  },
  row: { 
    borderBottom: '1px solid #e5e7eb',
    transition: 'background 0.2s'
  },
  td: { 
    padding: '16px 20px',
    verticalAlign: 'middle',
    fontSize: '15px',
    color: '#000000',
    fontFamily: "'Poppins', sans-serif"
  },
  cellContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  instName: { 
    fontWeight: '800', 
    color: '#000000',
    fontSize: '17px',
    fontFamily: "'Poppins', sans-serif"
  },
  instAbout: { 
    fontSize: '13px', 
    color: '#4b5563',
    marginTop: '2px',
    lineHeight: '1.4'
  },
  code: {
    fontFamily: 'monospace',
    fontSize: '14px',
    background: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '8px',
    display: 'inline-block',
    color: '#000000'
  },
  email: {
    fontSize: '15px',
    color: '#000000',
    fontWeight: '500'
  },
  phone: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '2px'
  },
  date: {
    fontSize: '14px',
    color: '#000000'
  },
  statusBadge: { 
    display: 'inline-block', 
    padding: '6px 14px', 
    borderRadius: '20px', 
    fontSize: '13px', 
    fontWeight: '700',
    textTransform: 'capitalize'
  },
  actions: { 
    display: 'flex', 
    gap: '10px',
    alignItems: 'center'
  },
  actionBtn: { 
    padding: '10px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    display: 'inline-flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '40px', 
    height: '40px',
    transition: 'all 0.2s',
    color: '#4b5563'
  },
  warningBtn: { 
    color: '#f59e0b' 
  },
  successBtn: { 
    color: '#10b981' 
  },
  dangerBtn: { 
    color: '#dc2626' 
  },
  loader: { 
    textAlign: 'center', 
    padding: '50px', 
    color: '#000000',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '16px',
    fontWeight: '500'
  },
  emptyState: { 
    textAlign: 'center', 
    padding: '50px', 
    color: '#000000',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  emptyIcon: {
    color: '#9ca3af'
  }
};

export default InstitutionTable;