import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import ApperIcon from "@/components/ApperIcon";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default coordinates for Massachusetts
const DEFAULT_COORDINATES = {
  massachusetts: [42.3601, -71.0589], // Boston
  center: [39.8283, -98.5795] // US center
};

// Validate location data
const isValidLocation = (location) => {
  if (!location) return false;
  const { city, state } = location;
  if (!city || !state) return false;
  
  // Check for generic/invalid addresses
  const invalidAddresses = [
    'service area',
    'greater boston',
    'boston area',
    'various locations',
    'tbd',
    'to be determined'
  ];
  
  const addressStr = `${location.address || ''} ${city}`.toLowerCase();
  return !invalidAddresses.some(invalid => addressStr.includes(invalid));
};

const MapDisplay = ({ 
  address, 
  city, 
  state, 
  zipCode, 
  title = 'Location',
  listings = [], // For multiple markers
  multipleMarkers = false,
  height = 'h-64',
  className = '' 
}) => {
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDINATES.massachusetts);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Construct full address for geocoding (single marker mode)
  const fullAddress = `${address ? address + ', ' : ''}${city}, ${state} ${zipCode}`;

  useEffect(() => {
    if (multipleMarkers && listings.length > 0) {
      geocodeMultipleListings();
    } else if (!multipleMarkers && city && state) {
      // Validate location before attempting geocoding
      const locationData = { address, city, state, zipCode };
      if (isValidLocation(locationData)) {
        geocodeSingleAddress();
      } else {
        // Use fallback for invalid locations
        setLoading(false);
        setError('Location information is incomplete or invalid');
        setMapCenter(DEFAULT_COORDINATES.massachusetts);
      }
    } else {
      setLoading(false);
      setError('No location data provided');
    }
  }, [address, city, state, zipCode, listings, multipleMarkers, retryCount]);

  // Geocode single address with comprehensive error handling
  const geocodeSingleAddress = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add delay to prevent rate limiting
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=us`,
        {
          headers: {
            'User-Agent': 'ClassiFlow-Pro/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding service unavailable (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        // Validate coordinates
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error('Invalid coordinates received');
        }
        
        setMapCenter([lat, lon]);
        setMarkers([{ 
          position: [lat, lon], 
          title: title,
          address: fullAddress 
        }]);
      } else {
        // Try fallback geocoding with just city, state
        const fallbackAddress = `${city}, ${state}`;
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackAddress)}&limit=1&countrycodes=us`,
          {
            headers: {
              'User-Agent': 'ClassiFlow-Pro/1.0'
            }
          }
        );
        
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.length > 0) {
          const lat = parseFloat(fallbackData[0].lat);
          const lon = parseFloat(fallbackData[0].lon);
          setMapCenter([lat, lon]);
          setMarkers([{
            position: [lat, lon],
            title: title,
            address: fallbackAddress
          }]);
        } else {
          throw new Error('Location not found');
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError(`Unable to locate address: ${err.message}`);
      
      // Use state-based fallback coordinates
      const stateCoordinates = getStateCoordinates(state);
      setMapCenter(stateCoordinates);
      setMarkers([{
        position: stateCoordinates,
        title: `${title} (Approximate)`,
        address: `${city}, ${state} (Location approximate)`
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Get approximate coordinates for a state
  const getStateCoordinates = (state) => {
    const stateCoords = {
      'MA': [42.3601, -71.0589], // Massachusetts
      'CA': [36.7783, -119.4179], // California
      'TX': [31.9686, -99.9018], // Texas
      'NY': [40.7128, -74.0060], // New York
      'FL': [27.7663, -82.6404], // Florida
    };
    
    return stateCoords[state?.toUpperCase()] || DEFAULT_COORDINATES.massachusetts;
  };

  // Geocode multiple listings with improved error handling
  const geocodeMultipleListings = async () => {
    setLoading(true);
    setError(null);
    const markers = [];
    let successCount = 0;
    
    try {
      for (const listing of listings) {
        if (!listing.location) continue;
        
        const { address, city, state, zipCode } = listing.location;
        
        // Skip invalid locations
        if (!isValidLocation(listing.location)) {
          console.warn(`Skipping invalid location for listing ${listing.Id}`);
          continue;
        }
        
        const listingAddress = `${address ? address + ', ' : ''}${city}, ${state} ${zipCode}`;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(listingAddress)}&limit=1&countrycodes=us`,
            {
              headers: {
                'User-Agent': 'ClassiFlow-Pro/1.0'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            
            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);
              
              if (!isNaN(lat) && !isNaN(lon)) {
                markers.push({
                  position: [lat, lon],
                  title: listing.title,
                  address: listingAddress,
                  listing: listing
                });
                successCount++;
              }
            }
          }
        } catch (err) {
          console.warn(`Failed to geocode listing ${listing.Id}:`, err);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      if (markers.length > 0) {
        setMarkers(markers);
        // Calculate center from successful markers
        const avgLat = markers.reduce((sum, m) => sum + m.position[0], 0) / markers.length;
        const avgLng = markers.reduce((sum, m) => sum + m.position[1], 0) / markers.length;
        setMapCenter([avgLat, avgLng]);
        
        if (successCount < listings.length) {
          setError(`Showing ${successCount} of ${listings.length} locations`);
        }
      } else {
        throw new Error('No locations could be found');
      }
    } catch (err) {
      console.error('Multiple geocoding error:', err);
      setError(`Unable to load map locations: ${err.message}`);
      // Use default center when all geocoding fails
      setMapCenter(DEFAULT_COORDINATES.massachusetts);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const renderMarkers = () => {
    return markers.map((marker, index) => (
      <Marker key={index} position={marker.position}>
        <Popup>
          <div className="text-sm">
            <h3 className="font-semibold mb-1">{marker.title}</h3>
            <p className="text-gray-600">{marker.address}</p>
            {marker.listing && (
              <div className="mt-2">
                <p className="font-medium text-primary">
                  {marker.listing.price 
                    ? `$${marker.listing.price.toLocaleString()}` 
                    : 'Contact for Price'
                  }
                </p>
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    ));
  };

  if (loading) {
return (
      <div className={`${height} ${className} bg-surface-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-surface-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  if (error && markers.length === 0) {
    return (
      <div className={`${height} ${className} bg-surface-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-surface-500 p-4">
          <ApperIcon name="MapPin" size={48} className="mx-auto mb-2 text-surface-400" />
          <p className="text-red-600 mb-3 text-sm">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={handleRetry}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              Retry Location
            </button>
            <p className="text-xs text-surface-400">
              Map will show approximate location
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${height} ${className} rounded-lg overflow-hidden border border-surface-200`}>
      {error && markers.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-3 py-2">
          <p className="text-yellow-800 text-xs">
            <ApperIcon name="AlertTriangle" size={14} className="inline mr-1" />
            {error}
          </p>
        </div>
      )}
      <MapContainer
center={mapCenter}
        zoom={multipleMarkers ? (markers.length > 1 ? 10 : 13) : 13}
        style={{ height: '100%', width: '100%' }}
        key={`${mapCenter[0]}-${mapCenter[1]}`} // Force re-render on center change
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {renderMarkers()}
      </MapContainer>
    </div>
  );
};

export default MapDisplay;