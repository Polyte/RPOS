import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { MapPinIcon, ZoomInIcon, ZoomOutIcon, MaximizeIcon, RefreshCwIcon, NavigationIcon, StoreIcon } from "lucide-react";
// Note: The Google Maps API key is configured server-side for security

interface TenantLocation {
  id: string;
  name: string;
  address: {
    formattedAddress: string;
    city: string;
    province: string;
    latitude: number;
    longitude: number;
  };
  businessType: string;
  isActive: boolean;
  userCount?: number;
  monthlyRevenue?: number;
}

interface TenantLocationMapProps {
  tenants: TenantLocation[];
  selectedTenantId?: string;
  onTenantSelect?: (tenantId: string) => void;
  className?: string;
  height?: string;
}

export function TenantLocationMap({ 
  tenants, 
  selectedTenantId, 
  onTenantSelect,
  className = "",
  height = "500px"
}: TenantLocationMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<TenantLocation | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google?.maps) {
          createMap();
          return;
        }

        // Load Google Maps API with environment variable
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${window.GOOGLE_MAPS_API_KEY || 'DEMO_KEY'}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          createMap();
        };
        
        script.onerror = () => {
          setMapError('Failed to load Google Maps API. Please check your API key.');
          setIsLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setMapError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    const createMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      try {
        // Center map on South Africa
        const southAfricaCenter = { lat: -25.7479, lng: 28.2293 };
        
        const mapOptions: google.maps.MapOptions = {
          center: southAfricaCenter,
          zoom: 6,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER,
          },
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          scaleControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        };

        const mapInstance = new google.maps.Map(mapRef.current, mapOptions);
        mapInstanceRef.current = mapInstance;
        setMap(mapInstance);

        // Create info window
        const infoWindowInstance = new google.maps.InfoWindow();
        setInfoWindow(infoWindowInstance);

        setIsLoading(false);
      } catch (error) {
        console.error('Error creating map:', error);
        setMapError('Error creating map instance');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  // Create markers for tenants
  useEffect(() => {
    if (!map || !infoWindow || tenants.length === 0) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    tenants.forEach((tenant) => {
      if (!tenant.address.latitude || !tenant.address.longitude) return;

      const position = {
        lat: tenant.address.latitude,
        lng: tenant.address.longitude
      };

      // Create custom marker icon based on tenant status
      const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: tenant.isActive ? '#10B981' : '#EF4444',
        fillOpacity: 0.8,
        strokeWeight: 3,
        strokeColor: '#FFFFFF',
        strokeOpacity: 1.0,
      };

      const marker = new google.maps.Marker({
        position,
        map,
        title: tenant.name,
        icon: markerIcon,
        animation: google.maps.Animation.DROP,
      });

      // Create info window content
      const infoContent = `
        <div class="p-4 max-w-sm">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg text-gray-900">${tenant.name}</h3>
              <p class="text-sm text-gray-600">${tenant.businessType}</p>
            </div>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="truncate">${tenant.address.formattedAddress}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                tenant.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }">
                ${tenant.isActive ? 'Active' : 'Inactive'}
              </span>
              ${tenant.userCount ? `<span class="text-gray-600">${tenant.userCount} users</span>` : ''}
            </div>
          </div>
          
          ${tenant.monthlyRevenue ? `
            <div class="border-t pt-3">
              <div class="text-center">
                <p class="text-sm text-gray-600">Monthly Revenue</p>
                <p class="text-xl font-bold text-green-600">R${tenant.monthlyRevenue.toFixed(2)}</p>
              </div>
            </div>
          ` : ''}
        </div>
      `;

      // Add click listener
      marker.addListener('click', () => {
        infoWindow.setContent(infoContent);
        infoWindow.open(map, marker);
        setSelectedTenant(tenant);
        onTenantSelect?.(tenant.id);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      if (newMarkers.length === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(15);
      } else {
        map.fitBounds(bounds);
        
        // Add some padding
        setTimeout(() => {
          const currentZoom = map.getZoom();
          if (currentZoom && currentZoom > 10) {
            map.setZoom(Math.min(currentZoom - 1, 10));
          }
        }, 100);
      }
    }

  }, [map, infoWindow, tenants, onTenantSelect]);

  // Highlight selected tenant
  useEffect(() => {
    if (!selectedTenantId || markers.length === 0) return;

    const selectedTenant = tenants.find(t => t.id === selectedTenantId);
    if (!selectedTenant) return;

    const selectedMarker = markers.find(marker => 
      marker.getTitle() === selectedTenant.name
    );

    if (selectedMarker && map) {
      // Center map on selected marker
      map.panTo(selectedMarker.getPosition()!);
      map.setZoom(Math.max(map.getZoom() || 10, 12));

      // Trigger click to show info window
      google.maps.event.trigger(selectedMarker, 'click');
    }
  }, [selectedTenantId, markers, tenants, map]);

  // Map control functions
  const zoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom + 1);
    }
  };

  const zoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(Math.max(currentZoom - 1, 1));
    }
  };

  const centerOnTenants = () => {
    if (!map || tenants.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    tenants.forEach(tenant => {
      if (tenant.address.latitude && tenant.address.longitude) {
        bounds.extend({
          lat: tenant.address.latitude,
          lng: tenant.address.longitude
        });
      }
    });

    if (tenants.length === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(15);
    } else {
      map.fitBounds(bounds);
    }
  };

  const goToCurrentLocation = () => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
          map.setZoom(12);

          // Add a temporary marker for current location
          const currentLocationMarker = new google.maps.Marker({
            position: pos,
            map,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
            },
          });

          // Remove marker after 5 seconds
          setTimeout(() => {
            currentLocationMarker.setMap(null);
          }, 5000);
        },
        () => {
          console.error('Geolocation failed');
        }
      );
    }
  };

  if (mapError) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-red-100 rounded-lg">
              <MapPinIcon className="w-6 h-6 text-red-600" />
            </div>
            Tenant Locations Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <MapPinIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Load Error</h3>
            <p className="text-gray-600 mb-4">{mapError}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPinIcon className="w-6 h-6 text-blue-600" />
            </div>
            Tenant Locations Map
            <Badge variant="secondary" className="ml-2">
              {tenants.length} locations
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={goToCurrentLocation}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <NavigationIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={centerOnTenants}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <MaximizeIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={zoomIn}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <ZoomInIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={zoomOut}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <ZoomOutIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={mapRef}
          style={{ height }}
          className="w-full rounded-b-xl overflow-hidden relative"
        >
          {isLoading && (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                  <MapPinIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Map</h3>
                <p className="text-gray-600">Initializing Google Maps...</p>
                <div className="mt-4">
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Map Legend */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active Stores</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Inactive Stores</span>
              </div>
            </div>
            
            {selectedTenant && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <StoreIcon className="w-4 h-4" />
                <span>Selected: {selectedTenant.name}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced tenant location interface
export interface EnhancedTenantLocation extends TenantLocation {
  phone?: string;
  email?: string;
  subscriptionPlan?: 'starter' | 'professional' | 'enterprise';
  createdAt?: string;
  updatedAt?: string;
}