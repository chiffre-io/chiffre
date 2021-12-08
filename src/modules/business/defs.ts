export enum Plans {
  free = 'free',
  recurring = 'recurring', // Recurring billing per month or per year
  usage = 'usage', // Pay for what you use
  perpetual = 'perpetual', // Pay once, own forever
  unlimited = 'unlimited' // Internal, no limits, for friends & family
}

export const allPlans: Plans[] = [
  Plans.free,
  Plans.recurring,
  Plans.usage,
  Plans.perpetual,
  Plans.unlimited
]
