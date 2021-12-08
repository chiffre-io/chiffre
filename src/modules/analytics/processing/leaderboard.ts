export interface LeaderboardEntry<K = string> {
  key: K
  score: number
  percent: number
}

// --

export class CounterMap<K = string> {
  private _map: Map<K, number>

  constructor() {
    this._map = new Map()
  }

  public count(key: K) {
    this._map.set(key, (this._map.get(key) || 0) + 1)
  }

  public get leaderboard(): LeaderboardEntry<K>[] {
    const sum = Array.from(this._map.values()).reduce((s, c) => s + c, 0)
    return Array.from(this._map.entries())
      .map(([key, count]) => ({
        key,
        score: count,
        percent: (100 * count) / sum
      }))
      .sort((a, b) => b.score - a.score)
  }
}

export function groupLeaderboard<K, GroupKeys extends string>(
  leaderboard: LeaderboardEntry<K>[],
  findGroupKey: (key: K) => GroupKeys
) {
  type Groups = Map<GroupKeys, LeaderboardEntry<K>[]>
  const groups: Groups = new Map()
  leaderboard.forEach(entry => {
    const groupKey = findGroupKey(entry.key)
    const existing = groups.get(groupKey) ?? []
    groups.set(groupKey, [...existing, entry])
  })
  return groups
}
