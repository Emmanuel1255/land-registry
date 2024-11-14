import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

const Properties = () => {
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [allProperties, setAllProperties] = useState([]); // Store all properties
  const [filteredProperties, setFilteredProperties] = useState([]); // Store filtered properties
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  
  const navigate = useNavigate();

  // Fetch properties only once on component mount
  useEffect(() => {
    fetchProperties();
  }, []); 

  // Apply filters whenever filter values or allProperties change
  useEffect(() => {
    filterProperties();
  }, [verificationFilter, typeFilter, allProperties]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(
        `https://land-registry-backend.onrender.com/api/properties`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const data = await response.json();
      setAllProperties(data.properties);
      setFilteredProperties(data.properties); // Initialize filtered properties with all properties
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (err) {
      setError(err.message);
      if (err.message.includes('unauthorized') || err.message.includes('token')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to filter properties
  const filterProperties = () => {
    let filtered = [...allProperties];

    // Apply verification status filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(property => 
        property.verificationStatus === verificationFilter
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(property => 
        property.type === typeFilter
      );
    }

    setFilteredProperties(filtered);
    // Update pagination total
    setPagination(prev => ({
      ...prev,
      total: filtered.length
    }));
  };

  const handleDocumentView = async (documentUrl) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(documentUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        window.open(documentUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  const PropertyCard = ({ property }) => {
    const statusColors = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      unverified: 'bg-red-100 text-red-800'
    };
  
    // Find the main image from the images array
    const mainImage = property.images?.find(img => img.isMain)?.url;
  
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <div className="relative">
          <img
            src={mainImage || "/Land/land2.jpg"}
            alt={property.title}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => {
              e.target.src = "/api/placeholder/400/320";
            }}
          />
          <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.verificationStatus]}`}>
            {property.verificationStatus}
          </span>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">{property.title}</h3>
          <div className="mt-2 space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 mr-2" />
              {property.location.area}, {property.location.city}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <HomeIcon className="h-4 w-4 mr-2" />
              {property.size} sq. meters
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Registered: {new Date(property.registrationDate).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <TagIcon className="h-4 w-4 mr-2" />
              SLE {property.price.toLocaleString()}
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center gap-2">
            <Link 
              to={`/properties/${property._id}`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex-1"
            >
              View Details
            </Link>
            {property.documents.length > 0 && (
              <button
                onClick={() => handleDocumentView(property.documents[0].url)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex-1"
              >
                View Documents
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={fetchProperties}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-sm text-gray-500">Total: {pagination.total} properties</p>
        </div>
        <Button as={Link} to="/register-land">
          Register New Property
        </Button>
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        {/* Verification Status Filters */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Verification Status:</span>
          <div className="flex space-x-2">
            <Button
              variant={verificationFilter === 'all' ? 'primary' : 'outline'}
              onClick={() => setVerificationFilter('all')}
            >
              All
            </Button>
            <Button
              variant={verificationFilter === 'verified' ? 'primary' : 'outline'}
              onClick={() => setVerificationFilter('verified')}
            >
              Verified
            </Button>
            <Button
              variant={verificationFilter === 'unverified' ? 'primary' : 'outline'}
              onClick={() => setVerificationFilter('unverified')}
            >
              Unverified
            </Button>
          </div>
        </div>

        {/* Property Type Filters */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Type:</span>
          <div className="flex space-x-2">
            <Button
              variant={typeFilter === 'all' ? 'primary' : 'outline'}
              onClick={() => setTypeFilter('all')}
            >
              All Types
            </Button>
            <Button
              variant={typeFilter === 'residential' ? 'primary' : 'outline'}
              onClick={() => setTypeFilter('residential')}
            >
              Residential
            </Button>
            <Button
              variant={typeFilter === 'commercial' ? 'primary' : 'outline'}
              onClick={() => setTypeFilter('commercial')}
            >
              Commercial
            </Button>
            <Button
              variant={typeFilter === 'agricultural' ? 'primary' : 'outline'}
              onClick={() => setTypeFilter('agricultural')}
            >
              Agricultural
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(verificationFilter !== 'all' || typeFilter !== 'all') && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FunnelIcon className="h-4 w-4" />
            <span>Active Filters:</span>
            {verificationFilter !== 'all' && (
              <span className="px-2 py-1 bg-gray-100 rounded-full">
                Verification: {verificationFilter}
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="px-2 py-1 bg-gray-100 rounded-full">
                Type: {typeFilter}
              </span>
            )}
          </div>
        )}
      </div>

      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No properties found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;