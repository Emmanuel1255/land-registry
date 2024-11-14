// src/pages/land/Transfer.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { DigitalSignatureModal } from '@/components/modals/DigitalSignatureModal';
import UserSelect from '@/components/common/UserSelect';
import api from '@/services/api';
import { transferService } from '@/services/transfer.service';

// Validation schemas for each step
const validationSchemas = {
  0: Yup.object({
    toOwnerId: Yup.string().required('New owner selection is required'),
    transferReason: Yup.string().required('Transfer reason is required'),
    agreementDate: Yup.date().required('Agreement date is required'),
  }),
  1: Yup.object({}),
  2: Yup.object({
    transferAmount: Yup.number()
      .required('Transfer amount is required')
      .positive('Amount must be positive')
      .min(1, 'Amount must be greater than 0'),
  }),
  3: Yup.object({}),
};

// Step indicator component
const TransferStatus = ({ currentStep }) => {
  const steps = [
    { name: 'Details', icon: UserIcon },
    { name: 'Documents', icon: DocumentTextIcon },
    { name: 'Payment', icon: CurrencyDollarIcon },
    { name: 'Confirmation', icon: CheckCircleIcon },
  ];

  return (
    <div className="py-4">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.name} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full
                ${index <= currentStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'}`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 
                ${index < currentStep ? 'bg-primary-600' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 px-6">
        {steps.map((step, index) => (
          <div key={step.name}
            className={`text-xs font-medium
              ${index <= currentStep ? 'text-primary-600' : 'text-gray-500'}`}
          >
            {step.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const Transfer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [transferData, setTransferData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [property, setProperty] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);


  // Fetch property details on component mount
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data);
      } catch (error) {
        toast.error('Error fetching property details');
        navigate('/properties');
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only PDF, JPG, and PNG files are allowed.`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setDocuments(prev => [...prev, ...validFiles]);
  };

  // Handle document upload
  const handleNextStep = async (values, { setFieldError }) => {
    try {
      setIsSubmitting(true);

      switch (currentStep) {
        case 0: // Details
          if (!selectedUser) {
            toast.error('Please select a user to transfer to');
            return;
          }

          // Create transfer payload with all required fields
          const transferPayload = {
            propertyId: id,
            toOwnerId: values.toOwnerId,
            transferReason: values.transferReason,
            agreementDate: values.agreementDate,
            toOwnerDetails: {
              name: `${selectedUser.firstName} ${selectedUser.lastName}`,
              identification: selectedUser._id,
              contact: selectedUser.email
            }
          };

          console.log('Transfer payload:', transferPayload); // For debugging

          const { data: transfer } = await api.post('/properties/transfer/initiate', transferPayload);

          console.log(transfer);

          setTransferData(transfer);

          setCurrentStep(1);
          toast.success('Transfer initiated successfully');
          break;

        case 1: // Documents
          if (documents.length === 0) {
            toast.error('Please upload at least one document');
            return;
          }

          try {
            const result = await transferService.uploadTransferDocuments(transferData._id, documents);
            setTransferData(prev => ({
              ...prev,
              documents: result.documents
            }));
            setCurrentStep(2);
            toast.success('Documents uploaded successfully');
          } catch (error) {
            toast.error(error.message);
          }
          break;

        case 2: // Payment
          await api.put(`/properties/transfer/${transferData._id}`, {
            transferAmount: values.transferAmount,
            fees: {
              registration: 500,
              stampDuty: 200
            }
          });

          setTransferData(prev => ({
            ...prev,
            transferAmount: values.transferAmount,
            totalAmount: Number(values.transferAmount) + 700
          }));
          setCurrentStep(3);
          break;

        case 3: // Confirmation
          setShowSignatureModal(true);
          break;
      }
    } catch (error) {
      console.error('Transfer error:', error);
      const message = error.response?.data?.message || 'An error occurred';
      toast.error(message);

      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach(key => {
          setFieldError(key, error.response.data.errors[key]);
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle digital signature submission
  const handleSignatureSave = async (signature) => {
    try {
      setIsSubmitting(true);
      await transferService.completeTransfer(transferData._id, transferData, signature);
      toast.success('Transfer completed successfully!');
      navigate(`/properties/${id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
      setShowSignatureModal(false);
    }
  };

  // Render content for each step
  const renderStepContent = (values, { setFieldValue, errors, touched }) => {
    switch (currentStep) {
      case 0: // Details
        return (
          <div className="space-y-6">
            <UserSelect
              label="Select New Owner"
              required
              selectedUserId={values.toOwnerId}
              onSelect={(user) => {
                if (user) {
                  setFieldValue('toOwnerId', user._id); // Use _id instead of id
                  setSelectedUser(user);
                } else {
                  setFieldValue('toOwnerId', '');
                  setSelectedUser(null);
                }
              }}
              error={touched.toOwnerId && errors.toOwnerId}
              exclude={property?.owner ? [property.owner._id] : []} // Pass just the ID
            />

            <Input
              label="Transfer Reason"
              name="transferReason"
              type="textarea"
              rows={4}
              placeholder="Please provide the reason for this transfer..."
            />

            <Input
              label="Agreement Date"
              name="agreementDate"
              type="date"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        );

      case 1: // Documents
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500">
                      Upload required documents
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
            </div>

            {documents.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Uploaded Documents</h4>
                <ul className="mt-2 divide-y divide-gray-200">
                  {documents.map((doc, index) => (
                    <li key={index} className="py-2 flex justify-between items-center">
                      <span className="text-sm text-gray-500">{doc.name}</span>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 2: // Payment
        return (
          <div className="space-y-6">
            <Input
              label="Transfer Amount (SLE)"
              name="transferAmount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter transfer amount..."
            />

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="text-sm font-medium text-gray-900">Transfer Fees</h4>
              <dl className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Registration Fee</dt>
                  <dd className="text-sm font-medium text-gray-900">SLE 500</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Stamp Duty</dt>
                  <dd className="text-sm font-medium text-gray-900">SLE 200</dd>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <dt className="text-sm font-medium text-gray-900">Total Fees</dt>
                  <dd className="text-sm font-medium text-primary-600">SLE 700</dd>
                </div>
              </dl>
            </div>
          </div>
        );

      case 3: // Confirmation
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800">Transfer Summary</h4>
              <dl className="mt-4 space-y-2">
                {selectedUser && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">New Owner</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Transfer Amount</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    SLE {Number(values.transferAmount).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Registration Fee</dt>
                  <dd className="text-sm font-medium text-gray-900">SLE 500</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Stamp Duty</dt>
                  <dd className="text-sm font-medium text-gray-900">SLE 200</dd>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <dt className="text-sm font-medium text-gray-900">Total Amount</dt>
                  <dd className="text-sm font-medium text-primary-600">
                    SLE {(Number(values.transferAmount) + 700).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                By proceeding, you confirm that all provided information is correct and you agree to the transfer terms.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transfer Property</h1>
              <p className="mt-1 text-gray-500">
                Transferring: {property.title}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/properties/${id}`)}
              className="flex items-center"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Property
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Form Card */}
      <Card>
        <TransferStatus currentStep={currentStep} />
        <div className="p-6">
          <Formik
            initialValues={{
              toOwnerId: '',
              transferReason: '',
              agreementDate: '',
              transferAmount: '',
            }}
            validationSchema={validationSchemas[currentStep]}
            onSubmit={handleNextStep}
          >
            {(formikProps) => (
              <Form className="space-y-6">
                {renderStepContent(formikProps.values, formikProps)}

                <div className="flex justify-between pt-6 border-t">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      disabled={isSubmitting}
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="ml-auto"
                    disabled={isSubmitting}
                  >
                    {currentStep === 3 ? 'Complete Transfer' : 'Next Step'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Card>

      {/* Document Requirements Card */}
      {currentStep === 1 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Required Documents</h3>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Mandatory Documents</h4>
                  <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                    <li>Property deed or title</li>
                    <li>Proof of ownership</li>
                    <li>Government-issued ID</li>
                    <li>Transfer agreement</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Additional Documents</h4>
                  <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                    <li>Tax clearance certificate</li>
                    <li>Property valuation report</li>
                    <li>Survey plan (if available)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Information Card */}
      {currentStep === 2 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
            <div className="mt-4 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800">Payment Methods</h4>
                <ul className="mt-2 list-disc list-inside text-sm text-blue-700">
                  <li>Bank Transfer</li>
                  <li>Mobile Money</li>
                  <li>Certified Bank Check</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900">Important Notes</h4>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li>• All fees must be paid before the transfer can be completed</li>
                  <li>• Payment confirmation will be required for verification</li>
                  <li>• Transfer fees are non-refundable once the process begins</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Digital Signature Modal */}
      <DigitalSignatureModal
        isOpen={showSignatureModal}
        onClose={() => {
          if (!isSubmitting) {
            setShowSignatureModal(false);
          }
        }}
        onSignatureSave={handleSignatureSave}
        title="Sign Transfer Agreement"
        description={`Please provide your digital signature to authorize the transfer of ${property.title} to ${selectedUser?.firstName} ${selectedUser?.lastName}.`}
      />
    </div>
  );
};

export default Transfer;