import React from 'react';

const InvalidRecordsTable = ({ invalidRecords }) => {
  if (!invalidRecords || invalidRecords.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h4 style={{ marginBottom: '1rem', color: '#dc2626' }}>⚠️ Invalid Records ({invalidRecords.length})</h4>
      <div className="glass" style={{ borderRadius: 'var(--radius-2)', overflow: 'auto', maxHeight: '400px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: '#fef2f2', color: '#991b1b', borderBottom: '2px solid #fee2e2' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Row</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Email / ID</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Error Details</th>
            </tr>
          </thead>
          <tbody>
            {invalidRecords.map((record, index) => (
              <tr key={index} style={{ borderBottom: '1px solid var(--color-gray-200)', background: '#fff' }}>
                <td style={{ padding: '0.6rem 1rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>
                  {record._rowIndex || '?'}
                </td>
                <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>
                  {record['Full Name'] || <p style={{color: 'var(--color-gray-400)'}}>- Missing -</p>}
                </td>
                <td style={{ padding: '0.6rem 1rem' }}>
                  <div style={{ marginBottom: '0.2rem' }}>{record['Email'] || '-'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>ID: {record['National ID/Student ID'] || '-'}</div>
                </td>
                <td style={{ padding: '0.6rem 1rem', color: '#dc2626' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    {record.errors?.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvalidRecordsTable;
