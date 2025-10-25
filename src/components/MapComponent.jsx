import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './MapComponent.css';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 28.6139, // New Delhi
  lng: 77.2090
};

function MapComponent({ users, currentLocation, onMarkerClick }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [mapCenter] = useState(currentLocation || defaultCenter);

  // Use environment variable for API key (you'll need to add this)
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

  return (
    <div className="map-container">
      <LoadScript googleMapsApiKey={API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={12}
        >
          {/* Current user marker */}
          {currentLocation && (
            <Marker
              position={currentLocation}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />
          )}

          {/* Other users markers */}
          {users.map((user) => (
            <Marker
              key={user.id}
              position={{ lat: user.latitude, lng: user.longitude }}
              onClick={() => setSelectedUser(user)}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }}
            />
          ))}

          {/* Info window for selected user */}
          {selectedUser && (
            <InfoWindow
              position={{ lat: selectedUser.latitude, lng: selectedUser.longitude }}
              onCloseClick={() => setSelectedUser(null)}
            >
              <div className="info-window">
                <h3>{selectedUser.name}</h3>
                <p className="distance">{selectedUser.distance} km away</p>
                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <div className="info-skills">
                    {selectedUser.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag-small">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}
                <button 
                  className="btn btn-primary btn-xs"
                  onClick={() => onMarkerClick && onMarkerClick(selectedUser)}
                >
                  View Profile
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default MapComponent;
