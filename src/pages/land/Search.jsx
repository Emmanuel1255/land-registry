import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  HomeIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    priceRange: 'all',
    verificationStatus: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  // Add debounce to prevent too many API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProperties();
    }, 500); // Delay of 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // Build query string - remove title search
      let queryParams = new URLSearchParams();
      if (filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.verificationStatus !== 'all') queryParams.append('verificationStatus', filters.verificationStatus);
      if (filters.priceRange !== 'all') {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (min) queryParams.append('minPrice', min);
        if (max) queryParams.append('maxPrice', max);
      }

      const response = await fetch(
        `https://land-registry-backend.onrender.com/api/properties/search?${queryParams.toString()}`,
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
      setProperties(data.properties);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProperties = () => {
    if (!searchTerm) return properties;

    return properties.filter(property =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };



  const PropertyCard = ({ property }) => {
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
          <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium 
            ${property.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
              property.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'}`}
          >
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
              <TagIcon className="h-4 w-4 mr-2" />
              SLE {property.price.toLocaleString()}
            </div>
          </div>
          <div className="mt-4">
            <Link
              to={`/properties/${property._id}`}
              className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View Details
            </Link>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Search Properties</h1>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
          Filters
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by property title..."
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Type</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agricultural">Agricultural</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price Range</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              >
                <option value="all">All Prices</option>
                <option value="0-100000">Under SLE 100,000</option>
                <option value="100000-500000">SLE 100,000 - 500,000</option>
                <option value="500000">Above SLE 500,000</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Status</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={filters.verificationStatus}
                onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchProperties}>Try Again</Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {getFilteredProperties().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No properties found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredProperties().map(property => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;