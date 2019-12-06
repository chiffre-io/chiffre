import { EventProcessor } from './types'
import { Event } from '~/src/emitter/events'

export const process = async <State, Output>(
  inputs: Event[],
  processor: EventProcessor<State, Output>
) => {
  const outputs: Output[] = []
  let { state: inputState } = await processor(null)
  for (const input of inputs) {
    const { state: outputState, output } = await processor(input, inputState)
    if (output) {
      outputs.push(output)
    }
    inputState = outputState
  }
  return outputs
}
