
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Droplets, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, addDays, isSameDay, isWithinInterval } from "date-fns";

interface PeriodEntry {
  id: string;
  startDate: Date;
  endDate?: Date;
}

export const CycleCalendar = () => {
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();

  useEffect(() => {
    const savedPeriods = localStorage.getItem("cyclesense-periods");
    if (savedPeriods) {
      const parsed = JSON.parse(savedPeriods);
      setPeriods(parsed.map((p: any) => ({
        ...p,
        startDate: new Date(p.startDate),
        endDate: p.endDate ? new Date(p.endDate) : undefined,
      })));
    }
  }, []);

  const getPeriodForDate = (date: Date) => {
    return periods.find(period => {
      if (!period.endDate) {
        return isSameDay(date, period.startDate) || 
               (date >= period.startDate && differenceInDays(date, period.startDate) <= 7);
      }
      return isWithinInterval(date, { start: period.startDate, end: period.endDate });
    });
  };

  const getPhaseForDate = (date: Date) => {
    const period = getPeriodForDate(date);
    if (period) {
      const dayOfPeriod = differenceInDays(date, period.startDate) + 1;
      return { phase: "Menstrual", day: dayOfPeriod, description: "Period flow" };
    }

    // Check for ovulation and follicular phases
    const lastPeriod = periods
      .filter(p => p.endDate && p.endDate < date)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];

    if (lastPeriod && lastPeriod.endDate) {
      const daysSinceLastPeriod = differenceInDays(date, lastPeriod.endDate);
      
      if (daysSinceLastPeriod >= 1 && daysSinceLastPeriod <= 6) {
        return { phase: "Follicular", day: daysSinceLastPeriod, description: "Post-menstrual phase" };
      } else if (daysSinceLastPeriod >= 7 && daysSinceLastPeriod <= 10) {
        return { phase: "Ovulation", day: daysSinceLastPeriod - 6, description: "Fertile window" };
      } else if (daysSinceLastPeriod >= 11 && daysSinceLastPeriod <= 20) {
        return { phase: "Luteal", day: daysSinceLastPeriod - 10, description: "Pre-menstrual phase" };
      }
    }

    return null;
  };

  const getSelectedDateInfo = () => {
    if (!selectedDate) return null;
    
    const period = getPeriodForDate(selectedDate);
    const phase = getPhaseForDate(selectedDate);
    
    return {
      date: selectedDate,
      period,
      phase
    };
  };

  const isDayHighlighted = (date: Date) => {
    return !!getPeriodForDate(date);
  };

  const getDayClass = (date: Date) => {
    const period = getPeriodForDate(date);
    const phase = getPhaseForDate(date);
    
    if (period) {
      return "bg-red-100 text-red-700 hover:bg-red-200";
    }
    
    if (phase) {
      switch (phase.phase) {
        case "Follicular":
          return "bg-blue-100 text-blue-700 hover:bg-blue-200";
        case "Ovulation":
          return "bg-green-100 text-green-700 hover:bg-green-200";
        case "Luteal":
          return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
        default:
          return "";
      }
    }
    
    return "";
  };

  const selectedInfo = getSelectedDateInfo();

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <CalendarIcon className="w-5 h-5" />
            Cycle Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-pink-600 text-sm">
            Track your menstrual cycle phases throughout the month. Click on any date to see details.
          </p>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
            modifiers={{
              highlighted: isDayHighlighted
            }}
            modifiersClassNames={{
              highlighted: "font-bold"
            }}
            components={{
              Day: ({ date, ...props }) => {
                const dayClass = getDayClass(date);
                return (
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-md text-sm cursor-pointer ${dayClass}`}
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
          <CardTitle className="text-pink-700">Phase Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-sm">Menstrual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-sm">Follicular</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-sm">Ovulation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span className="text-sm">Luteal</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-pink-700">
              {format(selectedInfo.date, "MMMM dd, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedInfo.period ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-red-500" />
                    <Badge variant="destructive">Menstrual Phase</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Day {differenceInDays(selectedInfo.date, selectedInfo.period.startDate) + 1} of period
                  </p>
                  <p className="text-sm text-gray-600">
                    Started: {format(selectedInfo.period.startDate, "MMM dd")}
                    {selectedInfo.period.endDate && ` - Ended: ${format(selectedInfo.period.endDate, "MMM dd")}`}
                  </p>
                </div>
              ) : selectedInfo.phase ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <Badge variant="secondary">{selectedInfo.phase.phase} Phase</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Day {selectedInfo.phase.day} of {selectedInfo.phase.phase.toLowerCase()} phase
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedInfo.phase.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">No cycle data for this date</p>
                  <p className="text-xs text-gray-500">Start logging your periods to see detailed cycle information</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cycle Statistics */}
      {periods.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <TrendingUp className="w-5 h-5" />
              Cycle Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">
                  {Math.round(
                    periods
                      .filter(p => p.endDate)
                      .reduce((sum, p) => sum + differenceInDays(p.endDate!, p.startDate) + 1, 0) /
                    periods.filter(p => p.endDate).length
                  )}
                </p>
                <p className="text-sm text-gray-600">Avg. Period Length</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{periods.length}</p>
                <p className="text-sm text-gray-600">Total Periods Logged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
