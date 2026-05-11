export const formatLocalDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime && { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true  
    })
  };
  return new Date(dateString).toLocaleString('en-US', options);
};