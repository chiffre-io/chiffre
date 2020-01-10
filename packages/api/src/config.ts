export const expirationTimes = {
  inSevenDays: (now = new Date()): Date =>
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  inFiveMinutes: (now = new Date()): Date =>
    new Date(now.getTime() + 5 * 60 * 1000)
}
