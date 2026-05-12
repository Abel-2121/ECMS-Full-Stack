import React from 'react';
import { FiCheckCircle, FiHome, FiMail, FiPhone, FiMapPin, FiCode, FiUser } from 'react-icons/fi';

const InstReviewStep = ({ data }) => {
  return (
    <div>
      <h2 style={styles.title}>Review & Confirm</h2>
      <p style={styles.subtitle}>Please review all information before creating</p>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <FiHome size={18} /> Institution Details
        </h3>
        <div style={styles.reviewGrid}>
          <div style={styles.reviewItem}>
            <FiCode size={16} style={styles.icon} />
            <strong>Name:</strong> <p>{data.name || '—'}</p>
          </div>
          <div style={styles.reviewItem}>
            <FiCode size={16} style={styles.icon} />
            <strong>Code:</strong> <p>{data.code || '—'}</p>
          </div>
          <div style={styles.reviewItem}>
            <FiMail size={16} style={styles.icon} />
            <strong>Email:</strong> <p>{data.email || '—'}</p>
          </div>
          <div style={styles.reviewItem}>
            <FiPhone size={16} style={styles.icon} />
            <strong>Phone:</strong> <p>{data.phone || '—'}</p>
          </div>
          <div style={styles.reviewItem}>
            <FiMapPin size={16} style={styles.icon} />
            <strong>Address:</strong> <p>{data.address || '—'}</p>
          </div>
          {data.about && (
            <div style={styles.reviewItemFull}>
              <strong>About:</strong> <p>{data.about}</p>
            </div>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <FiUser size={18} /> Admin Account
        </h3>
        <div style={styles.reviewGrid}>
          <div style={styles.reviewItem}>
            <FiUser size={16} style={styles.icon} />
            <strong>Name:</strong> <p>{data.adminFirstName} {data.adminLastName}</p>
          </div>
          <div style={styles.reviewItem}>
            <FiMail size={16} style={styles.icon} />
            <strong>Email:</strong> <p>{data.adminEmail || '—'}</p>
          </div>
          <div style={styles.reviewItem}>
            <FiPhone size={16} style={styles.icon} />
            <strong>Phone:</strong> <p>{data.adminPhone || '—'}</p>
          </div>
        </div>
      </div>

      <div style={styles.warningBox}>
        <FiCheckCircle size={20} color="#D23A01" />
        <p>The admin will receive a welcome email with login credentials.</p>
      </div>
    </div>
  );
};

const styles = {
  title: { 
    fontSize: '22px', 
    fontWeight: '700', 
    marginBottom: '8px',
    color: '#1a1a1a',
    
  },
  subtitle: { 
    color: '#000000', 
    marginBottom: '24px',
    fontSize: '14px',
    
  },
  section: { 
    marginBottom: '28px' 
  },
  sectionTitle: { 
    fontSize: '16px', 
    fontWeight: '700', 
    marginBottom: '16px', 
    paddingBottom: '10px',
    borderBottom: '2px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#1a1a1a',
    
  },
  reviewGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
    gap: '14px' 
  },
  reviewItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    fontSize: '14px',
    color: '#1a1a1a'
  },
  reviewItemFull: { 
    gridColumn: '1 / -1',
    display: 'flex',
    gap: '8px',
    fontSize: '14px',
    color: '#1a1a1a'
  },
  icon: { 
    color: '#D23A01' 
  },
  warningBox: { 
    background: '#D23A0110', 
    border: '1px solid #D23A0120', 
    borderRadius: '12px', 
    padding: '16px 20px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    marginTop: '24px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a1a',
    
  }
};

export default InstReviewStep;