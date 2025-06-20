
import { useState } from "react";
import { MapPin, Search, Phone, Clock, Star } from "lucide-react";
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
}

export const GynecologistFinder = () => {
  const [location, setLocation] = useState("");
  const [gynecologists, setGynecologists] = useState<Gynecologist[]>([]);
  const [loading, setLoading] = useState(false);

  const mockGynecologists: Gynecologist[] = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      clinic: "Women's Health Center",
      address: "123 Main St, Downtown",
      phone: "+1 (555) 123-4567",
      rating: 4.8,
      distance: "0.5 km",
      availability: "Available today"
    },
    {
      id: "2",
      name: "Dr. Emily Davis",
      clinic: "City Medical Plaza",
      address: "456 Oak Avenue, City Center",
      phone: "+1 (555) 234-5678",
      rating: 4.6,
      distance: "1.2 km",
      availability: "Next appointment: Tomorrow"
    },
    {
      id: "3",
      name: "Dr. Maria Rodriguez",
      clinic: "Comprehensive Women's Care",
      address: "789 Pine Road, Medical District",
      phone: "+1 (555) 345-6789",
      rating: 4.9,
      distance: "2.1 km",
      availability: "Available this week"
    }
  ];

  const handleSearch = async () => {
    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter your location to find nearby gynecologists.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setGynecologists(mockGynecologists);
      setLoading(false);
      toast({
        title: "Search completed",
        description: `Found ${mockGynecologists.length} gynecologists near ${location}`,
      });
    }, 1500);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="space-y-6">
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <MapPin className="w-5 h-5 transition-all duration-300 hover:scale-110 hover:bounce" />
            Find Gynecologists Nearby
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location (city, area, or zip code)"
              className="border-teal-200 focus:border-teal-400 transition-all duration-300 focus:scale-105"
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600 shrink-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Search className="w-4 h-4 mr-2 transition-transform duration-300 hover:rotate-12" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
          
          <p className="text-sm text-teal-600">
            Find qualified gynecologists in your area for professional consultation
          </p>
        </CardContent>
      </Card>

      {gynecologists.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-teal-700">
            Gynecologists near {location}
          </h3>
          {gynecologists.map((doctor) => (
            <Card key={doctor.id} className="border-teal-100 hover:shadow-md transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{doctor.name}</h4>
                      <p className="text-teal-600 text-sm">{doctor.clinic}</p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current transition-transform duration-300 hover:scale-110" />
                      <span className="text-sm text-gray-600">{doctor.rating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-500 transition-transform duration-300 hover:scale-110" />
                      <span>{doctor.address} • {doctor.distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-500 transition-transform duration-300 hover:scale-110" />
                      <span>{doctor.availability}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleCall(doctor.phone)}
                    variant="outline"
                    size="sm"
                    className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 transition-all duration-300 hover:scale-105"
                  >
                    <Phone className="w-4 h-4 mr-2 transition-transform duration-300 hover:scale-110" />
                    Call {doctor.phone}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
