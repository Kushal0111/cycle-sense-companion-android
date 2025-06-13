import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Droplets, Clock, TrendingUp, Bell, Plus, Trash2, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, differenceInDays, isSameDay, isWithinInterval, isBefore, isAfter } from "date-fns";
import { cycleDB, PeriodEntry } from "@/utils/cycleDatabase";
import { toast } from "@/hooks/use-toast";

interface Reminder {
  id: string;
  title: string;
  type: "period-start" | "period-log" | "custom";
  enabled: boolean;
  daysBefore?: number;
  customDate?: Date;
}

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

export const CycleCalendar = () => {
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [prediction, setPrediction] = useState<{ startDate: Date; endDate: Date; ovulationDate: Date } | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentTip, setCurrentTip] = useState("");

  useEffect(() => {
    const data = cycleDB.getCycleData();
    setPeriods(data.periods);
    setPrediction(cycleDB.predictNextPeriod());

    // Load saved reminders
    const savedReminders = localStorage.getItem("cyclesense-reminders");
    if (savedReminders) {
      const parsed = JSON.parse(savedReminders);
      setReminders(parsed.map((r: any) => ({
        ...r,
        customDate: r.customDate ? new Date(r.customDate) : undefined,
      })));
    } else {
      // Set default reminders
      const defaultReminders: Reminder[] = [
        {
          id: "1",
          title: "Period might start soon",
          type: "period-start",
          enabled: true,
          daysBefore: 2,
        },
        {
          id: "2",
          title: "Don't forget to log your period",
          type: "period-log",
          enabled: true,
          daysBefore: 0,
        },
      ];
      setReminders(defaultReminders);
      saveReminders(defaultReminders);
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }

    // Get a random tip when component mounts
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    setCurrentTip(randomTip);
  }, []);

  const saveReminders = (newReminders: Reminder[]) => {
    setReminders(newReminders);
    localStorage.setItem("cyclesense-reminders", JSON.stringify(newReminders));
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
      
      if (permission === "granted") {
        toast({
          title: "Notifications enabled",
          description: "You'll now receive period reminders",
        });
      } else {
        toast({
          title: "Notifications denied",
          description: "You can enable them later in your browser settings",
          variant: "destructive",
        });
      }
    }
  };

  const toggleReminder = (id: string) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
    );
    saveReminders(updatedReminders);
  };

  const deleteReminder = (id: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    saveReminders(updatedReminders);
    toast({
      title: "Reminder deleted",
      description: "The reminder has been removed",
    });
  };

  const addCustomReminder = () => {
    if (!newReminderTitle.trim()) return;

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: newReminderTitle,
      type: "custom",
      enabled: true,
    };

    saveReminders([...reminders, newReminder]);
    setNewReminderTitle("");
    setShowAddReminder(false);
    
    toast({
      title: "Reminder added",
      description: "Your custom reminder has been created",
    });
  };

  const getNewTip = () => {
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    setCurrentTip(randomTip);
  };

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
    
    if (period) {
      return "bg-rose-500 text-white hover:bg-rose-600";
    }
    
    if (isLoggedOvulationDay(date)) {
      return "bg-emerald-500 text-white hover:bg-emerald-600";
    }
    
    if (isPredictedPeriodDay(date)) {
      return "bg-rose-200 text-rose-800 hover:bg-rose-300";
    }
    
    if (isPredictedOvulationDay(date)) {
      return "bg-emerald-200 text-emerald-800 hover:bg-emerald-300";
    }
    
    return "";
  };

  const selectedInfo = getSelectedDateInfo();

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "period-start": return "🩸";
      case "period-log": return "📝";
      case "custom": return "⏰";
      default: return "🔔";
    }
  };

  const getReminderDescription = (reminder: Reminder) => {
    switch (reminder.type) {
      case "period-start":
        return `Reminds you ${reminder.daysBefore} days before your predicted period`;
      case "period-log":
        return "Reminds you to log your period when it starts";
      case "custom":
        return "Custom reminder you created";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="bg-gradient-to-r from-rose-100/70 to-purple-100/70 border-rose-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-700">
            <CalendarIcon className="w-5 h-5" />
            Cycle Calendar & Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-rose-600 text-sm">
            Track your menstrual cycle phases, manage reminders, and view health tips.
          </p>
        </CardContent>
      </Card>

      {/* Health Tip */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <Lightbulb className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-800 mb-1">Health Tip</h4>
                <p className="text-xs text-amber-700 leading-relaxed">{currentTip}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={getNewTip}
              className="text-xs text-amber-600 hover:text-amber-800 h-6 px-2 ml-2"
            >
              New tip
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
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

      {/* Phase Legend */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-slate-700">Phase Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rose-500 rounded"></div>
              <span className="text-sm text-slate-600">Logged Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-sm text-slate-600">Logged Ovulation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rose-200 border border-rose-300 rounded"></div>
              <span className="text-sm text-slate-600">Predicted Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-200 border border-emerald-300 rounded"></div>
              <span className="text-sm text-slate-600">Predicted Ovulation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedInfo && (
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-slate-700">
              {format(selectedInfo.date, "MMMM dd, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedInfo.period ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-rose-500" />
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

      {/* Notification Settings */}
      <Card className="bg-gradient-to-r from-indigo-100/70 to-purple-100/70 border-indigo-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-indigo-700 font-medium">
                  Browser Notifications
                </Label>
                <p className="text-sm text-indigo-600">
                  Get notified about upcoming periods and reminders
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!notificationsEnabled && (
                  <Button
                    onClick={requestNotificationPermission}
                    size="sm"
                    className="bg-indigo-500 hover:bg-indigo-600"
                  >
                    Enable
                  </Button>
                )}
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  disabled={!notificationsEnabled}
                />
              </div>
            </div>
            
            {!notificationsEnabled && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-700">
                  📱 Enable notifications to receive period reminders even when the app is closed
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Your Reminders
            </div>
            <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Reminder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reminder-title">Reminder Title</Label>
                    <Input
                      id="reminder-title"
                      value={newReminderTitle}
                      onChange={(e) => setNewReminderTitle(e.target.value)}
                      placeholder="e.g., Take iron supplement"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddReminder(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addCustomReminder}>
                      Add Reminder
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No reminders set up yet</p>
                <p className="text-sm text-slate-400">Add your first reminder to get started</p>
              </div>
            ) : (
              reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    reminder.enabled
                      ? "bg-purple-50/50 border-purple-200"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getReminderIcon(reminder.type)}</span>
                        <h4 className="font-semibold text-slate-700">{reminder.title}</h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {getReminderDescription(reminder)}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={reminder.enabled}
                            onCheckedChange={() => toggleReminder(reminder.id)}
                          />
                          <Label className="text-sm">
                            {reminder.enabled ? "Enabled" : "Disabled"}
                          </Label>
                        </div>
                        {reminder.type === "custom" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReminder(reminder.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cycle Statistics */}
      {periods.length > 1 && (
        <Card className="bg-gradient-to-r from-emerald-100/70 to-teal-100/70 border-emerald-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
              Cycle Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {cycleDB.getCycleData().averagePeriodLength}
                </p>
                <p className="text-sm text-slate-600">Avg. Period Length</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-600">
                  {cycleDB.getCycleData().averageCycleLength}
                </p>
                <p className="text-sm text-slate-600">Avg. Cycle Length</p>
              </div>
            </div>
            {prediction && (
              <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
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
