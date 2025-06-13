
import { differenceInDays, addDays, format } from "date-fns";

export interface PeriodEntry {
  id: string;
  startDate: Date;
  endDate?: Date;
  symptoms?: string[];
  flow?: 'light' | 'normal' | 'heavy';
}

export interface CycleData {
  periods: PeriodEntry[];
  averageCycleLength: number;
  averagePeriodLength: number;
}

class CycleDatabase {
  private storageKey = 'cyclesense-data';

  getCycleData(): CycleData {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return {
        ...parsed,
        periods: parsed.periods.map((p: any) => ({
          ...p,
          startDate: new Date(p.startDate),
          endDate: p.endDate ? new Date(p.endDate) : undefined,
        }))
      };
    }
    return { periods: [], averageCycleLength: 28, averagePeriodLength: 5 };
  }

  saveCycleData(data: CycleData): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  addPeriod(period: PeriodEntry): void {
    const data = this.getCycleData();
    data.periods.push(period);
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

  predictNextPeriod(): { startDate: Date; endDate: Date; ovulationDate: Date } | null {
    const data = this.getCycleData();
    const lastPeriod = data.periods
      .filter(p => p.endDate)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];

    if (!lastPeriod) return null;

    const nextStart = addDays(lastPeriod.startDate, data.averageCycleLength);
    const nextEnd = addDays(nextStart, data.averagePeriodLength - 1);
    const ovulationDate = addDays(nextStart, -14); // Approx 14 days before next period

    return {
      startDate: nextStart,
      endDate: nextEnd,
      ovulationDate
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
