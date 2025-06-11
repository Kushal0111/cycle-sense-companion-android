
import { useState, useEffect } from "react";
import { Heart, Lightbulb, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: "nutrition" | "exercise" | "wellness" | "symptoms" | "hygiene";
}

const healthTips: HealthTip[] = [
  {
    id: "1",
    title: "Stay Hydrated",
    content: "Drinking plenty of water can help reduce bloating and cramping during your period. Aim for 8-10 glasses daily.",
    category: "wellness"
  },
  {
    id: "2",
    title: "Iron-Rich Foods",
    content: "Include iron-rich foods like spinach, lentils, and lean meats in your diet to help replenish iron lost during menstruation.",
    category: "nutrition"
  },
  {
    id: "3",
    title: "Gentle Exercise",
    content: "Light exercise like walking or yoga can help reduce period cramps and improve mood through endorphin release.",
    category: "exercise"
  },
  {
    id: "4",
    title: "Heat Therapy",
    content: "A warm heating pad or hot water bottle on your lower abdomen can help relax muscles and reduce cramping pain.",
    category: "symptoms"
  },
  {
    id: "5",
    title: "Magnesium Benefits",
    content: "Magnesium supplements or magnesium-rich foods like dark chocolate and nuts may help reduce PMS symptoms.",
    category: "nutrition"
  },
  {
    id: "6",
    title: "Proper Sleep",
    content: "Getting 7-9 hours of quality sleep helps regulate hormones and can reduce period-related mood swings.",
    category: "wellness"
  },
  {
    id: "7",
    title: "Menstrual Cup Care",
    content: "Sterilize your menstrual cup by boiling it for 5-10 minutes between cycles to maintain proper hygiene.",
    category: "hygiene"
  },
  {
    id: "8",
    title: "Track Your Mood",
    content: "Notice patterns in your mood throughout your cycle. This awareness can help you prepare for emotional changes.",
    category: "wellness"
  },
  {
    id: "9",
    title: "Calcium Intake",
    content: "Adequate calcium from dairy or fortified foods may help reduce PMS symptoms and support bone health.",
    category: "nutrition"
  },
  {
    id: "10",
    title: "Stress Management",
    content: "Practice stress-reduction techniques like meditation or deep breathing to help regulate your menstrual cycle.",
    category: "wellness"
  },
  {
    id: "11",
    title: "When to See a Doctor",
    content: "Consult a healthcare provider if you experience severe pain, very heavy bleeding, or cycles shorter than 21 or longer than 35 days.",
    category: "symptoms"
  },
  {
    id: "12",
    title: "Pad and Tampon Safety",
    content: "Change pads every 4-6 hours and tampons every 4-8 hours to prevent infections and maintain hygiene.",
    category: "hygiene"
  }
];

export const HealthTips = () => {
  const [dailyTip, setDailyTip] = useState<HealthTip | null>(null);
  const [favoritesTips, setFavoritesTips] = useState<string[]>([]);

  useEffect(() => {
    // Get today's tip based on date
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const tipIndex = dayOfYear % healthTips.length;
    setDailyTip(healthTips[tipIndex]);

    // Load favorites
    const savedFavorites = localStorage.getItem("cyclesense-favorite-tips");
    if (savedFavorites) {
      setFavoritesTips(JSON.parse(savedFavorites));
    }
  }, []);

  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * healthTips.length);
    setDailyTip(healthTips[randomIndex]);
  };

  const toggleFavorite = (tipId: string) => {
    const newFavorites = favoritesTips.includes(tipId)
      ? favoritesTips.filter(id => id !== tipId)
      : [...favoritesTips, tipId];
    
    setFavoritesTips(newFavorites);
    localStorage.setItem("cyclesense-favorite-tips", JSON.stringify(newFavorites));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "nutrition": return "bg-green-100 text-green-700";
      case "exercise": return "bg-blue-100 text-blue-700";
      case "wellness": return "bg-purple-100 text-purple-700";
      case "symptoms": return "bg-red-100 text-red-700";
      case "hygiene": return "bg-pink-100 text-pink-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryIcon = (category: string) => {
    // You could add specific icons for each category here
    return "💡";
  };

  return (
    <div className="space-y-6">
      {/* Daily Tip */}
      {dailyTip && (
        <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-pink-700">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Daily Health Tip
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={getRandomTip}
                className="text-pink-600 hover:text-pink-700"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-pink-700">{dailyTip.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(dailyTip.category)}`}>
                  {dailyTip.category}
                </span>
              </div>
              <p className="text-pink-600 leading-relaxed">{dailyTip.content}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(dailyTip.id)}
                className={`mt-2 ${favoritesTips.includes(dailyTip.id) ? 'text-red-500' : 'text-gray-400'}`}
              >
                {favoritesTips.includes(dailyTip.id) ? '❤️' : '🤍'} 
                {favoritesTips.includes(dailyTip.id) ? ' Saved' : ' Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <Lightbulb className="w-5 h-5" />
            Browse by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {["nutrition", "exercise", "wellness", "symptoms", "hygiene"].map((category) => {
              const categoryTips = healthTips.filter(tip => tip.category === category);
              return (
                <div
                  key={category}
                  className={`p-3 rounded-lg border-2 border-transparent hover:border-pink-200 transition-colors ${getCategoryColor(category)}`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
                    <h4 className="font-semibold capitalize">{category}</h4>
                    <p className="text-xs opacity-75">{categoryTips.length} tips</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* All Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-pink-700">All Health Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthTips.map((tip) => (
              <div
                key={tip.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-pink-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-700">{tip.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tip.category)}`}>
                    {tip.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{tip.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(tip.id)}
                  className={`${favoritesTips.includes(tip.id) ? 'text-red-500' : 'text-gray-400'}`}
                >
                  {favoritesTips.includes(tip.id) ? '❤️' : '🤍'} 
                  {favoritesTips.includes(tip.id) ? ' Saved' : ' Save'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Saved Tips */}
      {favoritesTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-pink-700">❤️ Saved Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthTips
                .filter(tip => favoritesTips.includes(tip.id))
                .map((tip) => (
                  <div
                    key={tip.id}
                    className="p-3 bg-pink-50 rounded-lg border border-pink-200"
                  >
                    <h4 className="font-semibold text-pink-700 mb-1">{tip.title}</h4>
                    <p className="text-pink-600 text-sm">{tip.content}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
