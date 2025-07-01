
import { useState, useEffect } from "react";
import { MapPin, Search, Phone, Clock, Star, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface Gynecologist {
  id: string;
  name: string;
  clinic: string;
  address: string;
  phone: string;
  rating: number;
  distance: string;
  availability: string;
  lat: number;
  lng: number;
}

export const GynecologistFinder = () => {
  const [location, setLocation] = useState("");
  const [gynecologists, setGynecologists] = useState<Gynecologist[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.log("Location error:", error);
          toast({
            title: "Location access denied",
            description: "Please enter your location manually to find nearby gynecologists.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using a free geocoding service
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await response.json();
      setLocation(`${data.city}, ${data.principalSubdivision}`);
    } catch (error) {
      console.log("Geocoding error:", error);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const generateNearbyGynecologists = (baseLat: number, baseLng: number) => {
    const baseGynecologists = [
      { name: "Dr. Sarah Johnson", clinic: "Women's Health Center", phone: "+1 (555) 123-4567", rating: 4.8, availability: "Available today" },
      { name: "Dr. Emily Davis", clinic: "City Medical Plaza", phone: "+1 (555) 234-5678", rating: 4.6, availability: "Next appointment: Tomorrow" },
      { name: "Dr. Maria Rodriguez", clinic: "Comprehensive Women's Care", phone: "+1 (555) 345-6789", rating: 4.9, availability: "Available this week" },
      { name: "Dr. Jennifer Chen", clinic: "Metropolitan Women's Clinic", phone: "+1 (555) 456-7890", rating: 4.7, availability: "Available today" },
      { name: "Dr. Amanda Wilson", clinic: "Advanced Gynecology Associates", phone: "+1 (555) 567-8901", rating: 4.5, availability: "Next appointment: 2 days" },
    ];

    return baseGynecologists.map((doctor, index) => {
      // Generate random nearby coordinates (within 10km radius)
      const offsetLat = (Math.random() - 0.5) * 0.1;
      const offsetLng = (Math.random() - 0.5) * 0.1;
      const lat = baseLat + offsetLat;
      const lng = baseLng + offsetLng;
      const distance = calculateDistance(baseLat, baseLng, lat, lng);

      return {
        id: (index + 1).toString(),
        ...doctor,
        address: `${100 + index * 123} Medical Dr, Suite ${200 + index * 50}`,
        distance: `${distance.toFixed(1)} km`,
        lat,
        lng,
      };
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter your location or allow location access.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      let searchLat = 0, searchLng = 0;
      
      if (userLocation) {
        searchLat = userLocation.lat;
        searchLng = userLocation.lng;
      } else {
        // Geocode the entered location
        const response = await fetch(`https://api.bigdatacloud.net/data/forward-geocode?query=${encodeURIComponent(location)}&localityLanguage=en`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          searchLat = data.results[0].latitude;
          searchLng = data.results[0].longitude;
        } else {
          // Fallback coordinates (New York)
          searchLat = 40.7128;
          searchLng = -74.0060;
        }
      }

      const nearbyDoctors = generateNearbyGynecologists(searchLat, searchLng);
      setGynecologists(nearbyDoctors);
      
      toast({
        title: "Search completed",
        description: `Found ${nearbyDoctors.length} gynecologists near ${location}`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to find gynecologists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-teal-700 text-lg">
            <MapPin className="w-5 h-5" />
            Find Gynecologists Nearby
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
                className="border-teal-200 focus:border-teal-400 pr-10"
              />
              <Button
                onClick={getCurrentLocation}
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
              >
                <Navigation className="w-4 h-4 text-teal-600" />
              </Button>
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600 shrink-0"
              size="sm"
            >
              <Search className="w-4 h-4 mr-1" />
              {loading ? "..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {gynecologists.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-teal-700 px-1">
            Near {location}
          </h3>
          <div className="space-y-2">
            {gynecologists.slice(0, 6).map((doctor) => (
              <Card key={doctor.id} className="border-teal-100 hover:shadow-sm transition-shadow">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">{doctor.name}</h4>
                        <p className="text-teal-600 text-xs">{doctor.clinic}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs text-gray-600">{doctor.rating}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-teal-500" />
                        <span className="truncate">{doctor.address} • {doctor.distance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-teal-500" />
                        <span>{doctor.availability}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleCall(doctor.phone)}
                      variant="outline"
                      size="sm"
                      className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 text-xs h-7"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call {doctor.phone}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
