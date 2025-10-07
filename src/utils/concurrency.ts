export const runWithConcurrency = async <T, R>(
  items: readonly T[],
  concurrency: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> => {
  if (concurrency < 1) {
    throw new Error(`Concurrency must be at least 1, received ${concurrency}`);
  }

  const queue = items.slice();
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  const worker = async (): Promise<void> => {
    const next = queue.shift();
    if (next === undefined) {
      return;
    }

    const result = await task(next);
    results.push(result);
    await worker();
  };

  for (let index = 0; index < Math.min(concurrency, items.length); index += 1) {
    executing.push(worker());
  }

  await Promise.all(executing);
  return results;
};
