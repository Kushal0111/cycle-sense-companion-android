
import { useState, useEffect } from "react";
import { Calendar, Plus, Droplets, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { cycleDB, PeriodEntry } from "@/utils/cycleDatabase";

export const CycleTracker = () => {
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isLoggingStart, setIsLoggingStart] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const data = cycleDB.getCycleData();
    setPeriods(data.periods);
  }, []);

  const refreshData = () => {
    const data = cycleDB.getCycleData();
    setPeriods(data.periods);
  };

  const getCurrentPeriod = () => {
    return periods.find(p => p.startDate && !p.endDate);
  };

  const getLastPeriod = () => {
    const completedPeriods = periods.filter(p => p.endDate);
    return completedPeriods.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];
  };

  const logPeriodStart = (date: Date) => {
    const currentPeriod = getCurrentPeriod();
    if (currentPeriod) {
      toast({
        title: "Period already active",
        description: "Please end your current period before starting a new one.",
        variant: "destructive",
      });
      return;
    }

    const newPeriod: PeriodEntry = {
      id: Date.now().toString(),
      startDate: date,
    };

    cycleDB.addPeriod(newPeriod);
    refreshData();
    toast({
      title: "Period started",
      description: `Logged period start for ${format(date, "MMM dd, yyyy")}`,
    });
    setShowCalendar(false);
    setShowConfirm(false);
    setSelectedDate(undefined);
  };

  const logPeriodEnd = (date: Date) => {
    const currentPeriod = getCurrentPeriod();
    if (!currentPeriod) {
      toast({
        title: "No active period",
        description: "Please start a period before ending one.",
        variant: "destructive",
      });
      return;
    }

    cycleDB.updatePeriod(currentPeriod.id, { endDate: date });
    refreshData();
    toast({
      title: "Period ended",
      description: `Logged period end for ${format(date, "MMM dd, yyyy")}`,
    });
    setShowCalendar(false);
    setShowConfirm(false);
    setSelectedDate(undefined);
  };

  const deletePeriod = (periodId: string) => {
    cycleDB.deletePeriod(periodId);
    refreshData();
    toast({
      title: "Period deleted",
      description: "Period entry has been removed.",
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!selectedDate) return;
    
    if (isLoggingStart) {
      logPeriodStart(selectedDate);
    } else {
      logPeriodEnd(selectedDate);
    }
  };

  const handleCancel = () => {
    setSelectedDate(undefined);
    setShowConfirm(false);
  };

  const currentPeriod = getCurrentPeriod();
  const lastPeriod = getLastPeriod();
  const daysSinceLastPeriod = lastPeriod ? differenceInDays(new Date(), lastPeriod.endDate || lastPeriod.startDate) : null;

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <Droplets className="w-5 h-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPeriod ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-pink-700 mb-2">
                Period Active
              </p>
              <p className="text-pink-600">
                Day {differenceInDays(new Date(), currentPeriod.startDate) + 1} of current cycle
              </p>
              <p className="text-sm text-pink-500 mt-1">
                Started {format(currentPeriod.startDate, "MMM dd, yyyy")}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg font-semibold text-purple-700 mb-2">
                Period Not Active
              </p>
              {daysSinceLastPeriod !== null ? (
                <p className="text-purple-600">
                  {daysSinceLastPeriod} days since last period
                </p>
              ) : (
                <p className="text-purple-600">
                  No previous periods logged
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-4">
        <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsLoggingStart(true);
                setShowConfirm(false);
                setSelectedDate(undefined);
              }}
              className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-6"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Log Period Start
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Period Start Date</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                />
              </div>
              {showConfirm && selectedDate && (
                <div className="space-y-3">
                  <p className="text-center text-sm text-gray-600">
                    Confirm period start date: <strong>{format(selectedDate, "MMM dd, yyyy")}</strong>
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleConfirm} className="bg-green-500 hover:bg-green-600">
                      <Check className="w-4 h-4 mr-2" />
                      Confirm
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {currentPeriod && (
          <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setIsLoggingStart(false);
                  setShowConfirm(false);
                  setSelectedDate(undefined);
                }}
                variant="outline"
                className="border-pink-300 text-pink-600 hover:bg-pink-50 py-6"
                size="lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Log Period End
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Period End Date</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                  />
                </div>
                {showConfirm && selectedDate && (
                  <div className="space-y-3">
                    <p className="text-center text-sm text-gray-600">
                      Confirm period end date: <strong>{format(selectedDate, "MMM dd, yyyy")}</strong>
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleConfirm} className="bg-green-500 hover:bg-green-600">
                        <Check className="w-4 h-4 mr-2" />
                        Confirm
                      </Button>
                      <Button onClick={handleCancel} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Recent Periods */}
      {periods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-pink-700">Recent Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {periods
                .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
                .slice(0, 5)
                .map((period) => (
                  <div
                    key={period.id}
                    className="flex justify-between items-center p-3 bg-pink-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-pink-700">
                        {format(period.startDate, "MMM dd, yyyy")}
                        {period.endDate && ` - ${format(period.endDate, "MMM dd, yyyy")}`}
                      </p>
                      <p className="text-sm text-pink-600">
                        {period.endDate
                          ? `${differenceInDays(period.endDate, period.startDate) + 1} days`
                          : "Ongoing"
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!period.endDate && (
                        <span className="px-2 py-1 bg-pink-200 text-pink-700 text-xs rounded-full">
                          Active
                        </span>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Period Entry</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this period entry? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePeriod(period.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
