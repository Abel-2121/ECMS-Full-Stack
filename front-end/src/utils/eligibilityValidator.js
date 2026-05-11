// =====================================================
// eligibilityValidator.js - ECMS Eligibility Check Utility
// =====================================================

/**
 * Checks if a user is present in the eligibility list based on National ID, Email, Phone, or Name.
 * This is a client-side wrapper around the eligibility check logic.
 */
export const checkUserEligibilityFromServerList = async (userData, eligibilityList) => {
  if (!eligibilityList || (Array.isArray(eligibilityList) && eligibilityList.length === 0)) {
    throw new Error('No eligibility list found.');
  }

  const { nationalID, email, phone, fullName } = userData;

  // Simple match found logic
  return eligibilityList.some(item => (
    item.nationalID === nationalID ||
    item.email === email ||
    item.phone === phone ||
    item.fullName.toLowerCase() === fullName.toLowerCase()
  ));
};
