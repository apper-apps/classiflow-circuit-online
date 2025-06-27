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

const MapDisplay = ({ address, city, state, zipCode, title, className = '' }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Construct full address for geocoding
  const fullAddress = `${address ? address + ', ' : ''}${city}, ${state} ${zipCode}`;

  useEffect(() => {
    const geocodeAddress = async () => {
      if (!city || !state) {
        setError('Insufficient location data');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Using Nominatim (OpenStreetMap) geocoding service
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

    geocodeAddress();
  }, [fullAddress]);

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

  return (
    <div className={`rounded-lg overflow-hidden border border-surface-200 ${className}`}>
      <MapContainer
        center={coordinates}
        zoom={15}
        style={{ height: '300px', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={coordinates}>
          <Popup>
            <div className="text-center">
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-surface-600 mt-1">{fullAddress}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapDisplay;