import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';
import axiosPrivate from '../../utils/axiosPrivate';
import InstBasicInfoStep from '../../components/institutions/InstBasicInfoStep';
import InstAdminStep from '../../components/institutions/InstAdminStep';
import InstReviewStep from '../../components/institutions/InstReviewStep';
import { securityValidators } from '../../utils/validators';

const InstitutionWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    about: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    adminConfirmPassword: ''
  });

  const [stepErrors, setStepErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
    setServerError('');
    // Clear field errors when data updates
    setFieldErrors({});
  };

  // Institution Step Validations
  const validateInstitutionStep = () => {
    const errors = {};
    
    const nameError = securityValidators.isValidInstitutionName(formData.name);
    if (nameError) errors.name = nameError;
    
    const codeError = securityValidators.isValidInstitutionCode(formData.code);
    if (codeError) errors.code = codeError;
    
    const emailError = securityValidators.isValidEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = securityValidators.isValidPhone(formData.phone);
    if (phoneError) errors.phone = phoneError;
    
    const aboutError = securityValidators.isValidInstitutionDesc(formData.about);
    if (aboutError) errors.about = aboutError;
    
    return errors;
  };

  // Admin Step Validations
  const validateAdminStep = () => {
    const errors = {};
    
    const firstNameError = securityValidators.isValidName(formData.adminFirstName, 'First name');
    if (firstNameError) errors.adminFirstName = firstNameError;
    
    const lastNameError = securityValidators.isValidName(formData.adminLastName, 'Last name');
    if (lastNameError) errors.adminLastName = lastNameError;
    
    const emailError = securityValidators.isValidEmail(formData.adminEmail);
    if (emailError) errors.adminEmail = emailError;
    
    const phoneError = securityValidators.isValidPhone(formData.adminPhone);
    if (phoneError) errors.adminPhone = phoneError;
    
    const passwordError = securityValidators.isStrongPassword(formData.adminPassword);
    if (passwordError) errors.adminPassword = passwordError;
    
    const confirmError = securityValidators.doPasswordsMatch(formData.adminPassword, formData.adminConfirmPassword);
    if (confirmError) errors.adminConfirmPassword = confirmError;
    
    return errors;
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const errors = validateInstitutionStep();
      setFieldErrors(errors);
      
      if (Object.keys(errors).length > 0) {
        const firstError = Object.values(errors)[0];
        setStepErrors({ step1: firstError });
        return;
      }
    }

    if (currentStep === 2) {
      const errors = validateAdminStep();
      setFieldErrors(errors);
      
      if (Object.keys(errors).length > 0) {
        const firstError = Object.values(errors)[0];
        setStepErrors({ step2: firstError });
        return;
      }
    }

    setStepErrors({});
    setFieldErrors({});
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    setStepErrors({});
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submit
    const institutionErrors = validateInstitutionStep();
    const adminErrors = validateAdminStep();
    
    if (Object.keys(institutionErrors).length > 0 || Object.keys(adminErrors).length > 0) {
      const allErrors = { ...institutionErrors, ...adminErrors };
      const firstError = Object.values(allErrors)[0];
      setStepErrors({ step3: firstError });
      setCurrentStep(1);
      return;
    }
    
    setLoading(true);
    setServerError('');

    try {
      const response = await axiosPrivate.post('/institution/create-with-admin', {
        name: formData.name,
        code: formData.code,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        about: formData.about,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        adminPassword: formData.adminPassword
      });

      if (response.data.status === 'success') {
        alert('Institution and Admin created successfully!');
        navigate('/superAdmin/manage-institutions');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  const Stepper = () => (
    <div style={styles.stepperContainer}>
      {[
        { n: 1, l: 'Institution' },
        { n: 2, l: 'Admin Account' },
        { n: 3, l: 'Review' }
      ].map((s) => (
        <div key={s.n} style={{
          ...styles.stepItem,
          ...(currentStep === s.n ? styles.stepItemActive : {}),
          ...(currentStep > s.n ? styles.stepItemCompleted : {})
        }}>
          <div style={{
            ...styles.stepCircle,
            ...(currentStep === s.n ? styles.stepCircleActive : {}),
            ...(currentStep > s.n ? styles.stepCircleCompleted : {})
          }}>
            {currentStep > s.n ? <FiCheckCircle size={20} /> : s.n}
          </div>
          <span style={{
            ...styles.stepLabel,
            ...(currentStep === s.n ? styles.stepLabelActive : {}),
            ...(currentStep > s.n ? styles.stepLabelCompleted : {})
          }}>
            {s.l}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={styles.container}>
      <Stepper />

      {(serverError || Object.keys(stepErrors).length > 0) && (
        <div style={styles.errorBanner}>
          <FiAlertCircle size={18} />
          <span>{serverError || Object.values(stepErrors)[0]}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {currentStep === 1 && (
          <InstBasicInfoStep 
            data={formData} 
            onChange={updateFormData} 
            errors={fieldErrors}
          />
        )}
        {currentStep === 2 && (
          <InstAdminStep 
            data={formData} 
            onChange={updateFormData} 
            errors={fieldErrors}
          />
        )}
        {currentStep === 3 && <InstReviewStep data={formData} />}

        <div style={styles.actions}>
          {currentStep > 1 && (
            <button type="button" style={styles.prevBtn} onClick={prevStep} disabled={loading}>
              <FiArrowLeft size={16} /> Previous
            </button>
          )}
          
          {currentStep < 3 ? (
            <button type="button" style={styles.nextBtn} onClick={nextStep} disabled={loading}>
              Continue <FiArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span style={styles.btnFlex}>
                  <FiLoader className="spinner" size={16} /> Creating...
                </span>
              ) : (
                <span style={styles.btnFlex}>Confirm & Create <FiCheckCircle size={16} /></span>
              )}
            </button>
          )}
        </div>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: '900px', 
    margin: '0 auto', 
    padding: '24px',
    minHeight: '100vh',
    background: '#f8fafc'
  },
  stepperContainer: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: '40px', 
    position: 'relative' 
  },
  stepItem: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    flex: 1, 
    position: 'relative' 
  },
  stepCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    background: '#f1f5f9',
    color: '#94a3b8',
    transition: 'all 0.3s'
  },
  stepCircleActive: {
    border: '2px solid #D23A01',
    background: 'white',
    color: '#D23A01',
    boxShadow: '0 4px 12px rgba(210, 58, 1, 0.2)'
  },
  stepCircleCompleted: {
    background: '#D23A01',
    color: 'white'
  },
  stepLabel: {
    marginTop: '10px',
    fontWeight: '600',
    color: '#94a3b8',
    fontSize: '13px',
    letterSpacing: '0.5px'
  },
  stepLabelActive: { 
    color: '#D23A01', 
    fontWeight: '700' 
  },
  stepLabelCompleted: { 
    color: '#D23A01' 
  },
  errorBanner: {
    padding: '14px 18px',
    background: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '500',
    
  },
  form: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: '28px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  actions: { 
    marginTop: '32px', 
    paddingTop: '24px', 
    borderTop: '2px solid #e5e7eb', 
    display: 'flex', 
    justifyContent: 'space-between' 
  },
  prevBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 24px', 
    background: '#f1f5f9', 
    border: '1px solid #e5e7eb', 
    borderRadius: '40px', 
    fontWeight: '600', 
    fontSize: '14px',
    cursor: 'pointer',
    color: '#1a1a1a',
    transition: 'all 0.2s',
    
  },
  nextBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 32px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '40px', 
    fontWeight: '600', 
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    
  },
  submitBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 32px', 
    background: '#023430', 
    color: 'white', 
    border: 'none', 
    borderRadius: '40px', 
    fontWeight: '700', 
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    
  },
  btnFlex: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px' 
  }
};

export default InstitutionWizard;