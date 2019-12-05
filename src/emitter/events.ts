export interface Event<T, D = any> {
  type: T
  data?: D
}

export function createEvent<T, D>(type: T, data?: D): Event<T, D> {
  return {
    type,
    data
  }
}
