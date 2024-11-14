import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Add this import
import {
    MapPinIcon,
    HomeIcon,
    CalendarIcon,
    UserIcon,
    PhoneIcon,
    DocumentTextIcon,
    CheckBadgeIcon,
    ExclamationCircleIcon,
    ClockIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentUser = useSelector((state) => state.auth.user); // Get current user from Redux store
    console.log("CurrentUder",currentUser);

    useEffect(() => {
        fetchPropertyDetails();
    }, [id]);

    const fetchPropertyDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`https://land-registry-backend.onrender.com/api/properties/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch property details');
            }

            const data = await response.json();
            setProperty(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Check if current user is the owner
    const isOwner = currentUser && property?.owner?._id === currentUser._id;
    console.log("isOwner",property?.owner?._id);

    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            verified: {
                icon: CheckBadgeIcon,
                text: 'Verified',
                className: 'bg-green-100 text-green-800',
            },
            unverified: {
                icon: ExclamationCircleIcon,
                text: 'Unverified',
                className: 'bg-red-100 text-red-800',
            },
            pending: {
                icon: ClockIcon,
                text: 'Verification Pending',
                className: 'bg-yellow-100 text-yellow-800',
            },
        };

        const config = statusConfig[status] || statusConfig.unverified;
        const Icon = config.icon;

        return (
            <div className={`flex items-center px-3 py-1 rounded-full ${config.className}`}>
                <Icon className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">{config.text}</span>
            </div>
        );
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-red-600">Error</h2>
                <p className="mt-2 text-gray-500">{error}</p>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Property not found</h2>
                <p className="mt-2 text-gray-500">The property you're looking for doesn't exist.</p>
            </div>
        );
    }

    // Find main image
    const mainImage = property.images?.find(img => img.isMain)?.url;

    return (
        <div className="space-y-6">
            {/* Property Header */}
            <Card>
                <div className="relative h-64 sm:h-96">
                    <img
                        src={mainImage || "/Land/land2.jpg"}
                        alt={property.title}
                        className="w-full h-full object-cover rounded-t-lg"
                        onError={(e) => {
                            e.target.src = "/api/placeholder/400/320";
                        }}
                    />
                    <div className="absolute top-4 right-4">
                        <StatusBadge status={property.verificationStatus} />
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                            <p className="mt-1 text-gray-500">{property.description}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-primary-600">
                                SLE {property.price.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex space-x-4">
                        {property.verificationStatus === 'verified' ? (
                            <Button
                                onClick={() => navigate(`/verification-details/${property._id}`)}
                                className="flex items-center"
                            >
                                <CheckBadgeIcon className="w-5 h-5 mr-2" />
                                See Verification
                            </Button>
                        ) : (
                            <Button
                                onClick={() => navigate(`/verification/${property._id}`)}
                                className="flex items-center"
                            >
                                <CheckBadgeIcon className="w-5 h-5 mr-2" />
                                Verify Property
                            </Button>
                        )}
                        {/* Only show transfer button if user is the owner */}
                        {isOwner && (
                            <Button
                                onClick={() => navigate(`/properties/${property._id}/transfer`)}
                                variant="outline"
                                className="flex items-center"
                            >
                                <ArrowRightIcon className="w-5 h-5 mr-2" />
                                Transfer Property
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Rest of the component remains the same */}
            {/* Verification Status Card */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <CheckBadgeIcon className="w-6 h-6 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Property Verification</p>
                                    <p className="text-sm text-gray-500">
                                        {property.verificationStatus === 'verified'
                                            ? 'This property has been verified and confirmed authentic'
                                            : 'Property requires verification of documents and ownership'}
                                    </p>
                                </div>
                            </div>
                            <StatusBadge status={property.verificationStatus} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Information */}
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Property Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <HomeIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Property Type</p>
                                    <p className="text-base text-gray-900">{property.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Location</p>
                                    <p className="text-base text-gray-900">
                                        {property.location.address}, {property.location.area}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Registration Date</p>
                                    <p className="text-base text-gray-900">
                                        {new Date(property.registrationDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Owner Information */}
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Owner Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Owner Name</p>
                                    <p className="text-base text-gray-900">
                                        {property.owner.firstName} {property.owner.lastName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Contact</p>
                                    <p className="text-base text-gray-900">{property.owner.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Documents */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Documents</h2>
                    <div className="space-y-3">
                        {property.documents.map((doc, index) => (
                            <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-sm text-gray-900">{doc.name}</span>
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
        </div>
    );
};

export default PropertyDetails;