import type { ChallengeDay, ChallengePlan } from '../types/trade';

export function generateChallengeDays(
  startBalance: number = 20,
  riskPercent: number = 10,
  targetPercent: number = 20,
  totalDays: number = 30
): ChallengeDay[] {
  const days: ChallengeDay[] = [];
  let currentBalance = startBalance;

  for (let i = 1; i <= totalDays; i++) {
    const riskAmount = Number((currentBalance * (riskPercent / 100)).toFixed(2));
    const targetProfit = Number((currentBalance * (targetPercent / 100)).toFixed(2));
    const afterWinBalance = Number((currentBalance + targetProfit).toFixed(2));

    days.push({
      day: i,
      startBalance: Number(currentBalance.toFixed(2)),
      riskAmount,
      targetProfit,
      afterWinBalance,
      achieved: false,
    });

    // Compound to next day
    currentBalance = afterWinBalance;
  }

  return days;
}

export function createDefaultChallengePlan(): ChallengePlan {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: 'default-30-day-challenge',
    name: '$20 TO $2,000 (30-DAY PLAN)',
    startBalance: 20,
    riskPercent: 10,
    targetPercent: 20,
    targetDays: 30,
    startDate: today,
    isActive: true,
    days: generateChallengeDays(20, 10, 20, 30),
  };
}

export function calculateChallengeStats(plan: ChallengePlan) {
  const completedDays = plan.days.filter((d) => d.achieved);
  const totalDays = plan.days.length;
  const progressPercent = Math.round((completedDays.length / totalDays) * 100);
  
  const currentAchievedBalance = completedDays.length > 0 
    ? completedDays[completedDays.length - 1].afterWinBalance 
    : plan.startBalance;
    
  const targetFinalBalance = plan.days.length > 0 
    ? plan.days[plan.days.length - 1].afterWinBalance 
    : 0;

  const totalTargetProfit = targetFinalBalance - plan.startBalance;
  const currentTotalProfit = currentAchievedBalance - plan.startBalance;

  return {
    completedCount: completedDays.length,
    totalDays,
    progressPercent,
    currentBalance: currentAchievedBalance,
    targetFinalBalance,
    currentTotalProfit,
    totalTargetProfit,
    nextDay: plan.days.find((d) => !d.achieved) || null,
  };
}
