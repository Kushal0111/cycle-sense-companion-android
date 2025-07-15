
import { useState, useEffect } from "react";
import { Heart, User, LogOut, Menu } from "lucide-react";
import { CycleTracker } from "@/components/CycleTracker";
import { CycleCalendar } from "@/components/CycleCalendar";
import { CyclePrediction } from "@/components/CyclePrediction";
import { CycleHealth } from "@/components/CycleHealth";
import { AIConsultation } from "@/components/AIConsultation";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Sidebar } from "@/components/Sidebar";
import { Login } from "@/components/Login";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FertilityCalendar } from "@/components/FertilityCalendar";
import { CycleRecommendations } from "@/components/CycleRecommendations";

interface UserProfile {
  name: string;
  age: string;
  photo: string;
}

interface User {
  email: string;
  name: string;
}

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    age: "",
    photo: "",
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Disable zoom and touch behaviors
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      const newViewport = document.createElement('meta');
      newViewport.name = 'viewport';
      newViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(newViewport);
    }

    // Prevent touch scrolling on body
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem("cyclesense-current-user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Check if this is the first visit
    const hasSeenOnboarding = localStorage.getItem("cyclesense-onboarding");
    if (!hasSeenOnboarding && savedUser) {
      setShowOnboarding(true);
    }

    // Load user profile
    const savedProfile = localStorage.getItem("cyclesense-profile");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile(profile);
    } else if (savedUser) {
      // Set default profile from user data
      const user = JSON.parse(savedUser);
      setUserProfile({
        name: user.name,
        age: "",
        photo: ""
      });
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Set default profile from user data if no profile exists
    const savedProfile = localStorage.getItem("cyclesense-profile");
    if (!savedProfile) {
      const defaultProfile = {
        name: user.name,
        age: "",
        photo: ""
      };
      setUserProfile(defaultProfile);
      localStorage.setItem("cyclesense-profile", JSON.stringify(defaultProfile));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cyclesense-current-user");
    setCurrentUser(null);
    setUserProfile({ name: "", age: "", photo: "" });
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("cyclesense-onboarding", "true");
    setShowOnboarding(false);
  };

  const handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading CycleSense...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-purple-50 flex flex-col overflow-hidden">
      {/* Sidebar */}
      <Sidebar onProfileUpdate={handleProfileUpdate} />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 flex-shrink-0 px-4 py-3 ml-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              CycleSense
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {userProfile.photo && (
              <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                <AvatarImage src={userProfile.photo} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-r from-rose-100 to-purple-100 text-rose-600">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className="text-sm text-slate-600">
              Hi, {userProfile.name || currentUser.name}!
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-slate-100/50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard - Single Scrollable Screen */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 space-y-6 pb-8">
          {/* Cycle Tracker Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Cycle Tracker
            </h2>
            <CycleTracker userProfile={userProfile} />
          </div>

          {/* Quick Recommendations */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200/50">
            <h2 className="text-lg font-semibold text-purple-800 mb-4">
              Today's Tips
            </h2>
            <CycleRecommendations />
          </div>

          {/* Calendar & Fertility Combined */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Calendar & Fertility
            </h2>
            <div className="space-y-6">
              <CycleCalendar />
              <div className="border-t pt-4">
                <FertilityCalendar />
              </div>
            </div>
          </div>

          {/* Health Analysis */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200/50">
            <h2 className="text-lg font-semibold text-emerald-800 mb-4">
              Health Analysis
            </h2>
            <CycleHealth />
          </div>

          {/* Cycle Prediction */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200/50">
            <h2 className="text-lg font-semibold text-indigo-800 mb-4">
              Cycle Prediction
            </h2>
            <CyclePrediction />
          </div>

          {/* AI Consultation */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200/50">
            <h2 className="text-lg font-semibold text-teal-800 mb-4">
              AI Health Assistant
            </h2>
            <AIConsultation />
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
};

export default Index;
