
import { useState, useEffect } from "react";
import { Brain, Calendar, TrendingUp, AlertTriangle, Target, Clock, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, differenceInDays } from "date-fns";
import { cycleDB, PredictionResult } from "@/utils/cycleDatabase";

export const CyclePrediction = () => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const newPrediction = cycleDB.predictNextPeriod();
    setPrediction(newPrediction);
  }, []);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 'moderate': return "bg-amber-100 text-amber-700 border-amber-200";
      case 'low': return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getConfidenceDescription = (confidence: string) => {
    switch (confidence) {
      case 'high': return "Based on consistent cycle patterns";
      case 'moderate': return "Based on available data with some variation";
      case 'low': return "Limited data available for prediction";
      default: return "";
    }
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
              Need at least 1 completed cycle to generate predictions
            </p>
            <p className="text-sm text-purple-500">
              Keep logging your periods to unlock AI-powered predictions and anomaly detection!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysUntilNext = differenceInDays(prediction.startDate, new Date());
  const windowStart = differenceInDays(prediction.predictionWindow.earliestStart, new Date());
  const windowEnd = differenceInDays(prediction.predictionWindow.latestStart, new Date());

  return (
    <div className="space-y-6">
      {/* Main Prediction Card */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Brain className="w-5 h-5" />
            Advanced AI Cycle Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-purple-700 mb-2">
              Next Period Predicted
            </h3>
            <p className="text-lg text-purple-600 mb-1">
              {format(prediction.startDate, "EEEE, MMM dd, yyyy")}
            </p>
            <p className="text-sm text-purple-500">
              {daysUntilNext > 0 ? `In ${daysUntilNext} days` : 
               daysUntilNext === 0 ? "Today" : 
               `${Math.abs(daysUntilNext)} days overdue`}
            </p>
          </div>

          {/* Prediction Window */}
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-purple-700">Prediction Window</span>
            </div>
            <p className="text-sm text-purple-600">
              Your next period is expected between{" "}
              <span className="font-semibold">
                {format(prediction.predictionWindow.earliestStart, "MMM dd")}
              </span>{" "}
              and{" "}
              <span className="font-semibold">
                {format(prediction.predictionWindow.latestStart, "MMM dd")}
              </span>
            </p>
            <p className="text-xs text-purple-500 mt-1">
              ({windowStart > 0 ? `${windowStart} to ${windowEnd}` : 
                windowEnd > 0 ? `Now to ${windowEnd}` : "Within range"} days from today)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Confidence</span>
              </div>
              <Badge className={getConfidenceColor(prediction.confidence)}>
                {prediction.confidence.charAt(0).toUpperCase() + prediction.confidence.slice(1)}
              </Badge>
              <p className="text-xs text-purple-500 mt-1">
                {getConfidenceDescription(prediction.confidence)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Based On</span>
              </div>
              <Badge variant="secondary">
                {prediction.cyclesUsed} cycle{prediction.cyclesUsed !== 1 ? 's' : ''}
              </Badge>
              <p className="text-xs text-purple-500 mt-1">
                Recent cycle data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cycle Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <AlertTriangle className="w-5 h-5" />
            Detailed Cycle Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Cycle Variation</span>
                </div>
                <p className="text-lg font-bold text-blue-600">±{prediction.variation} days</p>
                <p className="text-xs text-blue-500">Standard deviation</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Period Duration</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {differenceInDays(prediction.endDate, prediction.startDate) + 1} days
                </p>
                <p className="text-xs text-green-500">Expected length</p>
              </div>
            </div>

            {prediction.isIrregular && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Irregular Cycle Detected:</strong> Your cycles show significant variation. 
                  This is normal for many people, but consider tracking additional factors like stress, 
                  diet, or exercise that might influence your cycle.
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {prediction.warnings.length > 0 && (
              <div className="space-y-2">
                {prediction.warnings.map((warning, index) => (
                  <Alert key={index} className="border-amber-200 bg-amber-50">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      {warning}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scientific Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-teal-700">Clinical Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="font-semibold text-teal-700 mb-2">Normal Cycle Length</h4>
              <p className="text-teal-600">21-35 days</p>
              <p className="text-xs text-teal-500 mt-1">According to medical standards</p>
            </div>
            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="font-semibold text-teal-700 mb-2">Normal Period Duration</h4>
              <p className="text-teal-600">2-7 days</p>
              <p className="text-xs text-teal-500 mt-1">Typical bleeding period</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Ovulation Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-700">Fertility Window</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-emerald-50 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-700 mb-2">Predicted Ovulation</h4>
            <p className="text-emerald-600 mb-1">
              {format(prediction.ovulationDate, "EEEE, MMM dd, yyyy")}
            </p>
            <p className="text-sm text-emerald-500">
              Approximately 14 days before your next period
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
