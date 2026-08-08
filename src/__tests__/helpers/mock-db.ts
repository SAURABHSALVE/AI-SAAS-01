/**
 * Drizzle query builders are "thenable" chains (`db.select().from().where()` is
 * awaited directly, no terminal `.exec()`). This builds a chain stand-in where
 * every method returns itself and the chain resolves to `result` no matter how
 * many links were called — so tests can mock `db.select`/`insert`/etc. without
 * replicating each procedure's exact chain shape.
 */
export function createChain<T>(result: T) {
  const chain: Record<string, unknown> = {};

  const chainMethods = [
    "from",
    "innerJoin",
    "leftJoin",
    "where",
    "orderBy",
    "groupBy",
    "limit",
    "values",
    "returning",
    "set",
    "onConflictDoUpdate",
  ];

  for (const method of chainMethods) {
    chain[method] = jest.fn(() => chain);
  }

  chain.then = (onResolve: (value: T) => unknown, onReject?: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(onResolve, onReject);
  chain.catch = (onReject: (reason: unknown) => unknown) => Promise.resolve(result).catch(onReject);

  return chain;
}

export interface MockDb {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
}
