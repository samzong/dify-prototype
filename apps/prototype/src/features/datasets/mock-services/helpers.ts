export function delay(ms: number) {
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, ms)
  })
}

export async function pollStages<T extends string>(
  stages: readonly T[],
  onTick: (stage: T, index: number) => void | Promise<void>,
  intervalMs = 400,
): Promise<T> {
  if (stages.length === 0)
    throw new Error('pollStages requires at least one stage')

  for (let index = 0; index < stages.length; index++) {
    await delay(intervalMs)
    await onTick(stages[index], index)
  }

  return stages[stages.length - 1]
}

export async function emitStream<T>(
  events: T[],
  onEvent: (event: T) => void | Promise<void>,
  intervalMs = 120,
) {
  for (const event of events) {
    await delay(intervalMs)
    await onEvent(event)
  }
}

export function cloneJson<T>(value: T): T {
  return structuredClone(value)
}
