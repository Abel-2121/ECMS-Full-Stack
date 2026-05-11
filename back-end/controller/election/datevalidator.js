
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

const normalize = (date) => new Date(date.getTime());

const validateAllDatesValid = (dates) => {
  for (const [key, value] of Object.entries(dates)) {
    if (!isValidDate(value)) {
      return { valid: false, message: `Invalid date format for ${key}` };
    }
  }
  return { valid: true };
};


const validateAllDatesFuture = (dates) => {
  const now = new Date();

  for (const [key, value] of Object.entries(dates)) {
    if (value.getTime() <= now.getTime()) {
      return { valid: false, message: `${key} must be a future date` };
    }
  }

  return { valid: true };
};


const validateTimelineOrder = (dates) => {
  const {
    registrationStart,
    registrationEnd,
    nominationStart,
    nominationEnd,
    votingStart,
    votingEnd,
    resultPublicationDate
  } = dates;

  if (registrationEnd.getTime() <= registrationStart.getTime()) {
    return { valid: false, message: 'Registration end must be after start' };
  }

  if (nominationEnd.getTime() <= nominationStart.getTime()) {
    return { valid: false, message: 'Nomination end must be after start' };
  }

  if (votingEnd.getTime() <= votingStart.getTime()) {
    return { valid: false, message: 'Voting end must be after start' };
  }

  if (nominationStart.getTime() <= registrationEnd.getTime()) {
    return { valid: false, message: 'Nomination must start after registration ends' };
  }

  if (votingStart.getTime() <= nominationEnd.getTime()) {
    return { valid: false, message: 'Voting must start after nomination ends' };
  }

  if (resultPublicationDate.getTime() <= votingEnd.getTime()) {
    return { valid: false, message: 'Result must be after voting ends' };
  }

  return { valid: true };
};


const validateElectionDates = (dates, checkFuture = true) => {

  const validCheck = validateAllDatesValid(dates);
  if (!validCheck.valid) return validCheck;


  if (checkFuture) {
    const futureCheck = validateAllDatesFuture(dates);
    if (!futureCheck.valid) return futureCheck;
  }

  const orderCheck = validateTimelineOrder(dates);
  if (!orderCheck.valid) return orderCheck;

  return { valid: true };
};

module.exports = {
  isValidDate,
  validateElectionDates
};