import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { MapPinIcon, CheckIcon } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AddressDetails {
  formattedAddress: string;
  streetNumber?: string;
  streetName?: string;
  suburb?: string;
  city: string;
  province: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressDetails) => void;
  placeholder?: string;
  initialValue?: string;
  label?: string;
  className?: string;
}

export function AddressAutocomplete({ 
  onAddressSelect, 
  placeholder = "Start typing an address...",
  initialValue = "",
  label = "Address",
  className = ""
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // No need to initialize Google Places API since we're using server-side API
  useEffect(() => {
    // Component is ready to accept input
  }, []);

  // Debounced search function using server-side API
  const searchAddresses = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ca72a349/geocode/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          input,
          sessionToken: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
      });

      const data = await response.json();
      setIsLoading(false);

      if (data.success && data.data) {
        setSuggestions(data.data);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        console.error('Address search failed:', data.error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      setIsLoading(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);
  };

  // Get detailed place information using server-side API
  const getPlaceDetails = async (placeId: string, description: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ca72a349/geocode/place-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ placeId })
      });

      const data = await response.json();
      setIsLoading(false);

      if (data.success && data.data) {
        onAddressSelect(data.data);
        setInputValue(data.data.formattedAddress);
        setShowSuggestions(false);
      } else {
        console.error('Error getting place details:', data.error);
        // Fallback to using description as formatted address
        const fallbackAddress: AddressDetails = {
          formattedAddress: description,
          city: 'Unknown',
          province: 'Unknown',
          country: 'South Africa',
          latitude: 0,
          longitude: 0,
          placeId: placeId
        };
        onAddressSelect(fallbackAddress);
        setInputValue(description);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      setIsLoading(false);
      
      // Fallback to using description as formatted address
      const fallbackAddress: AddressDetails = {
        formattedAddress: description,
        city: 'Unknown',
        province: 'Unknown',
        country: 'South Africa',
        latitude: 0,
        longitude: 0,
        placeId: placeId
      };
      onAddressSelect(fallbackAddress);
      setInputValue(description);
      setShowSuggestions(false);
    }
  };

  // This function is no longer needed since address parsing is done server-side

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: any, index: number) => {
    setSelectedIndex(index);
    getPlaceDetails(suggestion.place_id, suggestion.description);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex], selectedIndex);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor="address-input" className="text-base font-semibold mb-2 block">
        {label}
      </Label>
      
      <div className="relative">
        <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
        <Input
          ref={inputRef}
          id="address-input"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto shadow-luxury border-2 border-gray-200">
          <CardContent className="p-0">
            {suggestions.map((suggestion, index) => (
              <Button
                key={suggestion.place_id}
                variant="ghost"
                className={`w-full justify-start p-4 text-left h-auto rounded-none border-b border-gray-100 last:border-b-0 hover:bg-blue-50 ${
                  selectedIndex === index ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => handleSuggestionSelect(suggestion, index)}
              >
                <div className="flex items-start gap-3 w-full">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {suggestion.structured_formatting?.main_text || suggestion.description}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {suggestion.structured_formatting?.secondary_text || ''}
                    </div>
                  </div>
                  {selectedIndex === index && (
                    <CheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && inputValue.length >= 3 && !isLoading && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-luxury border-2 border-gray-200">
          <CardContent className="p-4 text-center text-gray-500">
            <MapPinIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No addresses found for "{inputValue}"</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Type definitions for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}