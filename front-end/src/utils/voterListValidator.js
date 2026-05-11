// utils/voterListValidator.js
export const validateVoterList = (records) => {
  const validRecords = [];
  const invalidRecords = [];
  const emailSet = new Set();

  records.forEach((record, index) => {
    const missingFields = [];
    if (!record.firstName) missingFields.push('firstName');
    if (!record.lastName) missingFields.push('lastName');
    if (!record.email) missingFields.push('email');

    if (missingFields.length > 0) {
      invalidRecords.push({
        row: index + 2,
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        reason: `Missing: ${missingFields.join(', ')}`
      });
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(record.email)) {
      invalidRecords.push({
        row: index + 2,
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        reason: 'Invalid email format'
      });
      return;
    }

    if (emailSet.has(record.email.toLowerCase())) {
      invalidRecords.push({
        row: index + 2,
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        reason: 'Duplicate email'
      });
      return;
    }

    emailSet.add(record.email.toLowerCase());

    validRecords.push({
      firstName: record.firstName.trim(),
      lastName: record.lastName.trim(),
      email: record.email.toLowerCase().trim(),
      phone: record.phone || ''
    });
  });

  return { validRecords, invalidRecords };
};