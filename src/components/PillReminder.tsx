
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Plus, Trash2, Clock, Bell, Check } from "lucide-react";
import { format, isToday, isBefore, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  times: string[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  date: Date;
  time: string;
  taken: boolean;
  notes?: string;
}

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

export const PillReminder = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: "",
    dosage: "",
    frequency: "daily",
    times: ["09:00"],
    startDate: new Date(),
    isActive: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load medications
    const savedMeds = localStorage.getItem("cyclesense-medications");
    if (savedMeds) {
      const parsed = JSON.parse(savedMeds);
      setMedications(parsed.map((med: any) => ({
        ...med,
        startDate: new Date(med.startDate),
        endDate: med.endDate ? new Date(med.endDate) : undefined,
      })));
    }

    // Load medication logs
    const savedLogs = localStorage.getItem("cyclesense-medication-logs");
    if (savedLogs) {
      const parsed = JSON.parse(savedLogs);
      setMedicationLogs(parsed.map((log: any) => ({
        ...log,
        date: new Date(log.date),
      })));
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const saveMedications = (meds: Medication[]) => {
    localStorage.setItem("cyclesense-medications", JSON.stringify(meds));
    setMedications(meds);
  };

  const saveLogs = (logs: MedicationLog[]) => {
    localStorage.setItem("cyclesense-medication-logs", JSON.stringify(logs));
    setMedicationLogs(logs);
  };

  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast({
        title: "Missing information",
        description: "Please fill in medication name and dosage",
        variant: "destructive",
      });
      return;
    }

    const medication: Medication = {
      id: Date.now().toString(),
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency || "daily",
      times: newMedication.times || ["09:00"],
      startDate: newMedication.startDate || new Date(),
      endDate: newMedication.endDate,
      isActive: true,
      notes: newMedication.notes,
    };

    saveMedications([...medications, medication]);
    setNewMedication({
      name: "",
      dosage: "",
      frequency: "daily",
      times: ["09:00"],
      startDate: new Date(),
      isActive: true,
    });
    setShowAddDialog(false);

    toast({
      title: "Medication added",
      description: `${medication.name} has been added to your reminders`,
    });

    // Schedule notifications
    scheduleNotifications(medication);
  };

  const toggleMedication = (id: string) => {
    const updated = medications.map(med =>
      med.id === id ? { ...med, isActive: !med.isActive } : med
    );
    saveMedications(updated);
  };

  const deleteMedication = (id: string) => {
    const updated = medications.filter(med => med.id !== id);
    saveMedications(updated);
    
    // Also remove related logs
    const updatedLogs = medicationLogs.filter(log => log.medicationId !== id);
    saveLogs(updatedLogs);

    toast({
      title: "Medication removed",
      description: "Medication and its logs have been deleted",
    });
  };

  const logMedication = (medicationId: string, time: string, taken: boolean) => {
    const newLog: MedicationLog = {
      id: Date.now().toString(),
      medicationId,
      date: new Date(),
      time,
      taken,
    };

    // Remove existing log for same medication, date, and time
    const filteredLogs = medicationLogs.filter(log => 
      !(log.medicationId === medicationId && 
        format(log.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') &&
        log.time === time)
    );

    saveLogs([...filteredLogs, newLog]);

    toast({
      title: taken ? "Medication taken" : "Medication skipped",
      description: `${medications.find(m => m.id === medicationId)?.name} logged`,
    });
  };

  const scheduleNotifications = (medication: Medication) => {
    if (Notification.permission !== "granted") return;

    medication.times.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const notificationTime = new Date();
      notificationTime.setHours(hours, minutes, 0, 0);

      if (notificationTime <= now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      const timeout = notificationTime.getTime() - now.getTime();

      setTimeout(() => {
        new Notification(`Time for ${medication.name}`, {
          body: `Take ${medication.dosage}`,
          icon: "/favicon.ico",
        });
      }, timeout);
    });
  };

  const getTodaysSchedule = () => {
    const today = new Date();
    const schedule: Array<{
      medication: Medication;
      time: string;
      taken: boolean;
      overdue: boolean;
    }> = [];

    medications
      .filter(med => med.isActive)
      .forEach(med => {
        med.times.forEach(time => {
          const log = medicationLogs.find(log =>
            log.medicationId === med.id &&
            format(log.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') &&
            log.time === time
          );

          const [hours, minutes] = time.split(':').map(Number);
          const scheduledTime = new Date();
          scheduledTime.setHours(hours, minutes, 0, 0);

          schedule.push({
            medication: med,
            time,
            taken: log?.taken || false,
            overdue: scheduledTime < new Date() && !log?.taken,
          });
        });
      });

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  };

  const addTimeSlot = () => {
    const times = newMedication.times || [];
    setNewMedication({
      ...newMedication,
      times: [...times, "09:00"],
    });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const times = [...(newMedication.times || [])];
    times[index] = value;
    setNewMedication({
      ...newMedication,
      times,
    });
  };

  const removeTimeSlot = (index: number) => {
    const times = [...(newMedication.times || [])];
    times.splice(index, 1);
    setNewMedication({
      ...newMedication,
      times,
    });
  };

  const todaysSchedule = getTodaysSchedule();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-100/70 to-indigo-100/70 border-blue-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Pill className="w-5 h-5" />
            Pill & Medication Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-blue-600 text-sm">
              Never miss a dose with personalized medication reminders.
            </p>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Medication</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="med-name">Medication Name</Label>
                    <Input
                      id="med-name"
                      value={newMedication.name || ""}
                      onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                      placeholder="e.g., Birth Control Pill"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="med-dosage">Dosage</Label>
                    <Input
                      id="med-dosage"
                      value={newMedication.dosage || ""}
                      onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                      placeholder="e.g., 1 tablet"
                    />
                  </div>

                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={newMedication.frequency}
                      onValueChange={(value: any) => setNewMedication({...newMedication, frequency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencyOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Reminder Times</Label>
                    <div className="space-y-2">
                      {(newMedication.times || []).map((time, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => updateTimeSlot(index, e.target.value)}
                            className="flex-1"
                          />
                          {(newMedication.times?.length || 0) > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeTimeSlot(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addTimeSlot}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Time
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="med-notes">Notes (optional)</Label>
                    <Input
                      id="med-notes"
                      value={newMedication.notes || ""}
                      onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                      placeholder="Take with food..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addMedication}>
                      Add Medication
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-700">
            <Clock className="w-5 h-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysSchedule.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No medications scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysSchedule.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    item.taken
                      ? "bg-green-50 border-green-200"
                      : item.overdue
                      ? "bg-red-50 border-red-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-700">
                          {item.medication.name}
                        </h4>
                        <Badge variant="outline">{item.time}</Badge>
                        {item.overdue && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                        {item.taken && (
                          <Badge className="bg-green-500">Taken</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {item.medication.dosage}
                      </p>
                      {item.medication.notes && (
                        <p className="text-xs text-slate-500 mt-1">
                          {item.medication.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={item.taken ? "outline" : "default"}
                        size="sm"
                        onClick={() => logMedication(item.medication.id, item.time, !item.taken)}
                      >
                        {item.taken ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Taken
                          </>
                        ) : (
                          "Mark Taken"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-700">My Medications</CardTitle>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No medications added yet</p>
              <p className="text-sm text-slate-400">Add your first medication to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className={`p-4 rounded-lg border-2 ${
                    med.isActive ? "border-slate-200" : "border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-700">{med.name}</h4>
                        <Badge variant="outline">{med.frequency}</Badge>
                        {!med.isActive && (
                          <Badge variant="secondary">Paused</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{med.dosage}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Times: {med.times.join(", ")}</span>
                      </div>
                      {med.notes && (
                        <p className="text-xs text-slate-500 mt-1">{med.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={med.isActive}
                        onCheckedChange={() => toggleMedication(med.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMedication(med.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
