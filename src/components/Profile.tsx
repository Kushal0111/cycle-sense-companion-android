
import { useState, useEffect } from "react";
import { User, Camera, MapPin, Save } from "lucide-react";
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

  const handleSave = () => {
    if (!profile.name || !profile.age) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and age.",
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
    <div className="space-y-6">
      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-700">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.photo} alt="Profile" />
              <AvatarFallback className="bg-rose-100 text-rose-600">
                <User className="w-8 h-8" />
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
                className="flex items-center gap-2 cursor-pointer bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
                {profile.photo ? "Change Photo" : "Add Photo"}
              </Label>
            </div>
            {!profile.photo && (
              <p className="text-sm text-rose-600 text-center">
                Please add your profile photo to personalize your experience
              </p>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-rose-700">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter your name"
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
            <div>
              <Label htmlFor="age" className="text-rose-700">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="Enter your age"
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-rose-500 hover:bg-rose-600">
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
