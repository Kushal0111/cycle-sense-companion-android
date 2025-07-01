
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Heart, Baby, Calendar as CalendarIcon, Target, Droplets } from "lucide-react";
import { format, differenceInDays, isSameDay, addDays, subDays, isWithinInterval } from "date-fns";
import { cycleDB } from "@/utils/cycleDatabase";
import { useToast } from "@/hooks/use-toast";

interface IntercourseLog {
  id: string;
  date: Date;
  notes?: string;
}

interface FertilityData {
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  fertilityScore: number;
}

export const FertilityCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [ttcMode, setTtcMode] = useState(false);
  const [intercourseLog, setIntercourseLog] = useState<IntercourseLog[]>([]);
  const [fertilityData, setFertilityData] = useState<FertilityData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load TTC mode preference
    const savedTtcMode = localStorage.getItem("cyclesense-ttc-mode");
    if (savedTtcMode) {
      setTtcMode(JSON.parse(savedTtcMode));
    }

    // Load intercourse log
    const savedLog = localStorage.getItem("cyclesense-intercourse-log");
    if (savedLog) {
      const parsed = JSON.parse(savedLog);
      setIntercourseLog(parsed.map((log: any) => ({
        ...log,
        date: new Date(log.date)
      })));
    }

    // Calculate fertility data
    calculateFertilityData();
  }, []);

  const calculateFertilityData = () => {
    const prediction = cycleDB.predictNextPeriod();
    if (!prediction) return;

    const ovulationDate = prediction.ovulationDate;
    const fertileWindowStart = subDays(ovulationDate, 5);
    const fertileWindowEnd = addDays(ovulationDate, 1);

    setFertilityData({
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      fertilityScore: 0 // Will be calculated per day
    });
  };

  const toggleTtcMode = () => {
    const newMode = !ttcMode;
    setTtcMode(newMode);
    localStorage.setItem("cyclesense-ttc-mode", JSON.stringify(newMode));
    
    toast({
      title: ttcMode ? "TTC Mode Disabled" : "TTC Mode Enabled",
      description: ttcMode 
        ? "Fertility tracking features are now hidden"
        : "Advanced fertility tracking is now active",
    });
  };

  const getFertilityScore = (date: Date): number => {
    if (!fertilityData) return 0;

    const { ovulationDate, fertileWindowStart, fertileWindowEnd } = fertilityData;
    
    if (isSameDay(date, ovulationDate)) return 100;
    if (isWithinInterval(date, { start: fertileWindowStart, end: fertileWindowEnd })) {
      const daysFromOvulation = Math.abs(differenceInDays(date, ovulationDate));
      return Math.max(0, 100 - (daysFromOvulation * 20));
    }
    
    return 0;
  };

  const getDayType = (date: Date): string => {
    if (!fertilityData) return "";
    
    const { ovulationDate, fertileWindowStart, fertileWindowEnd } = fertilityData;
    
    if (isSameDay(date, ovulationDate)) return "ovulation";
    if (isWithinInterval(date, { start: fertileWindowStart, end: fertileWindowEnd })) {
      return "fertile";
    }
    
    // Check for period days
    const data = cycleDB.getCycleData();
    const period = data.periods.find(p => {
      if (!p.endDate) return isSameDay(date, p.startDate);
      return isWithinInterval(date, { start: p.startDate, end: p.endDate });
    });
    
    if (period) return "period";
    
    return "";
  };

  const logIntercourse = (date: Date) => {
    const newLog: IntercourseLog = {
      id: Date.now().toString(),
      date,
    };

    const updatedLog = [...intercourseLog.filter(log => 
      !isSameDay(log.date, date)
    ), newLog];

    setIntercourseLog(updatedLog);
    localStorage.setItem("cyclesense-intercourse-log", JSON.stringify(updatedLog));

    toast({
      title: "Logged",
      description: `Intercourse logged for ${format(date, "MMM dd")}`,
    });
  };

  const hasIntercourse = (date: Date): boolean => {
    return intercourseLog.some(log => isSameDay(log.date, date));
  };

  const getDayClass = (date: Date): string => {
    const dayType = getDayType(date);
    const hasLog = hasIntercourse(date);
    
    let baseClass = "w-9 h-9 flex items-center justify-center rounded-md text-sm cursor-pointer relative ";
    
    switch (dayType) {
      case "ovulation":
        baseClass += "bg-emerald-500 text-white hover:bg-emerald-600";
        break;
      case "fertile":
        baseClass += "bg-emerald-200 text-emerald-800 hover:bg-emerald-300";
        break;
      case "period":
        baseClass += "bg-rose-500 text-white hover:bg-rose-600";
        break;
      default:
        baseClass += "hover:bg-slate-100";
    }
    
    if (hasLog && ttcMode) {
      baseClass += " after:content-['♥'] after:absolute after:top-0 after:right-0 after:text-xs after:text-pink-600";
    }
    
    return baseClass;
  };

  const getSelectedDateInfo = () => {
    if (!selectedDate) return null;
    
    const fertilityScore = getFertilityScore(selectedDate);
    const dayType = getDayType(selectedDate);
    const hasLog = hasIntercourse(selectedDate);
    
    return {
      date: selectedDate,
      fertilityScore,
      dayType,
      hasLog,
      phase: getCurrentPhase(selectedDate)
    };
  };

  const getCurrentPhase = (date: Date): string => {
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

  const selectedInfo = getSelectedDateInfo();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-100/70 to-green-100/70 border-emerald-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <Baby className="w-5 h-5" />
            Fertility & Ovulation Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-emerald-600 text-sm">
              Track your fertile window and ovulation for family planning.
            </p>
            <div className="flex items-center gap-2">
              <Label htmlFor="ttc-mode" className="text-sm font-medium">
                TTC Mode
              </Label>
              <Switch
                id="ttc-mode"
                checked={ttcMode}
                onCheckedChange={toggleTtcMode}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fertility Calendar */}
      <Card>
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
            components={{
              Day: ({ date, ...props }) => {
                const dayClass = getDayClass(date);
                return (
                  <div
                    className={dayClass}
                    {...props}
                  >
                    {date.getDate()}
                  </div>
                );
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-700">Fertility Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-sm text-slate-600">Ovulation Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-200 border border-emerald-300 rounded"></div>
              <span className="text-sm text-slate-600">Fertile Window</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rose-500 rounded"></div>
              <span className="text-sm text-slate-600">Period</span>
            </div>
            {ttcMode && (
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-600" />
                <span className="text-sm text-slate-600">Intercourse Logged</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-700">
              {format(selectedInfo.date, "MMMM dd, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Fertility Score:</span>
                <Badge variant={selectedInfo.fertilityScore > 50 ? "default" : "secondary"}>
                  {selectedInfo.fertilityScore}%
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Cycle Phase:</span>
                <Badge variant="outline">{selectedInfo.phase}</Badge>
              </div>

              {selectedInfo.dayType && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Day Type:</span>
                  <Badge 
                    variant={selectedInfo.dayType === "ovulation" ? "default" : "secondary"}
                  >
                    {selectedInfo.dayType}
                  </Badge>
                </div>
              )}

              {ttcMode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Intercourse:</span>
                    <Badge variant={selectedInfo.hasLog ? "default" : "outline"}>
                      {selectedInfo.hasLog ? "Logged" : "Not logged"}
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={() => logIntercourse(selectedInfo.date)}
                    size="sm"
                    variant={selectedInfo.hasLog ? "outline" : "default"}
                    className="w-full"
                  >
                    {selectedInfo.hasLog ? "Remove Log" : "Log Intercourse"}
                  </Button>
                </div>
              )}

              {selectedInfo.fertilityScore > 70 && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-700 font-medium">
                    🌟 High fertility day! This is a great time for conception.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fertility Insights */}
      {fertilityData && (
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Target className="w-5 h-5" />
              This Cycle's Fertility Window
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-pink-600">Fertile Window:</span>
                <span className="text-sm font-medium text-pink-700">
                  {format(fertilityData.fertileWindowStart, "MMM dd")} - {format(fertilityData.fertileWindowEnd, "MMM dd")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-pink-600">Peak Ovulation:</span>
                <span className="text-sm font-medium text-pink-700">
                  {format(fertilityData.ovulationDate, "MMM dd")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
