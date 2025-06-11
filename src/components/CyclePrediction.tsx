
import { useState, useEffect } from "react";
import { Brain, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addDays, differenceInDays } from "date-fns";

interface PeriodEntry {
  id: string;
  startDate: Date;
  endDate?: Date;
}

interface Prediction {
  nextPeriodDate: Date;
  cycleLength: number;
  confidence: number;
  irregularityScore: number;
}

export const CyclePrediction = () => {
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    const savedPeriods = localStorage.getItem("cyclesense-periods");
    if (savedPeriods) {
      const parsed = JSON.parse(savedPeriods);
      const periodsData = parsed.map((p: any) => ({
        ...p,
        startDate: new Date(p.startDate),
        endDate: p.endDate ? new Date(p.endDate) : undefined,
      }));
      setPeriods(periodsData);
      generatePrediction(periodsData);
    }
  }, []);

  const generatePrediction = (periodsData: PeriodEntry[]) => {
    const completedPeriods = periodsData.filter(p => p.endDate);
    
    if (completedPeriods.length < 2) {
      setPrediction(null);
      return;
    }

    // Calculate cycle lengths
    const cycleLengths: number[] = [];
    for (let i = 1; i < completedPeriods.length; i++) {
      const prevPeriod = completedPeriods[i - 1];
      const currentPeriod = completedPeriods[i];
      const cycleLength = differenceInDays(currentPeriod.startDate, prevPeriod.startDate);
      cycleLengths.push(cycleLength);
    }

    // Calculate average cycle length
    const avgCycleLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;

    // Calculate irregularity score (standard deviation)
    const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - avgCycleLength, 2), 0) / cycleLengths.length;
    const standardDeviation = Math.sqrt(variance);
    const irregularityScore = Math.min(standardDeviation / 7, 1); // Normalize to 0-1

    // Calculate confidence based on data consistency
    const confidence = Math.max(0.3, 1 - irregularityScore);

    // Predict next period
    const lastPeriod = completedPeriods[completedPeriods.length - 1];
    const nextPeriodDate = addDays(lastPeriod.startDate, Math.round(avgCycleLength));

    setPrediction({
      nextPeriodDate,
      cycleLength: Math.round(avgCycleLength),
      confidence: Math.round(confidence * 100) / 100,
      irregularityScore: Math.round(irregularityScore * 100) / 100,
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-700";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getIrregularityStatus = (score: number) => {
    if (score <= 0.3) return { label: "Regular", color: "bg-green-100 text-green-700" };
    if (score <= 0.6) return { label: "Slightly Irregular", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Irregular", color: "bg-red-100 text-red-700" };
  };

  if (!prediction) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Brain className="w-5 h-5" />
              AI Cycle Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-purple-600 mb-4">
              Need at least 2 completed cycles to generate predictions
            </p>
            <p className="text-sm text-purple-500">
              Keep logging your periods to unlock AI-powered predictions and anomaly detection!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const irregularityStatus = getIrregularityStatus(prediction.irregularityScore);
  const daysUntilNext = differenceInDays(prediction.nextPeriodDate, new Date());

  return (
    <div className="space-y-6">
      {/* Main Prediction Card */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Brain className="w-5 h-5" />
            AI Cycle Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-purple-700 mb-2">
              Next Period Predicted
            </h3>
            <p className="text-lg text-purple-600 mb-1">
              {format(prediction.nextPeriodDate, "EEEE, MMM dd, yyyy")}
            </p>
            <p className="text-sm text-purple-500">
              {daysUntilNext > 0 ? `In ${daysUntilNext} days` : 
               daysUntilNext === 0 ? "Today" : 
               `${Math.abs(daysUntilNext)} days overdue`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Confidence</span>
              </div>
              <Badge className={getConfidenceColor(prediction.confidence)}>
                {Math.round(prediction.confidence * 100)}%
              </Badge>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Avg Cycle</span>
              </div>
              <Badge variant="secondary">
                {prediction.cycleLength} days
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <AlertTriangle className="w-5 h-5" />
            Cycle Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Cycle Regularity</span>
                <Badge className={irregularityStatus.color}>
                  {irregularityStatus.label}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-red-400 h-2 rounded-full"
                  style={{ width: `${prediction.irregularityScore * 100}%` }}
                ></div>
              </div>
            </div>

            {prediction.irregularityScore > 0.6 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-700 mb-2">Irregular Cycle Detected</h4>
                <p className="text-sm text-red-600">
                  Your cycle shows significant variation. Consider consulting with a healthcare provider 
                  if this continues or if you experience other symptoms.
                </p>
              </div>
            )}

            {prediction.confidence < 0.5 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-700 mb-2">Low Prediction Confidence</h4>
                <p className="text-sm text-yellow-600">
                  Your cycle data shows high variability. Log more cycles for more accurate predictions.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cycle History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-pink-700">Recent Cycle Lengths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {periods
              .filter(p => p.endDate)
              .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
              .slice(1, 6)
              .map((period, index, arr) => {
                if (index === arr.length - 1) return null;
                const nextPeriod = periods.find(p => 
                  p.startDate.getTime() > period.startDate.getTime() && p.endDate
                );
                if (!nextPeriod) return null;
                
                const cycleLength = differenceInDays(nextPeriod.startDate, period.startDate);
                const isNormal = cycleLength >= 21 && cycleLength <= 35;
                
                return (
                  <div key={period.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">
                      {format(period.startDate, "MMM dd")} - {format(nextPeriod.startDate, "MMM dd")}
                    </span>
                    <Badge variant={isNormal ? "secondary" : "destructive"}>
                      {cycleLength} days
                    </Badge>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
