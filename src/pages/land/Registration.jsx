// src/pages/land/Registration.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import axios from 'axios'
import {
    DocumentPlusIcon,
    MapPinIcon,
    UserIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import PropertyImageUpload from '../../components/PropertyImageUpload'

const API_URL = 'http://localhost:5004/api'

const mapContainerStyle = {
    width: '100%',
    height: '100%',
}

const defaultCenter = {
    lat: 8.4657,
    lng: -13.2317,
}

const steps = [
    {
        id: 'property-details',
        name: 'Property Details',
        icon: DocumentPlusIcon,
        description: 'Basic information about the property',
    },
    {
        id: 'location',
        name: 'Location',
        icon: MapPinIcon,
        description: 'Property location and boundaries',
    },
    // {
    //     id: 'ownership',
    //     name: 'Ownership',
    //     icon: UserIcon,
    //     description: 'Current ownership details',
    // },
    {
        id: 'payment',
        name: 'Payment',
        icon: CurrencyDollarIcon,
        description: 'Registration fees and payment',
    },
]

const validationSchemas = {
    'property-details': Yup.object({
        title: Yup.string().required('Property title is required'),
        propertyType: Yup.string().required('Property type is required'),
        propertySize: Yup.number().required('Property size is required').positive('Must be a positive number'),
        propertyDescription: Yup.string().required('Description is required'),
        price: Yup.number().required('Price is required').positive('Must be a positive number'),
    }),
    'location': Yup.object({
        streetAddress: Yup.string().required('Street address is required'),
        city: Yup.string().required('City is required'),
        district: Yup.string().required('District is required'),
        coordinates: Yup.string().required('Coordinates are required'),
    }),
    // 'ownership': Yup.object({
    //     ownerName: Yup.string().required('Owner name is required'),
    //     ownerIdentification: Yup.string().required('Owner ID is required'),
    //     ownerContact: Yup.string().required('Contact information is required'),
    // }),
    'payment': Yup.object({
        paymentMethod: Yup.string().required('Payment method is required'),
        amount: Yup.number().required('Amount is required').positive('Must be a positive number'),
    }),
}

const initialValues = {
    // Property Details
    title: '',
    propertyType: '',
    propertySize: '',
    propertyDescription: '',
    price: '',
    // Location
    streetAddress: '',
    city: '',
    district: '',
    coordinates: '',
    // Ownership
    // ownerName: '',
    // ownerIdentification: '',
    // ownerContact: '',
    // Payment
    paymentMethod: '',
    amount: '',
}

const LandRegistration = () => {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(0)
    const [files, setFiles] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedDocumentType, setSelectedDocumentType] = useState('')
    const handleDocumentTypeChange = (event) => {
        setSelectedDocumentType(event.target.value)
    }

    const handleFileChange = (event) => {
        if (!selectedDocumentType) {
            toast.error('Please select a document type first');
            return;
        }

        const newFiles = Array.from(event.target.files).map(file => ({
            file,
            type: selectedDocumentType
        }));

        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index))
    }

    const prepareFormData = (values) => {
        const formData = new FormData()

        // Add basic property details
        formData.append('title', values.title)
        formData.append('type', values.propertyType)
        formData.append('size', values.propertySize)
        formData.append('description', values.propertyDescription)
        formData.append('price', values.price)

        // Add location fields
        formData.append('location[address]', values.streetAddress)
        formData.append('location[area]', values.district)
        formData.append('location[city]', values.city)
        if (values.coordinates) {
            const [lat, lng] = values.coordinates.split(',').map(coord => parseFloat(coord.trim()))
            formData.append('location[coordinates][lat]', lat)
            formData.append('location[coordinates][lng]', lng)
        }

        // Add files with correct field names
        files.forEach((fileObj) => {
            // Map the file type to the correct field name
            let fieldName;
            switch (fileObj.type) {
                case 'deed':
                    fieldName = 'deed';
                    break;
                case 'survey':
                    fieldName = 'surveyPlan';
                    break;
                case 'tax':
                    fieldName = 'tax';
                    break;
                case 'identity':
                    fieldName = 'identity';
                    break;
                case 'images':
                    fieldName = 'images';
                    break;
                default:
                    fieldName = 'other';
            }
            formData.append(fieldName, fileObj.file);
        });

        return formData
    }




    const renderStepContent = (step, values, errors, touched, handleChange, handleBlur) => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-4">
                        <Input
                            label="Property Title"
                            name="title"
                            type="text"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.title}
                            error={touched.title && errors.title}
                        />

<PropertyImageUpload
    onImageSelect={(files) => {
        const imageFiles = files.map(file => ({
            file,
            type: 'images'  // This should match the backend configuration
        }));
        setFiles(prev => [...prev, ...imageFiles]);
    }}
    onImageRemove={(index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    }}
/>

                        <Input
                            label="Property Type"
                            name="propertyType"
                            type="select"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.propertyType}
                            error={touched.propertyType && errors.propertyType}
                        >
                            <option value="">Select property type</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="agricultural">Agricultural</option>
                        </Input>

                        <Input
                            label="Property Size (sq. meters)"
                            name="propertySize"
                            type="number"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.propertySize}
                            error={touched.propertySize && errors.propertySize}
                        />

                        <Input
                            label="Price (SLE)"
                            name="price"
                            type="number"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.price}
                            error={touched.price && errors.price}
                        />

                        <Input
                            label="Property Description"
                            name="propertyDescription"
                            type="textarea"
                            rows={4}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.propertyDescription}
                            error={touched.propertyDescription && errors.propertyDescription}
                        />

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Select Document Type
                            </label>
                            <select
                                className="mt-2 block w-full border-gray-300 rounded-md shadow-sm"
                                value={selectedDocumentType}
                                onChange={handleDocumentTypeChange}
                            >
                                <option value="">Select type</option>
                                <option value="deed">Deed</option>
                                <option value="surveyPlan">Survey Plan</option>
                                <option value="tax">Tax Document</option>
                                <option value="identity">Owner Identification</option>
                                <option value="images">Property Images</option>
                                <option value="other">Other</option>
                            </select>



                            <label className="block text-sm font-medium text-gray-700 mt-4">
                                Upload Files
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <input
                                        id="file-upload"
                                        name={selectedDocumentType} // This should match the names in uploadConfigs
                                        type="file"
                                        onChange={handleFileChange}
                                        disabled={!selectedDocumentType}
                                    // className="sr-only"
                                    />

                                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                </div>
                            </div>

                            {files.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
                                    <div className="mt-2 space-y-2">
                                        {files.map((fileObj, index) => (
                                            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                                                <span className="text-sm text-gray-500">{fileObj.file.name} ({fileObj.type})</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )

            case 1:
                return (
                    <div className="space-y-4">
                        <Input
                            label="Street Address"
                            name="streetAddress"
                            type="text"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.streetAddress}
                            error={touched.streetAddress && errors.streetAddress}
                        />

                        <Input
                            label="City"
                            name="city"
                            type="text"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.city}
                            error={touched.city && errors.city}
                        />

                        <Input
                            label="District"
                            name="district"
                            type="select"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.district}
                            error={touched.district && errors.district}
                        >
                            <option value="">Select district</option>
                            <option value="western-urban">Western Urban</option>
                            <option value="western-rural">Western Rural</option>
                        </Input>

                        <Input
                            label="GPS Coordinates"
                            name="coordinates"
                            type="text"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.coordinates}
                            error={touched.coordinates && errors.coordinates}
                            placeholder="e.g., 8.4657, -13.2317"
                        />

                        {/* Google Map Component */}
                        <div className="mt-4 border-2 border-gray-300 rounded-lg h-64">
                            <LoadScript googleMapsApiKey="AIzaSyBNUzq6RhAtEfqdLDJwKsZj0zVqezc9hyA">
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={defaultCenter}
                                    zoom={15}
                                    onClick={(e) => {
                                        const lat = e.latLng.lat()
                                        const lng = e.latLng.lng()
                                        handleChange({
                                            target: {
                                                name: 'coordinates',
                                                value: `${lat}, ${lng}`,
                                            },
                                        })
                                    }}
                                >
                                    <Marker position={defaultCenter} />
                                </GoogleMap>
                            </LoadScript>
                        </div>
                    </div>
                )

            // case 2:
            //     return (
            //         <div className="space-y-4">
            //             <Input
            //                 label="Owner's Full Name"
            //                 name="ownerName"
            //                 type="text"
            //                 onChange={handleChange}
            //                 onBlur={handleBlur}
            //                 value={values.ownerName}
            //                 error={touched.ownerName && errors.ownerName}
            //             />

            //             <Input
            //                 label="Owner's ID Number"
            //                 name="ownerIdentification"
            //                 type="text"
            //                 onChange={handleChange}
            //                 onBlur={handleBlur}
            //                 value={values.ownerIdentification}
            //                 error={touched.ownerIdentification && errors.ownerIdentification}
            //             />

            //             <Input
            //                 label="Contact Information"
            //                 name="ownerContact"
            //                 type="text"
            //                 onChange={handleChange}
            //                 onBlur={handleBlur}
            //                 value={values.ownerContact}
            //                 error={touched.ownerContact && errors.ownerContact}
            //             />
            //         </div>
            //     )

            case 2:
                return (
                    <div className="space-y-4">
                        <Input
                            label="Payment Method"
                            name="paymentMethod"
                            type="select"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.paymentMethod}
                            error={touched.paymentMethod && errors.paymentMethod}
                        >
                            <option value="">Select payment method</option>
                            <option value="bank-transfer">Bank Transfer</option>
                            <option value="mobile-money">Mobile Money</option>
                            <option value="credit-card">Credit Card</option>
                        </Input>

                        <Input
                            label="Amount (SLE)"
                            name="amount"
                            type="number"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.amount}
                            error={touched.amount && errors.amount}

                            defaultValue="5000"
                        />
                    </div>
                )

            default:
                return null
        }
    }

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setIsSubmitting(true)
            const token = localStorage.getItem('token')

            const formData = prepareFormData(values)

            // For debugging - log the FormData contents
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1])
            }

            const response = await axios.post(`${API_URL}/properties`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            toast.success('Land registration submitted successfully!')
            navigate(`/properties/${response.data._id}`)
        } catch (error) {
            console.error('Registration error:', error.response?.data || error)
            toast.error(error.response?.data?.message || 'Failed to submit land registration')
        } finally {
            setIsSubmitting(false)
            setSubmitting(false)
        }
    }

    const validateStep = async (values) => {
        try {
            await validationSchemas[steps[currentStep].id].validate(values, { abortEarly: false })
            return true
        } catch (error) {
            const errors = {}
            error.inner.forEach((err) => {
                errors[err.path] = err.message
            })
            toast.error('Please fill in all required fields correctly')
            return false
        }
    }

    const handleNextStep = async (values) => {
        const isValid = await validateStep(values)
        if (isValid && currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Register New Land</h1>
                    <p className="mt-1 text-gray-500">
                        Complete the form below to register a new land property.
                    </p>
                </div>
            </Card>

            {/* Progress Steps */}
            <Card className="mb-6">
                <div className="p-6">
                    <nav aria-label="Progress">
                        <ol className="flex items-center">
                            {steps.map((step, index) => (
                                <li
                                    key={step.id}
                                    className={`${index !== steps.length - 1 ? 'flex-1' : ''
                                        } relative`}
                                >
                                    <div className="flex items-center">
                                        <span
                                            className={`flex items-center justify-center w-10 h-10 rounded-full ${index < currentStep
                                                ? 'bg-primary-600'
                                                : index === currentStep
                                                    ? 'bg-primary-600'
                                                    : 'bg-gray-200'
                                                }`}
                                        >
                                            <step.icon
                                                className={`w-5 h-5 ${index <= currentStep ? 'text-white' : 'text-gray-500'
                                                    }`}
                                            />
                                        </span>
                                        {index !== steps.length - 1 && (
                                            <div
                                                className={`flex-1 h-0.5 ${index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                                                    }`}
                                            />
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-sm font-medium text-gray-900">
                                            {step.name}
                                        </span>
                                        <p className="text-xs text-gray-500">{step.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>
            </Card>

            {/* Form */}
            <Card>
                <div className="p-6">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchemas[steps[currentStep].id]}
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                            <Form>
                                {renderStepContent(
                                    currentStep,
                                    values,
                                    errors,
                                    touched,
                                    handleChange,
                                    handleBlur
                                )}

                                <div className="mt-6 flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                        disabled={currentStep === 0 || isSubmitting}
                                    >
                                        Previous
                                    </Button>

                                    <Button
                                        type={currentStep === steps.length - 1 ? 'submit' : 'button'}
                                        onClick={() => {
                                            if (currentStep < steps.length - 1) {
                                                handleNextStep(values)
                                            }
                                        }}
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                    >
                                        {currentStep === steps.length - 1 ? 'Submit Registration' : 'Next Step'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Card>

            {/* Summary Panel */}
            <Card className="mt-6">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Registration Summary</h2>
                    <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Required Documents</h3>
                                <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                                    <li>Property deed or title</li>
                                    <li>Survey plan</li>
                                    <li>Owner's identification</li>
                                    <li>Tax clearance certificate</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Fees Breakdown</h3>
                                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                                    <li className="flex justify-between">
                                        <span>Registration Fee</span>
                                        <span>SLE 3,000</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Processing Fee</span>
                                        <span>SLE 1,500</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Stamp Duty</span>
                                        <span>SLE 500</span>
                                    </li>
                                    <li className="flex justify-between font-medium border-t pt-2">
                                        <span>Total</span>
                                        <span>SLE 5,000</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default LandRegistration
