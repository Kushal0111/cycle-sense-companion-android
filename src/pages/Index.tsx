
import { useState, useEffect } from "react";
import { Calendar, Heart, Brain, MessageSquare, Settings, User, LogOut } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-purple-50">
      {/* Sidebar */}
      <Sidebar onProfileUpdate={handleProfileUpdate} />

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 ml-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl">
                <Heart className="w-6 h-6 text-white transition-transform duration-300 hover:scale-110" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                CycleSense
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Welcome, {currentUser.name}!</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-slate-100/50 transition-all duration-300 hover:scale-110"
              >
                <LogOut className="w-4 h-4 mr-2 transition-transform duration-300 hover:scale-110" />
                Logout
              </Button>
              <button className="p-2 rounded-full hover:bg-slate-100/50 transition-all duration-300 hover:scale-110 hover:rotate-12">
                <Settings className="w-6 h-6 text-slate-600 transition-transform duration-300 hover:scale-110" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      {userProfile.photo && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl">
              <AvatarImage src={userProfile.photo} alt="Profile" />
              <AvatarFallback className="bg-gradient-to-r from-rose-100 to-purple-100 text-rose-600">
                <User className="w-8 h-8 transition-transform duration-300 hover:scale-110" />
              </AvatarFallback>
            </Avatar>
            {userProfile.name && (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-700">
                  Hello, {userProfile.name}!
                </h2>
                {userProfile.age && (
                  <p className="text-slate-500">Age: {userProfile.age}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {renderActiveTab()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200/50 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg scale-105"
                      : `${tab.color} hover:bg-slate-100/50`
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'hover:scale-110'}`} />
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
