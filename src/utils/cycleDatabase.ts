import { differenceInDays, addDays, format } from "date-fns";

export interface PeriodEntry {
  id: string;
  startDate: Date;
  endDate?: Date;
  symptoms?: string[];
  flow?: 'light' | 'normal' | 'heavy';
  timestamp: Date;
}

export interface CycleData {
  periods: PeriodEntry[];
  averageCycleLength: number;
  averagePeriodLength: number;
}

export interface PredictionResult {
  startDate: Date;
  endDate: Date;
  ovulationDate: Date;
  confidence: 'low' | 'moderate' | 'high';
  predictionWindow: {
    earliestStart: Date;
    latestStart: Date;
  };
  isIrregular: boolean;
  cyclesUsed: number;
  variation: number;
  warnings: string[];
}

export interface HealthAnalysis {
  status: 'healthy' | 'irregular' | 'concerning' | 'insufficient_data';
  message: string;
  details: {
    averageCycleLength: number;
    standardDeviation: number;
    cycleLengths: number[];
    irregularityCount: number;
    totalCycles: number;
  };
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

class CycleDatabase {
  private storageKey = 'cyclesense-data';
  private backupKey = 'cyclesense-backup';

  getCycleData(): CycleData {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return {
          ...parsed,
          periods: parsed.periods.map((p: any) => ({
            ...p,
            startDate: new Date(p.startDate),
            endDate: p.endDate ? new Date(p.endDate) : undefined,
            timestamp: p.timestamp ? new Date(p.timestamp) : new Date(),
          }))
        };
      }
    } catch (error) {
      console.error('Error loading cycle data:', error);
      this.restoreFromBackup();
    }
    return { periods: [], averageCycleLength: 28, averagePeriodLength: 5 };
  }

  saveCycleData(data: CycleData): void {
    try {
      // Create backup before saving
      const currentData = localStorage.getItem(this.storageKey);
      if (currentData) {
        localStorage.setItem(this.backupKey, currentData);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving cycle data:', error);
    }
  }

  private restoreFromBackup(): void {
    try {
      const backup = localStorage.getItem(this.backupKey);
      if (backup) {
        localStorage.setItem(this.storageKey, backup);
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
    }
  }

  addPeriod(period: PeriodEntry): void {
    const data = this.getCycleData();
    const newPeriod = {
      ...period,
      timestamp: new Date()
    };
    data.periods.push(newPeriod);
    this.updateAverages(data);
    this.saveCycleData(data);
  }

  updatePeriod(periodId: string, updates: Partial<PeriodEntry>): void {
    const data = this.getCycleData();
    const index = data.periods.findIndex(p => p.id === periodId);
    if (index !== -1) {
      data.periods[index] = { ...data.periods[index], ...updates };
      this.updateAverages(data);
      this.saveCycleData(data);
    }
  }

  deletePeriod(periodId: string): void {
    const data = this.getCycleData();
    data.periods = data.periods.filter(p => p.id !== periodId);
    this.updateAverages(data);
    this.saveCycleData(data);
  }

  private updateAverages(data: CycleData): void {
    const completedPeriods = data.periods.filter(p => p.endDate);
    
    if (completedPeriods.length > 0) {
      data.averagePeriodLength = Math.round(
        completedPeriods.reduce((sum, p) => 
          sum + differenceInDays(p.endDate!, p.startDate) + 1, 0
        ) / completedPeriods.length
      );
    }

    if (completedPeriods.length > 1) {
      const cycles = completedPeriods
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        .slice(0, -1)
        .map((period, index) => {
          const nextPeriod = completedPeriods[index + 1];
          return differenceInDays(nextPeriod.startDate, period.startDate);
        });
      
      data.averageCycleLength = Math.round(
        cycles.reduce((sum, length) => sum + length, 0) / cycles.length
      );
    }
  }

  analyzeCycleHealth(): HealthAnalysis {
    const data = this.getCycleData();
    const completedPeriods = data.periods
      .filter(p => p.endDate)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    if (completedPeriods.length < 3) {
      return {
        status: 'insufficient_data',
        message: 'Not enough data to analyze cycle health. Log at least 3 complete cycles for analysis.',
        details: {
          averageCycleLength: 0,
          standardDeviation: 0,
          cycleLengths: [],
          irregularityCount: 0,
          totalCycles: completedPeriods.length
        },
        recommendations: [
          'Continue logging your periods consistently',
          'Track at least 3 complete cycles for meaningful analysis'
        ],
        severity: 'low'
      };
    }

    // Calculate cycle lengths
    const cycleLengths: number[] = [];
    for (let i = 1; i < completedPeriods.length; i++) {
      const prevStart = completedPeriods[i - 1].startDate;
      const currentStart = completedPeriods[i].startDate;
      const cycleLength = differenceInDays(currentStart, prevStart);
      cycleLengths.push(cycleLength);
    }

    // Calculate statistics
    const averageCycleLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - averageCycleLength, 2), 0) / cycleLengths.length;
    const standardDeviation = Math.sqrt(variance);

    // Check for irregularities
    const irregularCycles = cycleLengths.filter(length => 
      Math.abs(length - averageCycleLength) > 7
    );
    const irregularityCount = irregularCycles.length;

    // Check period durations
    const periodDurations = completedPeriods.map(p => 
      differenceInDays(p.endDate!, p.startDate) + 1
    );
    const longPeriods = periodDurations.filter(duration => duration > 7);

    // Determine health status
    let status: HealthAnalysis['status'] = 'healthy';
    let message = '';
    let recommendations: string[] = [];
    let severity: HealthAnalysis['severity'] = 'low';

    // Check for concerning patterns
    const isAverageCycleOutOfRange = averageCycleLength < 21 || averageCycleLength > 35;
    const hasHighVariation = standardDeviation > 7;
    const hasFrequentIrregularities = irregularityCount >= Math.ceil(cycleLengths.length * 0.5);
    const hasLongPeriods = longPeriods.length > 0;

    if (isAverageCycleOutOfRange || hasHighVariation || hasFrequentIrregularities || hasLongPeriods) {
      if (isAverageCycleOutOfRange && (averageCycleLength < 21 || averageCycleLength > 45)) {
        status = 'concerning';
        severity = 'high';
        message = 'Your cycle length is significantly outside the normal range. We strongly recommend consulting a gynecologist.';
        recommendations.push('Schedule an appointment with a gynecologist as soon as possible');
        recommendations.push('Track any additional symptoms or changes');
      } else if (hasHighVariation && standardDeviation > 10) {
        status = 'concerning';
        severity = 'medium';
        message = 'Your cycles show high variability, which may indicate hormonal imbalances.';
        recommendations.push('Consider consulting a healthcare provider');
        recommendations.push('Track stress levels, diet, and exercise patterns');
      } else {
        status = 'irregular';
        severity = 'medium';
        message = 'Your cycles show some irregularity. This is common but worth monitoring.';
        recommendations.push('Continue tracking your cycles consistently');
        recommendations.push('Consider lifestyle factors that might affect your cycle');
      }

      if (hasLongPeriods) {
        recommendations.push('Periods lasting more than 7 days should be discussed with a healthcare provider');
      }

      if (isAverageCycleOutOfRange) {
        if (averageCycleLength < 21) {
          recommendations.push('Short cycles may indicate hormonal issues');
        } else {
          recommendations.push('Long cycles may indicate PCOS or other conditions');
        }
      }
    } else {
      status = 'healthy';
      message = 'Your menstrual cycles appear regular and within normal ranges.';
      recommendations.push('Continue your current health practices');
      recommendations.push('Keep tracking your cycles for ongoing health awareness');
    }

    return {
      status,
      message,
      details: {
        averageCycleLength: Math.round(averageCycleLength * 10) / 10,
        standardDeviation: Math.round(standardDeviation * 10) / 10,
        cycleLengths,
        irregularityCount,
        totalCycles: cycleLengths.length
      },
      recommendations,
      severity
    };
  }

  predictNextPeriod(): PredictionResult | null {
    const data = this.getCycleData();
    const completedPeriods = data.periods
      .filter(p => p.endDate)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    if (completedPeriods.length === 0) return null;

    const lastPeriod = completedPeriods[0];
    const warnings: string[] = [];

    // Use last 3-6 cycles for prediction (prefer more recent data)
    const cyclesToUse = Math.min(Math.max(completedPeriods.length - 1, 1), 6);
    const recentPeriods = completedPeriods.slice(0, cyclesToUse + 1);

    // Calculate cycle lengths from recent periods
    const cycleLengths: number[] = [];
    for (let i = 1; i < recentPeriods.length; i++) {
      const currentPeriod = recentPeriods[i];
      const previousPeriod = recentPeriods[i - 1];
      const cycleLength = differenceInDays(previousPeriod.startDate, currentPeriod.startDate);
      cycleLengths.push(cycleLength);
    }
    
    // Calculate average cycle length
    const averageCycleLength = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length)
      : 28; // Default if no data

    // Calculate period duration from recent periods
    const periodDurations = recentPeriods.map(p => 
      differenceInDays(p.endDate!, p.startDate) + 1
    );
    const averagePeriodLength = Math.round(
      periodDurations.reduce((sum, duration) => sum + duration, 0) / periodDurations.length
    );

    // Calculate variation (standard deviation)
    const variation = cycleLengths.length > 1 
      ? Math.sqrt(cycleLengths.reduce((sum, length) => 
          sum + Math.pow(length - averageCycleLength, 2), 0) / cycleLengths.length)
      : 0;

    // Determine confidence level
    let confidence: 'low' | 'moderate' | 'high' = 'low';
    if (cycleLengths.length >= 3 && variation <= 3) {
      confidence = 'high';
    } else if (cycleLengths.length >= 2 && variation <= 5) {
      confidence = 'moderate';
    }

    // Check for irregularity
    const isIrregular = variation > 7 || cycleLengths.some(length => 
      Math.abs(length - averageCycleLength) > 7
    );

    // Add warnings based on data analysis
    if (cycleLengths.length < 3) {
      warnings.push("Predictions may be less accurate with fewer than 3 recorded cycles");
    }

    if (isIrregular) {
      warnings.push("Your cycles show significant variation. Consider consulting a healthcare provider");
    }

    // Check if cycles fall outside normal ranges
    if (averageCycleLength < 21 || averageCycleLength > 35) {
      warnings.push("Your average cycle length is outside the typical 21-35 day range");
    }

    if (averagePeriodLength < 2 || averagePeriodLength > 7) {
      warnings.push("Your average period duration is outside the typical 2-7 day range");
    }

    // Predict next period dates
    const nextStart = addDays(lastPeriod.startDate, averageCycleLength);
    const nextEnd = addDays(nextStart, averagePeriodLength - 1);
    const ovulationDate = addDays(nextStart, -14); // Approximately 14 days before next period

    // Create prediction window (±3-4 days based on confidence)
    const windowDays = confidence === 'high' ? 3 : 4;
    const earliestStart = addDays(nextStart, -windowDays);
    const latestStart = addDays(nextStart, windowDays);

    return {
      startDate: nextStart,
      endDate: nextEnd,
      ovulationDate,
      confidence,
      predictionWindow: {
        earliestStart,
        latestStart
      },
      isIrregular,
      cyclesUsed: cycleLengths.length,
      variation: Math.round(variation * 10) / 10,
      warnings
    };
  }

  predictNextPeriodLegacy(): { startDate: Date; endDate: Date; ovulationDate: Date } | null {
    const prediction = this.predictNextPeriod();
    if (!prediction) return null;
    
    return {
      startDate: prediction.startDate,
      endDate: prediction.endDate,
      ovulationDate: prediction.ovulationDate
    };
  }

  isOvulationPhase(date: Date): boolean {
    const data = this.getCycleData();
    const lastPeriod = data.periods
      .filter(p => p.endDate)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];

    if (!lastPeriod) return false;

    const daysSinceLastPeriod = differenceInDays(date, lastPeriod.startDate);
    const expectedOvulation = data.averageCycleLength - 14;
    
    // Ovulation window: 2 days before to 2 days after expected ovulation
    return daysSinceLastPeriod >= (expectedOvulation - 2) && 
           daysSinceLastPeriod <= (expectedOvulation + 2);
  }
}

export const cycleDB = new CycleDatabase();
