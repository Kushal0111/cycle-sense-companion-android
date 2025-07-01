import { useState, useEffect } from "react";
import { Calendar, Heart, Brain, MessageSquare, Settings, User, LogOut, Baby, Lightbulb } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("tracker");
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

  const tabs = [
    { id: "tracker", label: "Tracker", icon: Calendar, color: "text-emerald-600" },
    { id: "calendar", label: "Calendar", icon: Heart, color: "text-rose-600" },
    { id: "fertility", label: "Fertility", icon: Baby, color: "text-green-600" },
    { id: "recommendations", label: "Tips", icon: Lightbulb, color: "text-amber-600" },
    { id: "prediction", label: "Predict", icon: Brain, color: "text-indigo-600" },
    { id: "health", label: "Health", icon: Heart, color: "text-purple-600" },
    { id: "consultation", label: "Get Help", icon: MessageSquare, color: "text-teal-600" },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "tracker":
        return <CycleTracker userProfile={userProfile} />;
      case "calendar":
        return <CycleCalendar />;
      case "fertility":
        return <FertilityCalendar />;
      case "recommendations":
        return <CycleRecommendations />;
      case "prediction":
        return <CyclePrediction />;
      case "health":
        return <CycleHealth />;
      case "consultation":
        return <AIConsultation />;
      default:
        return <CycleTracker userProfile={userProfile} />;
    }
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
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex-shrink-0">
        <div className="container mx-auto px-4 py-3 ml-12">
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
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Hi, {currentUser.name}!</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-slate-100/50"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      {userProfile.photo && (
        <div className="container mx-auto px-4 py-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
              <AvatarImage src={userProfile.photo} alt="Profile" />
              <AvatarFallback className="bg-gradient-to-r from-rose-100 to-purple-100 text-rose-600">
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            {userProfile.name && (
              <div>
                <h2 className="text-lg font-semibold text-slate-700">
                  Hello, {userProfile.name}!
                </h2>
                {userProfile.age && (
                  <p className="text-slate-500 text-sm">Age: {userProfile.age}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 overflow-hidden">
        <div className="h-full overflow-y-auto pb-20">
          {renderActiveTab()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-t border-slate-200/50 flex-shrink-0">
        <div className="container mx-auto px-2">
          <div className="flex justify-around py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center py-2 px-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg scale-105"
                      : `${tab.color} hover:bg-slate-100/50`
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
};

export default Index;
