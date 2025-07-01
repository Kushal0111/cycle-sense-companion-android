
import { useState, useEffect } from "react";
import { User, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  name: string;
  age: string;
  photo: string;
}

interface ProfileProps {
  onProfileUpdate: (profile: UserProfile) => void;
}

export const Profile = ({ onProfileUpdate }: ProfileProps) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: "",
    photo: "",
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("cyclesense-profile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      onProfileUpdate(parsedProfile);
    }
  }, [onProfileUpdate]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string;
        const updatedProfile = { ...profile, photo: photoUrl };
        setProfile(updatedProfile);
        localStorage.setItem("cyclesense-profile", JSON.stringify(updatedProfile));
        onProfileUpdate(updatedProfile);
        toast({
          title: "Photo updated",
          description: "Your profile photo has been saved.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
  };

  const handleSave = () => {
    if (!profile.name.trim() || !profile.age.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and age.",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(profile.age) < 1 || parseInt(profile.age) > 120) {
      toast({
        title: "Invalid age",
        description: "Please enter a valid age between 1 and 120.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("cyclesense-profile", JSON.stringify(profile));
    onProfileUpdate(profile);
    toast({
      title: "Profile saved",
      description: "Your profile has been updated successfully.",
    });
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-rose-700 text-lg">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.photo} alt="Profile" />
              <AvatarFallback className="bg-rose-100 text-rose-600">
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <Label
                htmlFor="photo-upload"
                className="flex items-center gap-2 cursor-pointer bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Camera className="w-4 h-4" />
                {profile.photo ? "Change Photo" : "Add Photo"}
              </Label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-rose-700 text-sm">Name</Label>
              <Input
                id="name"
                type="text"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your name"
                className="border-rose-200 focus:border-rose-400 mt-1"
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="age" className="text-rose-700 text-sm">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter your age"
                className="border-rose-200 focus:border-rose-400 mt-1"
                min="1"
                max="120"
                autoComplete="age"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-rose-500 hover:bg-rose-600" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
