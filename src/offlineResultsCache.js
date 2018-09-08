import fetchOfflineResults from "./fetchOfflineResults";

export default ({ refreshThreshold }) => {
  let args = { from: null, to: null, timestamp: NaN };
  let results = null;
  let queue = Promise.resolve();

  return nextArgs => {
    const cached =
      Math.abs(nextArgs.timestamp - args.timestamp) <= refreshThreshold &&
      nextArgs.to === args.to &&
      nextArgs.from === args.from;

    if (cached) {
      return results;
    }

    args = nextArgs;
    queue = queue.then(async () => {
      try {
        results = await fetchOfflineResults(args);
      } catch (e) {
        results = null;
      }
      return results;
    });
    throw queue;
  };
};
