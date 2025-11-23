"use client";

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GoogleMapViewProps {
  city: string;
}

// Fallback coordinates database for common cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // North America
  'New York': { lat: 40.7128, lng: -74.0060 },
  'New York, USA': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Toronto': { lat: 43.6532, lng: -79.3832 },
  'Toronto, Canada': { lat: 43.6532, lng: -79.3832 },
  'Vancouver': { lat: 49.2827, lng: -123.1207 },
  'Montreal': { lat: 45.5017, lng: -73.5673 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  
  // Europe
  'London': { lat: 51.5074, lng: -0.1278 },
  'London, UK': { lat: 51.5074, lng: -0.1278 },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'Paris, France': { lat: 48.8566, lng: 2.3522 },
  'Berlin': { lat: 52.5200, lng: 13.4050 },
  'Madrid': { lat: 40.4168, lng: -3.7038 },
  'Rome': { lat: 41.9028, lng: 12.4964 },
  'Amsterdam': { lat: 52.3676, lng: 4.9041 },
  'Barcelona': { lat: 41.3851, lng: 2.1734 },
  'Vienna': { lat: 48.2082, lng: 16.3738 },
  'Munich': { lat: 48.1351, lng: 11.5820 },
  'Munich, Germany': { lat: 48.1351, lng: 11.5820 },
  'Prague': { lat: 50.0755, lng: 14.4378 },
  'Lisbon': { lat: 38.7223, lng: -9.1393 },
  'Istanbul': { lat: 41.0082, lng: 28.9784 },
  'Istanbul, Turkey': { lat: 41.0082, lng: 28.9784 },
  
  // Asia
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Tokyo, Japan': { lat: 35.6762, lng: 139.6503 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Hong Kong': { lat: 22.3193, lng: 114.1694 },
  'Seoul': { lat: 37.5665, lng: 126.9780 },
  'Bangkok': { lat: 13.7563, lng: 100.5018 },
  'Dubai': { lat: 25.2048, lng: 55.2708 },
  'Dubai, UAE': { lat: 25.2048, lng: 55.2708 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  'New Delhi, India': { lat: 28.6139, lng: 77.2090 },
  'Lahore': { lat: 31.5497, lng: 74.3436 },
  'Lahore, Pakistan': { lat: 31.5497, lng: 74.3436 },
  'Kuwait': { lat: 29.3759, lng: 47.9774 },
  'Kuwait City': { lat: 29.3759, lng: 47.9774 },
  'Kuwait, Kuwait': { lat: 29.3759, lng: 47.9774 },
  'Shanghai': { lat: 31.2304, lng: 121.4737 },
  'Beijing': { lat: 39.9042, lng: 116.4074 },
  
  // Oceania
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Sydney, Australia': { lat: -33.8688, lng: 151.2093 },
  'Melbourne': { lat: -37.8136, lng: 144.9631 },
  'Auckland': { lat: -36.8485, lng: 174.7633 },
  
  // South America
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
  'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
  'Lima': { lat: -12.0464, lng: -77.0428 },
  
  // Africa
  'Cairo': { lat: 30.0444, lng: 31.2357 },
  'Cape Town': { lat: -33.9249, lng: 18.4241 },
  'Johannesburg': { lat: -26.2041, lng: 28.0473 },
  'Lagos': { lat: 6.5244, lng: 3.3792 },
};

export const GoogleMapView = ({ city }: GoogleMapViewProps) => {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapKey, setMapKey] = useState(0); // Force map re-render on city change
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchCoordinates = async () => {
      const normalizedCity = city.trim();
      
      // Try fallback database first for instant loading
      let coords = CITY_COORDINATES[normalizedCity];
      
      // Try without country suffix
      if (!coords) {
        const cityOnly = normalizedCity.split(',')[0].trim();
        coords = CITY_COORDINATES[cityOnly];
      }
      
      // Try case-insensitive match
      if (!coords) {
        const cityLower = normalizedCity.toLowerCase();
        const matchedKey = Object.keys(CITY_COORDINATES).find(key => 
          key.toLowerCase() === cityLower || 
          key.toLowerCase().split(',')[0].trim() === cityLower
        );
        if (matchedKey) {
          coords = CITY_COORDINATES[matchedKey];
        }
      }
      
      // If found in database, use it immediately
      if (coords) {
        setCoordinates(coords);
        setMapKey(prev => prev + 1);
        console.log('🗺️ Map coordinates from database:', { 
          city: normalizedCity, 
          coords,
          found: true 
        });
        return;
      }
      
      // If not in database and API key available, try Geocoding API
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        setGeocodeError(`City "${normalizedCity}" not found in database`);
        return;
      }
      
      setIsGeocoding(true);
      setGeocodeError(null);
      
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(normalizedCity)}&key=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error('Geocoding request failed');
        }
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          setCoordinates({ lat: location.lat, lng: location.lng });
          setMapKey(prev => prev + 1);
          console.log('🗺️ Map coordinates fetched via API:', { 
            city: normalizedCity, 
            coords: location,
            found: true 
          });
        } else {
          setGeocodeError(`Could not find location for "${normalizedCity}"`);
          console.log('🗺️ City not found via geocoding:', normalizedCity, data.status);
        }
      } catch (error) {
        console.error('🗺️ Geocoding error:', error);
        setGeocodeError('Failed to fetch location data');
      } finally {
        setIsGeocoding(false);
      }
    };
    
    fetchCoordinates();
  }, [city, apiKey]);

  // Show fallback if no API key is configured
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className="w-full h-full bg-linear-to-br from-avocado-100/40 via-mint-50/30 to-avocado-200/40">
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="w-32 h-32 mx-auto rounded-3xl glass-strong flex items-center justify-center frosted-overlay-avocado">
              <MapPin className="w-16 h-16 text-avocado-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-charcoal-800 tracking-tight">{city}</h2>
            </div>
            <div className="glass-card rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                <strong>To enable interactive map:</strong><br/>
                1. Get API key from Google Cloud Console<br/>
                2. Enable "Maps JavaScript API" and "Geocoding API"<br/>
                3. Add to .env.local file<br/>
                4. Restart dev server
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while geocoding
  if (isGeocoding || !coordinates) {
    return (
      <div className="w-full h-full bg-linear-to-br from-avocado-100/40 via-mint-50/30 to-avocado-200/40">
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="w-32 h-32 mx-auto rounded-3xl glass-strong flex items-center justify-center frosted-overlay-avocado">
              <MapPin className="w-16 h-16 text-avocado-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-charcoal-800 tracking-tight">{city}</h2>
              {isGeocoding && (
                <p className="text-sm text-charcoal-500 font-light">Locating on map...</p>
              )}
              {!isGeocoding && geocodeError && (
                <p className="text-sm text-red-500 font-light">{geocodeError}</p>
              )}
              {coordinates && (
                <p className="text-lg text-charcoal-500 font-light">
                  {coordinates.lat.toFixed(4)}°N, {Math.abs(coordinates.lng).toFixed(4)}°{coordinates.lng < 0 ? 'W' : 'E'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-full relative">
        <Map
          key={mapKey}
          center={coordinates}
          zoom={12}
          mapId="avocado-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          styles={[
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ saturation: 10 }]
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#a8e4da" }]
            },
            {
              featureType: "landscape",
              elementType: "geometry",
              stylers: [{ color: "#f0fdf4" }]
            }
          ]}
        >
          <Marker position={coordinates} title={city} />
        </Map>
      </div>
    </APIProvider>
  );
};
