
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Heart, Brain, Smile, Frown, Meh, Zap, Cloud, Sun } from "lucide-react";
import { format, differenceInDays, subDays, addDays } from "date-fns";
import { cycleDB } from "@/utils/cycleDatabase";
import { useToast } from "@/hooks/use-toast";

interface MoodEntry {
  id: string;
  date: Date;
  mood: string;
  intensity: number;
  notes?: string;
  cyclePhase?: string;
}

const moods = [
  { name: "Happy", icon: Smile, color: "text-yellow-500", bg: "bg-yellow-100" },
  { name: "Sad", icon: Frown, color: "text-blue-500", bg: "bg-blue-100" },
  { name: "Anxious", icon: Zap, color: "text-orange-500", bg: "bg-orange-100" },
  { name: "Tired", icon: Cloud, color: "text-gray-500", bg: "bg-gray-100" },
  { name: "Energetic", icon: Sun, color: "text-green-500", bg: "bg-green-100" },
  { name: "Neutral", icon: Meh, color: "text-slate-500", bg: "bg-slate-100" },
];

export const MoodTracker = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [intensity, setIntensity] = useState<number>(3);
  const [notes, setNotes] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const savedMoods = localStorage.getItem("cyclesense-moods");
    if (savedMoods) {
      const parsed = JSON.parse(savedMoods);
      setMoodEntries(parsed.map((m: any) => ({
        ...m,
        date: new Date(m.date)
      })));
    }
  }, []);

  const saveMoods = (moods: MoodEntry[]) => {
    localStorage.setItem("cyclesense-moods", JSON.stringify(moods));
    setMoodEntries(moods);
  };

  const getCurrentCyclePhase = (date: Date) => {
    const data = cycleDB.getCycleData();
    const lastPeriod = data.periods
      .filter(p => p.endDate && p.startDate <= date)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];

    if (!lastPeriod) return "Unknown";

    const daysSincePeriod = differenceInDays(date, lastPeriod.startDate);
    const cycleLength = data.averageCycleLength;

    if (daysSincePeriod <= 5) return "Menstrual";
    if (daysSincePeriod <= cycleLength / 2) return "Follicular";
    if (daysSincePeriod <= (cycleLength / 2) + 2) return "Ovulatory";
    return "Luteal";
  };

  const logMood = () => {
    if (!selectedMood) {
      toast({
        title: "Select a mood",
        description: "Please choose how you're feeling today",
        variant: "destructive",
      });
      return;
    }

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      mood: selectedMood,
      intensity,
      notes,
      cyclePhase: getCurrentCyclePhase(selectedDate),
    };

    const updatedMoods = [...moodEntries.filter(m => 
      !format(m.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    ), newEntry];

    saveMoods(updatedMoods);
    setSelectedMood("");
    setNotes("");
    setIntensity(3);

    toast({
      title: "Mood logged",
      description: `Your ${selectedMood.toLowerCase()} mood has been recorded`,
    });
  };

  const getMoodForDate = (date: Date) => {
    return moodEntries.find(m => 
      format(m.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getMoodTrends = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i));
    const moodCounts: { [key: string]: number } = {};
    
    last30Days.forEach(date => {
      const mood = getMoodForDate(date);
      if (mood) {
        moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
      }
    });

    return Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const getCycleMoodCorrelation = () => {
    const phaseGroups: { [key: string]: MoodEntry[] } = {};
    
    moodEntries.forEach(entry => {
      if (entry.cyclePhase) {
        if (!phaseGroups[entry.cyclePhase]) {
          phaseGroups[entry.cyclePhase] = [];
        }
        phaseGroups[entry.cyclePhase].push(entry);
      }
    });

    return Object.entries(phaseGroups).map(([phase, entries]) => ({
      phase,
      avgIntensity: entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length,
      commonMood: entries.reduce((acc, e) => {
        acc[e.mood] = (acc[e.mood] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }),
      count: entries.length,
    }));
  };

  const todaysMood = getMoodForDate(selectedDate);
  const trends = getMoodTrends();
  const cycleCorrelation = getCycleMoodCorrelation();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-100/70 to-pink-100/70 border-purple-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Brain className="w-5 h-5" />
            Mood & Mental Health Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-600 text-sm">
            Track your emotions and see how they correlate with your cycle phases.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Logging */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-700">Log Your Mood</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                Date: {format(selectedDate, "MMM dd, yyyy")}
              </label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                How are you feeling?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {moods.map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <button
                      key={mood.name}
                      onClick={() => setSelectedMood(mood.name)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedMood === mood.name
                          ? `${mood.bg} border-current ${mood.color}`
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${mood.color}`} />
                      <span className="text-xs font-medium">{mood.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                Intensity (1-5): {intensity}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional thoughts..."
                className="w-full p-2 border rounded-lg text-sm"
                rows={2}
              />
            </div>

            <Button onClick={logMood} className="w-full">
              Log Mood
            </Button>

            {todaysMood && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  Today's mood: <Badge variant="secondary">{todaysMood.mood}</Badge>
                  <span className="ml-2">Intensity: {todaysMood.intensity}/5</span>
                </p>
                {todaysMood.notes && (
                  <p className="text-sm text-slate-500 mt-1">{todaysMood.notes}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-700">Mood Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trends.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Last 30 Days</h4>
                <div className="space-y-2">
                  {trends.map(([mood, count]) => (
                    <div key={mood} className="flex justify-between">
                      <span className="text-sm text-slate-600">{mood}</span>
                      <Badge variant="outline">{count} days</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cycleCorrelation.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Cycle Correlation</h4>
                <div className="space-y-2">
                  {cycleCorrelation.map((data) => {
                    const commonMood = Object.entries(data.commonMood)
                      .sort(([,a], [,b]) => b - a)[0];
                    return (
                      <div key={data.phase} className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">{data.phase} Phase</span>
                          <span className="text-slate-500">
                            Avg: {data.avgIntensity.toFixed(1)}/5
                          </span>
                        </div>
                        {commonMood && (
                          <p className="text-xs text-slate-500">
                            Most common: {commonMood[0]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {moodEntries.length === 0 && (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Start logging your moods to see insights</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
