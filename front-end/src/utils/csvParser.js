// utils/csvParser.js
import Papa from 'papaparse';

export const parseCSV = (fileContent) => {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanedData = results.data.map(row => ({
          firstName: row.firstName?.trim() || '',
          lastName: row.lastName?.trim() || '',
          email: row.email?.trim().toLowerCase() || '',
          phone: row.phone?.trim() || ''
        }));
        resolve(cleanedData.filter(row => row.email));
      },
      error: (error) => reject(error)
    });
  });
};

export const getCSVTemplate = () => {
  const headers = ['firstName', 'lastName', 'email', 'phone'];
  const sampleRow = ['John', 'Doe', 'john@example.com', '+251911234567'];
  return [headers.join(','), sampleRow.join(',')].join('\n');
};