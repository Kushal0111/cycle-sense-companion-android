
import { useState } from "react";
import { Menu, X, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Profile } from "./Profile";
import { GynecologistFinder } from "./GynecologistFinder";

interface UserProfile {
  name: string;
  age: string;
  photo: string;
}

interface SidebarProps {
  onProfileUpdate: (profile: UserProfile) => void;
}

export const Sidebar = ({ onProfileUpdate }: SidebarProps) => {
  const [activeSection, setActiveSection] = useState<"profile" | "gynecologist">("profile");
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: "profile" as const,
      label: "Profile",
      icon: User,
      color: "text-rose-600",
    },
    {
      id: "gynecologist" as const,
      label: "Find Gynecologist",
      icon: MapPin,
      color: "text-teal-600",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <Profile onProfileUpdate={onProfileUpdate} />;
      case "gynecologist":
        return <GynecologistFinder />;
      default:
        return <Profile onProfileUpdate={onProfileUpdate} />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg"
        >
          <Menu className="w-6 h-6 text-slate-700 transition-transform duration-300 hover:rotate-12" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-6 bg-gradient-to-r from-rose-50 to-purple-50 border-b">
            <SheetTitle className="text-left text-rose-700">Menu</SheetTitle>
          </SheetHeader>
          
          {/* Navigation */}
          <div className="border-b bg-gradient-to-r from-rose-50/30 to-purple-50/30">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-all duration-300 hover:scale-105 ${
                    activeSection === item.id
                      ? "bg-white/70 border-r-2 border-rose-400"
                      : "hover:bg-white/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.color} transition-transform duration-300 hover:scale-110`} />
                  <span className={`font-medium ${item.color}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
