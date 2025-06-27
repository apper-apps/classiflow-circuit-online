import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ApperIcon from '@/components/ApperIcon';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapDisplay = ({ 
  address, 
  city, 
  state, 
  zipCode, 
  title, 
  className = '', 
  listings = [], 
  onMarkerClick = null, 
  multipleMarkers = false 
}) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markersData, setMarkersData] = useState([]);

  // Construct full address for geocoding (single marker mode)
  const fullAddress = `${address ? address + ', ' : ''}${city}, ${state} ${zipCode}`;
useEffect(() => {
    if (multipleMarkers && listings.length > 0) {
      // Geocode multiple listings
      geocodeMultipleListings();
    } else if (!multipleMarkers && city && state) {
      // Single marker mode
      geocodeSingleAddress();
    }
  }, [multipleMarkers, listings, fullAddress]);

  const geocodeSingleAddress = async () => {
    if (!city || !state) {
      setError('Insufficient location data');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          setCoordinates([lat, lon]);
        } else {
          throw new Error('Invalid coordinates received');
        }
      } else {
        throw new Error('Location not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load map');
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const geocodeMultipleListings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const markers = [];
      
      for (const listing of listings) {
        const { address, city, state, zipCode } = listing.location;
        const listingAddress = `${address ? address + ', ' : ''}${city}, ${state} ${zipCode}`;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(listingAddress)}&limit=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);
              
              if (!isNaN(lat) && !isNaN(lon)) {
                markers.push({
                  position: [lat, lon],
                  listing: listing
                });
              }
            }
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.warn('Failed to geocode listing:', listing.Id, err);
        }
      }
      
      if (markers.length > 0) {
        setMarkersData(markers);
        // Set center to first marker
        setCoordinates(markers[0].position);
      } else {
        setError('No locations could be found');
      }
    } catch (err) {
      setError('Failed to load map locations');
      console.error('Multiple geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-surface-100 rounded-lg h-64 flex items-center justify-center ${className}`}>
        <div className="text-center space-y-2">
          <div className="animate-spin">
            <ApperIcon name="Loader2" size={24} className="text-surface-500" />
          </div>
          <p className="text-sm text-surface-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-surface-100 rounded-lg h-64 flex items-center justify-center ${className}`}>
        <div className="text-center space-y-2">
          <ApperIcon name="MapPinOff" size={24} className="text-surface-400" />
          <p className="text-sm text-surface-600">Map unavailable</p>
        </div>
      </div>
    );
  }

  if (!coordinates) {
    return null;
  }

const renderMarkers = () => {
    if (multipleMarkers && markersData.length > 0) {
      return markersData.map((marker, index) => (
        <Marker 
          key={marker.listing.Id} 
          position={marker.position}
          eventHandlers={{
            click: () => {
              if (onMarkerClick) {
                onMarkerClick(marker.listing);
              }
            }
          }}
        >
          <Popup>
            <div className="text-center max-w-xs">
              <p className="font-medium text-sm mb-1">{marker.listing.title}</p>
              <p className="text-xs text-surface-600 mb-2">
                {marker.listing.location.address && `${marker.listing.location.address}, `}
                {marker.listing.location.city}, {marker.listing.location.state}
              </p>
              {marker.listing.customData?.saleDate && (
                <p className="text-xs text-primary font-medium">
                  {new Date(marker.listing.customData.saleDate).toLocaleDateString()} 
                  {marker.listing.customData.startTime && 
                    ` • ${marker.listing.customData.startTime}`
                  }
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ));
    } else if (!multipleMarkers && coordinates) {
      return (
        <Marker position={coordinates}>
          <Popup>
            <div className="text-center">
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-surface-600 mt-1">{fullAddress}</p>
            </div>
          </Popup>
        </Marker>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-lg overflow-hidden border border-surface-200 ${className}`}>
      <MapContainer
        center={coordinates}
        zoom={multipleMarkers ? 12 : 15}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {renderMarkers()}
      </MapContainer>
    </div>
  );
};

export default MapDisplay;