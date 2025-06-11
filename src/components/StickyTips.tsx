
import { useState, useEffect } from "react";
import { X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const healthTips = [
  "Stay hydrated! Drinking water helps reduce bloating and cramping during your period.",
  "Iron-rich foods like spinach and lentils help replenish iron lost during menstruation.",
  "Light exercise like walking or yoga can help reduce period cramps naturally.",
  "A warm heating pad can help relax muscles and reduce cramping pain.",
  "Getting 7-9 hours of sleep helps regulate hormones and reduce mood swings.",
  "Track your mood patterns throughout your cycle for better self-awareness.",
  "Change pads every 4-6 hours and tampons every 4-8 hours for hygiene.",
  "Magnesium-rich foods like dark chocolate may help reduce PMS symptoms.",
  "Practice stress-reduction techniques to help regulate your cycle.",
  "Consult a doctor for severe pain or irregular cycles."
];

export const StickyTips = () => {
  const [currentTip, setCurrentTip] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Get a random tip when component mounts
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    setCurrentTip(randomTip);
  }, []);

  const getNewTip = () => {
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    setCurrentTip(randomTip);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 md:left-auto md:right-4 md:w-80">
      <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded-lg shadow-lg transform rotate-1">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-800 mb-1">Health Tip</h4>
              <p className="text-xs text-yellow-700 leading-relaxed">{currentTip}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={getNewTip}
            className="text-xs text-yellow-600 hover:text-yellow-800 h-6 px-2"
          >
            New tip
          </Button>
        </div>
      </div>
    </div>
  );
};
