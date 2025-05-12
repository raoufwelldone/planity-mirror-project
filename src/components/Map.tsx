
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';

// Temporary public token - in a real app, this should be stored in an environment variable
// and accessed through an API request
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbGdqazM3ZGwwNDY0M2RvYnJtemNxbmNnIn0.XMfa-P4ad-6aewtXewbdEg';

interface MapProps {
  salons: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }>;
  onSalonSelect: (salonId: string) => void;
}

const Map = ({ salons, onSalonSelect }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.0060, 40.7128], // Default to New York City
      zoom: 12
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !map.current || salons.length === 0) return;

    // Clear any existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Add markers for each salon
    const bounds = new mapboxgl.LngLatBounds();

    salons.forEach(salon => {
      if (salon.latitude && salon.longitude) {
        // Create a popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div>
            <h3 class="font-bold">${salon.name}</h3>
            <button class="view-salon-btn text-primary hover:underline" data-salon-id="${salon.id}">
              Book Now
            </button>
          </div>`
        );

        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'flex items-center justify-center w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg';
        markerEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><path d="M18 6a6 6 0 0 0-12 0c0 4 6 10 6 10s6-6 6-10Z"></path><circle cx="12" cy="6" r="2"></circle></svg>';
        
        // Add marker to map
        new mapboxgl.Marker(markerEl)
          .setLngLat([salon.longitude, salon.latitude])
          .setPopup(popup)
          .addTo(map.current);

        // Extend bounds to include this point
        bounds.extend([salon.longitude, salon.latitude]);
      }
    });

    // Fit map to bounds with padding
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }

    // Add event listeners for the "Book Now" buttons
    map.current.on('click', (e) => {
      const target = e.originalEvent.target as HTMLElement;
      if (target.classList.contains('view-salon-btn')) {
        const salonId = target.getAttribute('data-salon-id');
        if (salonId) {
          onSalonSelect(salonId);
        }
      }
    });
  }, [mapLoaded, salons, onSalonSelect]);

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-2 right-2">
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => {
            if (map.current && !map.current.getCanvas().classList.contains('mapboxgl-map-fullscreen')) {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                mapContainer.current?.requestFullscreen();
              }
            }
          }}
        >
          {document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </div>
    </div>
  );
};

export default Map;
