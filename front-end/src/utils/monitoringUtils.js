/**
 * ECMS Monitoring Helpers
 * Handles the logic required for Anonymity Protection per UC-7
 */

const ANONYMITY_THRESHOLD = 10;

/**
 * Strips data or aggregates it to 'Redacted' if vote count < 10
 */
export const enforceAnonymity = (chartData, keyPath = 'votes') => {
  return chartData.map(item => {
    if (item[keyPath] < ANONYMITY_THRESHOLD) {
      if (item.department) return { ...item, department: `${item.department} (Redacted)` };
      if (item.year) return { ...item, year: `${item.year} (Redacted)`, [keyPath]: 0, percentage: 0 };
      if (item.position) return { ...item, position: `${item.position} (Redacted)`, [keyPath]: 0, percentage: 0 };
    }
    return item;
  });
};

/**
 * Filter handler applying the Redux context against the active datasets
 */
export const applyFilters = (data, filters) => {
  if (!data) return null;
  
  let processed = { ...data };
  
  // Simulated filter effect (In reality, backend handles this natively)
  if (filters.department !== 'All') {
    processed.turnoutByDepartment = processed.turnoutByDepartment.filter(d => d.department === filters.department);
  }
  
  if (filters.position !== 'All') {
    processed.votesByPosition = processed.votesByPosition.filter(p => p.position === filters.position);
  }
  
  // We mock the timeRange effect by cutting the trends array
  if (filters.timeRange === 'Last 1h') {
    processed.hourlyTrends = processed.hourlyTrends.slice(-1);
  } else if (filters.timeRange === 'Last 6h') {
    processed.hourlyTrends = processed.hourlyTrends.slice(-6);
  } else if (filters.timeRange === 'Last 12h') {
    processed.hourlyTrends = processed.hourlyTrends.slice(-12);
  }

  return processed;
};

/**
 * Handles dummy download of payloads
 */
export const triggerExport = (format) => {
  // In a robust implementation, PDF generation utilizes html2canvas/jsPDF.
  // We mock the success state output natively here.
  return new Promise((resolve) => setTimeout(() => resolve(`Exported successfully as ${format}`), 800));
};
