
import { useState, useEffect } from "react";
import { Bell, Plus, Calendar, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Reminder {
  id: string;
  title: string;
  type: "period-start" | "period-log" | "custom";
  enabled: boolean;
  daysBefore?: number;
  customDate?: Date;
}

export const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
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
      {/* Notification Settings */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-purple-700 font-medium">
                  Browser Notifications
                </Label>
                <p className="text-sm text-purple-600">
                  Get notified about upcoming periods and reminders
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!notificationsEnabled && (
                  <Button
                    onClick={requestNotificationPermission}
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600"
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  📱 Enable notifications to receive period reminders even when the app is closed
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-pink-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Reminders
            </div>
            <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
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
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reminders set up yet</p>
                <p className="text-sm text-gray-400">Add your first reminder to get started</p>
              </div>
            ) : (
              reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    reminder.enabled
                      ? "bg-pink-50 border-pink-200"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getReminderIcon(reminder.type)}</span>
                        <h4 className="font-semibold text-gray-700">{reminder.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
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

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-pink-700">💡 Reminder Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-pink-500">•</span>
              <p className="text-gray-600">
                Smart reminders use your cycle data to predict when your period might start
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-pink-500">•</span>
              <p className="text-gray-600">
                Custom reminders can help you remember to take supplements or medications
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-pink-500">•</span>
              <p className="text-gray-600">
                All reminders work even when the app is closed (with notifications enabled)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
