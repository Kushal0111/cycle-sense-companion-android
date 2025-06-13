
import { useState, useEffect } from "react";
import { Calendar, Heart, Brain, Bell, MessageSquare, Settings } from "lucide-react";
import { CycleTracker } from "@/components/CycleTracker";
import { CycleCalendar } from "@/components/CycleCalendar";
import { CyclePrediction } from "@/components/CyclePrediction";
import { Reminders } from "@/components/Reminders";
import { AIConsultation } from "@/components/AIConsultation";
import { OnboardingModal } from "@/components/OnboardingModal";
import { StickyTips } from "@/components/StickyTips";

const Index = () => {
  const [activeTab, setActiveTab] = useState("tracker");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenOnboarding = localStorage.getItem("cyclesense-onboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("cyclesense-onboarding", "true");
    setShowOnboarding(false);
  };

  const tabs = [
    { id: "tracker", label: "Tracker", icon: Calendar },
    { id: "calendar", label: "Calendar", icon: Heart },
    { id: "prediction", label: "Predict", icon: Brain },
    { id: "consultation", label: "AI Help", icon: MessageSquare },
    { id: "reminders", label: "Reminders", icon: Bell },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "tracker":
        return <CycleTracker />;
      case "calendar":
        return <CycleCalendar />;
      case "prediction":
        return <CyclePrediction />;
      case "consultation":
        return <AIConsultation />;
      case "reminders":
        return <Reminders />;
      default:
        return <CycleTracker />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                CycleSense
              </h1>
            </div>
            <button className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <Settings className="w-6 h-6 text-pink-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {renderActiveTab()}
      </main>

      {/* Sticky Tips */}
      <StickyTips />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pink-200 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white"
                      : "text-pink-600 hover:bg-pink-50"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
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
