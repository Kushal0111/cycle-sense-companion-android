
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Droplets, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, isSameDay, isWithinInterval, isBefore, isAfter } from "date-fns";
import { cycleDB, PeriodEntry } from "@/utils/cycleDatabase";

export const CycleCalendar = () => {
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [prediction, setPrediction] = useState<{ startDate: Date; endDate: Date; ovulationDate: Date } | null>(null);

  useEffect(() => {
    const data = cycleDB.getCycleData();
    setPeriods(data.periods);
    setPrediction(cycleDB.predictNextPeriod());
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

  const isLoggedOvulationDay = (date: Date) => {
    return cycleDB.isOvulationPhase(date) && periods.some(p => p.endDate && isBefore(date, new Date()));
  };

  const isPredictedPeriodDay = (date: Date) => {
    if (!prediction) return false;
    return isWithinInterval(date, { start: prediction.startDate, end: prediction.endDate });
  };

  const isPredictedOvulationDay = (date: Date) => {
    if (!prediction) return false;
    return isSameDay(date, prediction.ovulationDate);
  };

  const getPhaseForDate = (date: Date) => {
    const period = getPeriodForDate(date);
    if (period) {
      const dayOfPeriod = differenceInDays(date, period.startDate) + 1;
      return { phase: "Menstrual", day: dayOfPeriod, description: "Period flow" };
    }

    if (isLoggedOvulationDay(date)) {
      return { phase: "Ovulation", day: 1, description: "Fertile window" };
    }

    if (isPredictedPeriodDay(date)) {
      return { phase: "Predicted Period", day: differenceInDays(date, prediction!.startDate) + 1, description: "AI predicted period" };
    }

    if (isPredictedOvulationDay(date)) {
      return { phase: "Predicted Ovulation", day: 1, description: "AI predicted ovulation" };
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

  const getDayClass = (date: Date) => {
    const period = getPeriodForDate(date);
    
    // Logged period days - red
    if (period) {
      return "bg-red-500 text-white hover:bg-red-600";
    }
    
    // Logged ovulation days - green
    if (isLoggedOvulationDay(date)) {
      return "bg-green-500 text-white hover:bg-green-600";
    }
    
    // Predicted period days - light red
    if (isPredictedPeriodDay(date)) {
      return "bg-red-200 text-red-800 hover:bg-red-300";
    }
    
    // Predicted ovulation day - light green
    if (isPredictedOvulationDay(date)) {
      return "bg-green-200 text-green-800 hover:bg-green-300";
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
            Track your menstrual cycle phases throughout the month. Red shows logged periods, green shows ovulation phases.
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
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Logged Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Logged Ovulation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
              <span className="text-sm">Predicted Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
              <span className="text-sm">Predicted Ovulation</span>
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
                    <Badge variant="secondary">{selectedInfo.phase.phase}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedInfo.phase.description}
                  </p>
                  {selectedInfo.phase.phase.includes("Predicted") && (
                    <p className="text-xs text-gray-500">Based on AI prediction</p>
                  )}
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
                  {cycleDB.getCycleData().averagePeriodLength}
                </p>
                <p className="text-sm text-gray-600">Avg. Period Length</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {cycleDB.getCycleData().averageCycleLength}
                </p>
                <p className="text-sm text-gray-600">Avg. Cycle Length</p>
              </div>
            </div>
            {prediction && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">Next Period Prediction</h4>
                <p className="text-sm text-blue-600">
                  Expected: {format(prediction.startDate, "MMM dd")} - {format(prediction.endDate, "MMM dd")}
                </p>
                <p className="text-sm text-blue-600">
                  Ovulation: {format(prediction.ovulationDate, "MMM dd")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
