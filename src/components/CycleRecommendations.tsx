
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Dumbbell, Heart, Lightbulb, Sparkles, Apple } from "lucide-react";
import { differenceInDays } from "date-fns";
import { cycleDB } from "@/utils/cycleDatabase";

interface Recommendation {
  type: "diet" | "exercise" | "mental" | "skincare";
  title: string;
  description: string;
  icon: any;
  priority: "high" | "medium" | "low";
}

const recommendations = {
  menstrual: {
    diet: [
      {
        type: "diet" as const,
        title: "Iron-Rich Foods",
        description: "Eat spinach, lentils, and red meat to replenish iron lost during menstruation.",
        icon: Apple,
        priority: "high" as const,
      },
      {
        type: "diet" as const,
        title: "Stay Hydrated",
        description: "Drink plenty of water to reduce bloating and help with cramps.",
        icon: Apple,
        priority: "high" as const,
      },
    ],
    exercise: [
      {
        type: "exercise" as const,
        title: "Gentle Yoga",
        description: "Light stretching and yoga can help relieve cramps and tension.",
        icon: Dumbbell,
        priority: "medium" as const,
      },
      {
        type: "exercise" as const,
        title: "Walking",
        description: "Light walks can boost mood and reduce period pain naturally.",
        icon: Dumbbell,
        priority: "medium" as const,
      },
    ],
    mental: [
      {
        type: "mental" as const,
        title: "Rest & Self-Care",
        description: "Allow yourself extra rest and practice self-compassion during this time.",
        icon: Heart,
        priority: "high" as const,
      },
    ],
    skincare: [
      {
        type: "skincare" as const,
        title: "Gentle Cleansing",
        description: "Use mild, fragrance-free cleansers as skin may be more sensitive.",
        icon: Sparkles,
        priority: "medium" as const,
      },
    ],
  },
  follicular: {
    diet: [
      {
        type: "diet" as const,
        title: "Protein & Healthy Fats",
        description: "Support hormone production with nuts, seeds, and lean proteins.",
        icon: Apple,
        priority: "medium" as const,
      },
    ],
    exercise: [
      {
        type: "exercise" as const,
        title: "Cardio Workouts",
        description: "Take advantage of rising energy levels with cardio exercises.",
        icon: Dumbbell,
        priority: "high" as const,
      },
      {
        type: "exercise" as const,
        title: "Strength Training",
        description: "Build strength as your energy and motivation increase.",
        icon: Dumbbell,
        priority: "medium" as const,
      },
    ],
    mental: [
      {
        type: "mental" as const,
        title: "Plan & Organize",
        description: "Great time for planning and starting new projects with increased focus.",
        icon: Heart,
        priority: "medium" as const,
      },
    ],
    skincare: [
      {
        type: "skincare" as const,
        title: "Exfoliate Gently",
        description: "Skin cell turnover increases, so gentle exfoliation can help.",
        icon: Sparkles,
        priority: "low" as const,
      },
    ],
  },
  ovulatory: {
    diet: [
      {
        type: "diet" as const,
        title: "Antioxidant Foods",
        description: "Berries, leafy greens support egg quality during ovulation.",
        icon: Apple,
        priority: "high" as const,
      },
    ],
    exercise: [
      {
        type: "exercise" as const,
        title: "High-Intensity Workouts",
        description: "Peak energy time - perfect for challenging workouts.",
        icon: Dumbbell,
        priority: "high" as const,
      },
    ],
    mental: [
      {
        type: "mental" as const,
        title: "Social Activities",
        description: "Great time for socializing and communication as confidence peaks.",
        icon: Heart,
        priority: "medium" as const,
      },
    ],
    skincare: [
      {
        type: "skincare" as const,
        title: "Minimal Routine",
        description: "Skin often looks its best - keep routine simple and light.",
        icon: Sparkles,
        priority: "low" as const,
      },
    ],
  },
  luteal: {
    diet: [
      {
        type: "diet" as const,
        title: "Complex Carbs",
        description: "Combat cravings with whole grains and sweet potatoes for stable blood sugar.",
        icon: Apple,
        priority: "high" as const,
      },
      {
        type: "diet" as const,
        title: "Magnesium Foods",
        description: "Dark chocolate, nuts, and seeds can help reduce PMS symptoms.",
        icon: Apple,
        priority: "medium" as const,
      },
    ],
    exercise: [
      {
        type: "exercise" as const,
        title: "Moderate Exercise",
        description: "Pilates, swimming, or moderate strength training work well.",
        icon: Dumbbell,
        priority: "medium" as const,
      },
    ],
    mental: [
      {
        type: "mental" as const,
        title: "Stress Management",
        description: "Practice meditation, journaling, or breathing exercises for mood stability.",
        icon: Heart,
        priority: "high" as const,
      },
    ],
    skincare: [
      {
        type: "skincare" as const,
        title: "Oil Control",
        description: "Use clay masks and oil-free products as skin may become oilier.",
        icon: Sparkles,
        priority: "medium" as const,
      },
    ],
  },
};

export const CycleRecommendations = () => {
  const [currentPhase, setCurrentPhase] = useState<string>("follicular");
  const [cycleDay, setCycleDay] = useState<number>(1);
  const [completedTips, setCompletedTips] = useState<string[]>([]);

  useEffect(() => {
    const data = cycleDB.getCycleData();
    const lastPeriod = data.periods
      .filter(p => p.endDate)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];

    if (lastPeriod) {
      const daysSincePeriod = differenceInDays(new Date(), lastPeriod.startDate);
      const cycleLength = data.averageCycleLength;
      
      setCycleDay(daysSincePeriod + 1);

      if (daysSincePeriod <= 5) {
        setCurrentPhase("menstrual");
      } else if (daysSincePeriod <= cycleLength / 2) {
        setCurrentPhase("follicular");
      } else if (daysSincePeriod <= (cycleLength / 2) + 2) {
        setCurrentPhase("ovulatory");
      } else {
        setCurrentPhase("luteal");
      }
    }

    // Load completed tips
    const saved = localStorage.getItem("cyclesense-completed-tips");
    if (saved) {
      setCompletedTips(JSON.parse(saved));
    }
  }, []);

  const getCurrentRecommendations = (): Recommendation[] => {
    const phaseRecs = recommendations[currentPhase as keyof typeof recommendations];
    if (!phaseRecs) return [];

    return [
      ...phaseRecs.diet,
      ...phaseRecs.exercise,
      ...phaseRecs.mental,
      ...phaseRecs.skincare,
    ].sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    });
  };

  const markTipCompleted = (title: string) => {
    const updated = [...completedTips, title];
    setCompletedTips(updated);
    localStorage.setItem("cyclesense-completed-tips", JSON.stringify(updated));
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "menstrual": return "text-rose-600 bg-rose-100";
      case "follicular": return "text-blue-600 bg-blue-100";
      case "ovulatory": return "text-emerald-600 bg-emerald-100";
      case "luteal": return "text-purple-600 bg-purple-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "diet": return Utensils;
      case "exercise": return Dumbbell;
      case "mental": return Heart;
      case "skincare": return Sparkles;
      default: return Lightbulb;
    }
  };

  const currentRecs = getCurrentRecommendations();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-100/70 to-purple-100/70 border-indigo-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Lightbulb className="w-5 h-5" />
            Personalized Cycle Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-indigo-600 text-sm">
              Get personalized health tips based on your current cycle phase.
            </p>
            <div className="flex items-center gap-2">
              <Badge className={getPhaseColor(currentPhase)}>
                {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase
              </Badge>
              <Badge variant="outline">Day {cycleDay}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Recommendations */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold text-slate-700">
          Today's Recommendations
        </h3>
        
        {currentRecs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                Start tracking your periods to get personalized recommendations
              </p>
            </CardContent>
          </Card>
        ) : (
          currentRecs.map((rec, index) => {
            const TypeIcon = getTypeIcon(rec.type);
            const isCompleted = completedTips.includes(rec.title);
            
            return (
              <Card key={index} className={`transition-all ${isCompleted ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        rec.type === 'diet' ? 'bg-orange-100 text-orange-600' :
                        rec.type === 'exercise' ? 'bg-green-100 text-green-600' :
                        rec.type === 'mental' ? 'bg-pink-100 text-pink-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-700">{rec.title}</h4>
                          <Badge 
                            variant={rec.priority === 'high' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{rec.description}</p>
                      </div>
                    </div>
                    <Button
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                      onClick={() => markTipCompleted(rec.title)}
                      disabled={isCompleted}
                    >
                      {isCompleted ? "✓ Done" : "Mark Done"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Phase Information */}
      <Card className="bg-slate-50/50">
        <CardHeader>
          <CardTitle className="text-slate-700">About Your Current Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentPhase === "menstrual" && (
              <p className="text-sm text-slate-600">
                During menstruation, hormone levels are at their lowest. Focus on rest, gentle movement, and replenishing nutrients lost during your period.
              </p>
            )}
            {currentPhase === "follicular" && (
              <p className="text-sm text-slate-600">
                The follicular phase brings rising energy and motivation. This is a great time to start new projects and increase physical activity.
              </p>
            )}
            {currentPhase === "ovulatory" && (
              <p className="text-sm text-slate-600">
                Peak energy and confidence during ovulation. Your body is primed for high-intensity activities and social interactions.
              </p>
            )}
            {currentPhase === "luteal" && (
              <p className="text-sm text-slate-600">
                The luteal phase may bring PMS symptoms. Focus on stress management, stable blood sugar, and preparing for your next cycle.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
