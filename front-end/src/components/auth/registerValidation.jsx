import {validateEmail,validatePhoneNumber,validateAge,validatePasswordStrength} from "../../utils/validators";
  
  export const validateRegisterField = (name, value, formData) => {
    switch (name) {
      case "firstName":
        if (!value) return "First Name is required.";
        if (value.length < 2) return "Minimum 2 characters.";
        return null;
  
      case "lastName":
        if (!value) return "Last Name is required.";
        return null;
  
      case "email":
        if (!value) return "Email is required.";
        if (!validateEmail(value)) return "Invalid email format.";
        return null;
  
      case "password":
        if (!value) return "Password is required.";
        if (!validatePasswordStrength(value).isValid)
          return "Password does not meet requirements.";
        return null;
  
      case "confirmPassword":
        if (value !== formData.password)
          return "Passwords do not match.";
        return null;
  
      case "phone":
        if (!value) return "Phone number is required.";
        if (!validatePhoneNumber(value))
          return "Invalid phone number.";
        return null;
  
      case "dob":
        if (!value) return "Date of Birth is required.";
        if (!validateAge(value))
          return "You must be 18+.";
        return null;
  
      default:
        return null;
    }
  };
 
  export const validateRegisterForm = (formData) => {
    const errors = {};
    let isValid = true;
  
    Object.keys(formData).forEach((field) => {
      const error = validateRegisterField(field, formData[field], formData);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });
  
    return { errors, isValid };
  };