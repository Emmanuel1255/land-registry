// src/pages/land/VerificationDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircleIcon,
    DocumentTextIcon,
    UserIcon,
    CalendarIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { toast } from 'react-toastify';

const VerificationDetails = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const [verification, setVerification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [property, setProperty] = useState(null);

    useEffect(() => {
        fetchVerificationDetails();
    }, [propertyId]);

    const fetchVerificationDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://land-registry-backend.onrender.com/api/verification/property/${propertyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch verification details');
            }

            const data = await response.json();
            setVerification(data);

            // Fetch property details
            const propertyResponse = await fetch(`https://land-registry-backend.onrender.com/api/properties/${propertyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (propertyResponse.ok) {
                const propertyData = await propertyResponse.json();
                setProperty(propertyData);
            }
        } catch (error) {
            toast.error('Failed to fetch verification details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (!verification) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Verification not found</h2>
                <p className="mt-2 text-gray-500">No verification details available for this property.</p>
            </div>
        );
    }

    const getVerifierName = (verification) => {
        if (!verification) return 'N/A';

        if (verification.verifier) {
            const firstName = verification.verifier.firstName || '';
            const lastName = verification.verifier.lastName || '';
            return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'N/A';
        }

        return verification.verifierId ? `Verifier ID: ${verification.verifierId}` : 'System Verification';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Verification Details
                            </h1>
                            {property && (
                                <p className="mt-1 text-gray-500">
                                    Property: {property.title}
                                </p>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/properties/${propertyId}`)}
                            className="flex items-center"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Back to Property
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Verification Information */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Information</h2>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">LS Number</p>
                                <p className="text-base text-gray-900">{verification.lsNumber}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Page Number</p>
                                    <p className="text-base text-gray-900">{verification.pageNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Volume Number</p>
                                    <p className="text-base text-gray-900">{verification.volumeNumber}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Verified By</p>
                                <p className="text-base text-gray-900">
                                    {getVerifierName(verification)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Verification Date</p>
                                <p className="text-base text-gray-900">
                                    {new Date(verification.verificationDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Verification Checks */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Checks</h2>
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">Survey Plan</p>
                                    <p className="text-sm text-green-700">
                                        Survey plan has been verified successfully
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">OARG Records</p>
                                    <p className="text-sm text-green-700">
                                        OARG records have been verified successfully
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">Legal Verification</p>
                                    <p className="text-sm text-green-700">
                                        Legal verification completed successfully
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Verification Documents */}
            {verification.documents && verification.documents.length > 0 && (
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Documents</h2>
                        <div className="space-y-3">
                            {verification.documents.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <span className="text-sm text-gray-900">{doc.name || doc.type}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(doc.url, '_blank')}
                                    >
                                        View
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default VerificationDetails;