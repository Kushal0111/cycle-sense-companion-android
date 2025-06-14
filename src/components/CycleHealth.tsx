
import { useState, useEffect } from "react";
import { Heart, AlertTriangle, CheckCircle, Info, Calendar, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cycleDB, HealthAnalysis } from "@/utils/cycleDatabase";

export const CycleHealth = () => {
  const [healthAnalysis, setHealthAnalysis] = useState<HealthAnalysis | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const analysis = cycleDB.analyzeCycleHealth();
    setHealthAnalysis(analysis);
  }, []);

  if (!healthAnalysis) return null;

  const getStatusColor = (status: HealthAnalysis['status']) => {
    switch (status) {
      case 'healthy': return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case 'irregular': return "text-amber-700 bg-amber-50 border-amber-200";
      case 'concerning': return "text-red-700 bg-red-50 border-red-200";
      case 'insufficient_data': return "text-blue-700 bg-blue-50 border-blue-200";
      default: return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  const getStatusIcon = (status: HealthAnalysis['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'irregular': return <AlertTriangle className="w-5 h-5" />;
      case 'concerning': return <AlertTriangle className="w-5 h-5" />;
      case 'insufficient_data': return <Info className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityBadge = (severity: HealthAnalysis['severity']) => {
    const colors = {
      low: "bg-green-100 text-green-700 border-green-200",
      medium: "bg-amber-100 text-amber-700 border-amber-200",
      high: "bg-red-100 text-red-700 border-red-200"
    };
    
    return (
      <Badge className={colors[severity]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)} Priority
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Health Status Card */}
      <Card className={`${getStatusColor(healthAnalysis.status)} border-2`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(healthAnalysis.status)}
            Cycle Health Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">
                {healthAnalysis.message}
              </p>
              {healthAnalysis.status !== 'insufficient_data' && getSeverityBadge(healthAnalysis.severity)}
            </div>

            {healthAnalysis.status !== 'insufficient_data' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-semibold">Average Cycle</span>
                  </div>
                  <p className="text-lg font-bold">{healthAnalysis.details.averageCycleLength} days</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">Variation</span>
                  </div>
                  <p className="text-lg font-bold">±{healthAnalysis.details.standardDeviation} days</p>
                </div>
              </div>
            )}

            <Button 
              variant="outline" 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full mt-4"
            >
              {showDetails ? 'Hide Details' : 'Show Detailed Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      {showDetails && healthAnalysis.status !== 'insufficient_data' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Clock className="w-5 h-5" />
              Detailed Cycle Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-3">
                  <h4 className="font-semibold text-purple-700 mb-2">Cycles Analyzed</h4>
                  <p className="text-2xl font-bold text-purple-600">{healthAnalysis.details.totalCycles}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <h4 className="font-semibold text-purple-700 mb-2">Irregular Cycles</h4>
                  <p className="text-2xl font-bold text-purple-600">{healthAnalysis.details.irregularityCount}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-2">Individual Cycle Lengths</h4>
                <div className="flex flex-wrap gap-2">
                  {healthAnalysis.details.cycleLengths.map((length, index) => (
                    <span 
                      key={index}
                      className={`px-2 py-1 rounded text-sm ${
                        Math.abs(length - healthAnalysis.details.averageCycleLength) > 7
                          ? 'bg-red-100 text-red-700'
                          : length < 21 || length > 35
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {length} days
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <Heart className="w-5 h-5" />
            Health Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthAnalysis.recommendations.map((recommendation, index) => (
              <Alert key={index} className="border-teal-200 bg-teal-50">
                <Info className="h-4 w-4 text-teal-600" />
                <AlertDescription className="text-teal-700">
                  {recommendation}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clinical Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-700">Clinical Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-indigo-50 rounded-lg p-3">
              <h4 className="font-semibold text-indigo-700 mb-2">Normal Cycle Length</h4>
              <p className="text-indigo-600">21-35 days</p>
              <p className="text-xs text-indigo-500 mt-1">Medical standard range</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3">
              <h4 className="font-semibold text-indigo-700 mb-2">Normal Period Duration</h4>
              <p className="text-indigo-600">2-7 days</p>
              <p className="text-xs text-indigo-500 mt-1">Typical bleeding period</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3">
              <h4 className="font-semibold text-indigo-700 mb-2">Normal Variation</h4>
              <p className="text-indigo-600">±3-5 days</p>
              <p className="text-xs text-indigo-500 mt-1">Acceptable cycle variation</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3">
              <h4 className="font-semibold text-indigo-700 mb-2">Irregularity Threshold</h4>
              <p className="text-indigo-600">>7 days variation</p>
              <p className="text-xs text-indigo-500 mt-1">When to consider medical advice</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
