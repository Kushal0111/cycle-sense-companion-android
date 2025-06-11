
import { useState } from "react";
import { Heart, Calendar, Brain, Bell, Shield, ArrowRight, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Heart,
      title: "Welcome to CycleSense",
      content: "Your smart menstrual cycle tracking and health companion. Let's get you started on your journey to better cycle awareness.",
      color: "from-pink-400 to-purple-400"
    },
    {
      icon: Calendar,
      title: "Track Your Cycle",
      content: "Easily log your period start and end dates. The more data you provide, the more accurate our predictions become.",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: Brain,
      title: "AI-Powered Predictions",
      content: "Our smart algorithm learns from your cycle history to predict your next period and detect any irregularities.",
      color: "from-pink-400 to-purple-400"
    },
    {
      icon: Heart,
      title: "Daily Health Tips",
      content: "Receive personalized health tips and gynecological advice to support your wellbeing throughout your cycle.",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      content: "Never miss logging your period again with intelligent reminders based on your cycle predictions.",
      color: "from-pink-400 to-purple-400"
    },
    {
      icon: Shield,
      title: "Privacy First",
      content: "All your data is stored locally on your device. Your personal information stays private and secure.",
      color: "from-purple-400 to-pink-400"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-6 py-6">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mx-auto`}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
            <p className="text-gray-600 leading-relaxed px-4">{step.content}</p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="text-gray-500"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button
              onClick={nextStep}
              className={`bg-gradient-to-r ${step.color} hover:opacity-90 text-white`}
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              {currentStep !== steps.length - 1 && (
                <ArrowRight className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>

          {/* Skip option */}
          {currentStep !== steps.length - 1 && (
            <button
              onClick={onComplete}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip introduction
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
