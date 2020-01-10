import { Event } from '~/src/emitter/events'

export type ProcessorOutput<State, Output> = {
  state: State
  output?: Output
}

export type Processor<Input, State, Output> = (
  input: Input | null,
  state?: State
) => Promise<ProcessorOutput<State, Output>>

export type EventProcessor<State, Output> = Processor<Event, State, Output>
