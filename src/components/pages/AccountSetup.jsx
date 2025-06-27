import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import FormField from '@/components/molecules/FormField';
import userService from '@/services/api/userService';

function AccountSetup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Account Type, 3: Success
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    accountType: 'personal',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      
      setIsLoading(true);
      try {
        // Check if email is available
        const isAvailable = await userService.validateEmail(formData.email);
        if (!isAvailable) {
          setErrors({ email: 'This email is already registered' });
          setIsLoading(false);
          return;
        }
        setStep(2);
      } catch (error) {
        toast.error('Error validating email');
      }
      setIsLoading(false);
    } else if (step === 2) {
      if (!validateStep2()) return;
      
      setIsLoading(true);
      try {
        // Create the user account
        const newUser = await userService.register({
          name: formData.name,
          email: formData.email,
          role: formData.accountType === 'business' ? 'admin' : 'user'
        });
        
        // Store user in localStorage for immediate login
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        setStep(3);
        toast.success('Account created successfully!');
      } catch (error) {
        toast.error(error.message || 'Failed to create account');
      }
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-surface-900">Create Your Account</h1>
        <p className="text-surface-600">Join ClassiFlow Pro to manage your ads and listings</p>
      </div>

      <div className="space-y-4">
        <FormField
          label="Full Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          placeholder="Enter your full name"
          required
        />

        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          placeholder="Enter your email address"
          required
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => navigate('/')}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          loading={isLoading}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-surface-900">Account Type</h1>
        <p className="text-surface-600">Choose the type of account that best fits your needs</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.accountType === 'personal'
                ? 'border-primary bg-primary/5'
                : 'border-surface-200 hover:border-surface-300'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, accountType: 'personal' }))}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                formData.accountType === 'personal'
                  ? 'border-primary bg-primary'
                  : 'border-surface-300'
              }`}>
                {formData.accountType === 'personal' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-surface-900">Personal</h3>
                <p className="text-sm text-surface-600 mt-1">
                  For individual users posting personal ads and listings
                </p>
                <ul className="text-xs text-surface-500 mt-2 space-y-1">
                  <li>• Create and manage personal listings</li>
                  <li>• Basic messaging features</li>
                  <li>• Standard support</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.accountType === 'business'
                ? 'border-primary bg-primary/5'
                : 'border-surface-200 hover:border-surface-300'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, accountType: 'business' }))}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                formData.accountType === 'business'
                  ? 'border-primary bg-primary'
                  : 'border-surface-300'
              }`}>
                {formData.accountType === 'business' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-surface-900">Business</h3>
                <p className="text-sm text-surface-600 mt-1">
                  For businesses and organizations with multiple listings
                </p>
                <ul className="text-xs text-surface-500 mt-2 space-y-1">
                  <li>• Unlimited business listings</li>
                  <li>• Advanced analytics</li>
                  <li>• Team collaboration tools</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary border-surface-300 rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-sm text-surface-700">
              I agree to the{' '}
              <a href="#" className="text-primary hover:text-primary/80 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:text-primary/80 underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={handleBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          loading={isLoading}
          className="flex-1"
        >
          Create Account
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <ApperIcon name="CheckCircle" size={32} className="text-green-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-surface-900">Welcome to ClassiFlow Pro!</h1>
        <p className="text-surface-600">
          Your account has been created successfully. You can now start managing your ads and listings.
        </p>
      </div>

      <div className="bg-surface-50 rounded-lg p-4 text-left">
        <h3 className="font-medium text-surface-900 mb-2">What's next?</h3>
        <ul className="space-y-2 text-sm text-surface-700">
          <li className="flex items-center gap-2">
            <ApperIcon name="CheckCircle" size={16} className="text-green-600" />
            Complete your profile setup
          </li>
          <li className="flex items-center gap-2">
            <ApperIcon name="Plus" size={16} className="text-surface-400" />
            Post your first listing
          </li>
          <li className="flex items-center gap-2">
            <ApperIcon name="Search" size={16} className="text-surface-400" />
            Browse available listings
          </li>
          <li className="flex items-center gap-2">
            <ApperIcon name="MessageCircle" size={16} className="text-surface-400" />
            Connect with other users
          </li>
        </ul>
      </div>

      <Button
        onClick={handleGoToDashboard}
        className="w-full"
      >
        Go to Dashboard
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-surface-200'}`}></div>
              <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-surface-200'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-surface-200'}`}></div>
              <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-primary' : 'bg-surface-200'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-surface-200'}`}></div>
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
}

export default AccountSetup;