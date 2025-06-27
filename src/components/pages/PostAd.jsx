import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import paymentService from "@/services/api/paymentService";
import ApperIcon from "@/components/ApperIcon";
import PackageSelector from "@/components/organisms/PackageSelector";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import listingService from "@/services/api/listingService";
import categoryService from "@/services/api/categoryService";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_example');
const PostAd = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    price: '',
    images: [],
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    customData: {}
});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const steps = [
    { id: 1, title: 'Choose Package', icon: 'Package' },
    { id: 2, title: 'Category & Details', icon: 'FileText' },
    { id: 3, title: 'Images & Media', icon: 'Camera' },
    { id: 4, title: 'Review & Payment', icon: 'CreditCard' }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await categoryService.getAll();
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!selectedPackage) {
          newErrors.package = 'Please select a package';
        }
        break;
      case 2:
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.location.city.trim()) newErrors.city = 'City is required';
        if (!formData.location.state.trim()) newErrors.state = 'State is required';
        break;
      case 3:
        if (formData.images.length === 0) {
          newErrors.images = 'At least one image is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear field error when user starts typing
    if (errors[field.split('.').pop()]) {
      setErrors(prev => ({
        ...prev,
        [field.split('.').pop()]: ''
      }));
    }
  };

  const handleImageUpload = (files) => {
    // Simulate image upload - in real app, upload to cloud storage
    const imageUrls = Array.from(files).map((file, index) => 
      `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&ixid=${Date.now()}-${index}`
    );
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls].slice(0, selectedPackage?.imageLimit || 15)
    }));
  };
const initializePayment = async () => {
    if (!selectedPackage) return;

    try {
      setLoading(true);
      const { clientSecret } = await paymentService.createPaymentIntent({
        amount: selectedPackage.price * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          packageId: selectedPackage.Id,
          packageName: selectedPackage.name
        }
      });
      setClientSecret(clientSecret);
    } catch (error) {
      toast.error('Failed to initialize payment');
      console.error('Payment initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 4 && selectedPackage && !clientSecret) {
      initializePayment();
    }
  }, [currentStep, selectedPackage]);

  const handleSubmit = async (stripe, elements) => {
    if (!validateStep(currentStep) || !stripe || !elements || !clientSecret) return;

    setPaymentProcessing(true);
    try {
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.title, // Use listing title as billing name
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const listingData = {
          ...formData,
          package: selectedPackage.name.toLowerCase(),
          price: formData.price ? parseFloat(formData.price) : null,
          expiresAt: new Date(Date.now() + selectedPackage.duration * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'current-user', // In real app, get from auth context
          paymentIntentId: paymentIntent.id,
          paymentStatus: 'completed'
        };

        await listingService.create(listingData);
        
        toast.success('Payment successful! Your listing is now live.');
        navigate('/payment/success?listing_id=' + Date.now());
      }
    } catch (error) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setPaymentProcessing(false);
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PackageSelector
            selectedPackageId={selectedPackage?.Id}
            onPackageSelect={setSelectedPackage}
          />
        );

      case 2:
        const topLevelCategories = categories.filter(cat => cat.parentId === null);
        const subcategories = formData.categoryId 
          ? categories.filter(cat => cat.parentId === parseInt(formData.categoryId, 10))
          : [];

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-surface-900 mb-2">
                Listing Details
              </h2>
              <p className="text-surface-600">
                Provide detailed information about your listing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleFormChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select a category</option>
                    {topLevelCategories.map(cat => (
                      <option key={cat.Id} value={cat.Id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-error">{errors.categoryId}</p>
                  )}
                </div>

                <FormField
                  label="Title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  error={errors.title}
                  placeholder="What are you selling?"
                />

                <FormField
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  placeholder="0.00"
                  icon="DollarSign"
                />
              </div>

              <div className="space-y-4">
                <FormField
                  label="City"
                  name="city"
                  required
                  value={formData.location.city}
                  onChange={(e) => handleFormChange('location.city', e.target.value)}
                  error={errors.city}
                  icon="MapPin"
                />

                <FormField
                  label="State"
                  name="state"
                  required
                  value={formData.location.state}
                  onChange={(e) => handleFormChange('location.state', e.target.value)}
                  error={errors.state}
                />

                <FormField
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.location.zipCode}
                  onChange={(e) => handleFormChange('location.zipCode', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Describe your item in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-error">{errors.description}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-surface-900 mb-2">
                Images & Media
              </h2>
              <p className="text-surface-600">
                Add photos to showcase your listing ({selectedPackage?.imageLimit} images max)
              </p>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-surface-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer space-y-2">
                  <ApperIcon name="Upload" size={48} className="text-surface-400 mx-auto" />
                  <div>
                    <p className="text-surface-700 font-medium">Click to upload images</p>
                    <p className="text-sm text-surface-500">Or drag and drop files here</p>
                  </div>
                </label>
              </div>

              {errors.images && (
                <p className="text-sm text-error">{errors.images}</p>
              )}

              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute top-1 right-1 bg-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ApperIcon name="X" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-surface-900 mb-2">
                Review & Payment
              </h2>
              <p className="text-surface-600">
                Review your listing and complete payment
              </p>
            </div>

            {/* Listing Preview */}
            <div className="bg-surface-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-surface-900">Listing Preview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-surface-600">Title:</span>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-surface-600">Price:</span>
                    <p className="font-medium text-primary">
                      {formData.price ? `$${formData.price}` : 'Contact for Price'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-surface-600">Location:</span>
                    <p className="font-medium">
                      {formData.location.city}, {formData.location.state}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-surface-600">Package:</span>
                    <p className="font-medium">{selectedPackage?.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-surface-600">Duration:</span>
                    <p className="font-medium">{selectedPackage?.duration} days</p>
                  </div>
                  <div>
                    <span className="text-sm text-surface-600">Images:</span>
                    <p className="font-medium">{formData.images.length} uploaded</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white border border-surface-200 rounded-lg p-6">
              <h3 className="font-semibold text-surface-900 mb-4">Payment Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{selectedPackage?.name} Package</span>
                  <span>${selectedPackage?.price}</span>
                </div>
                <div className="flex justify-between text-sm text-surface-600">
                  <span>Processing Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${selectedPackage?.price}</span>
                </div>
              </div>
            </div>

{/* Payment Form */}
            <div className="bg-white border border-surface-200 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-surface-900">Payment Information</h3>
              
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm 
                    onSubmit={handleSubmit}
                    loading={paymentProcessing}
                  />
                </Elements>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-surface-600">
                    <ApperIcon name="Loader2" size={20} className="animate-spin" />
                    <span>Initializing secure payment...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm
                  ${currentStep >= step.id 
                    ? 'bg-primary text-white' 
                    : 'bg-surface-200 text-surface-600'
                  }
                `}>
                  {currentStep > step.id ? (
                    <ApperIcon name="Check" size={16} />
                  ) : (
                    <ApperIcon name={step.icon} size={16} />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    h-1 w-16 mx-2
                    ${currentStep > step.id ? 'bg-primary' : 'bg-surface-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <h2 className="text-lg font-semibold text-surface-900">
              {steps[currentStep - 1]?.title}
            </h2>
            <p className="text-sm text-surface-600">
              Step {currentStep} of {steps.length}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-8 py-6 bg-surface-50 border-t border-surface-200 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              icon="ChevronLeft"
            >
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                icon="ChevronRight"
                iconPosition="right"
                disabled={currentStep === 1 && !selectedPackage}
              >
                Next
              </Button>
) : (
              <div id="payment-button-container">
                {/* Payment button is rendered within PaymentForm component */}
              </div>
            )}
          </div>
        </div>
</div>
    </div>
);
};

export default PostAd;
// Payment Form Component
const PaymentForm = ({ onSubmit, loading }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    await onSubmit(stripe, elements);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Card Information
        </label>
        <div className="p-3 border border-surface-300 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
      </div>
      
      <div className="pt-4">
        <Button
          type="submit"
          loading={loading}
          disabled={!stripe || loading}
          icon="CreditCard"
          variant="accent"
          size="lg"
          className="w-full"
        >
          {loading ? 'Processing Payment...' : 'Pay & Publish Listing'}
        </Button>
      </div>
    </form>
  );
};