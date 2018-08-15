export default (cb, interval) => {
  let timeoutHandle = null;

  let start = Date.now();
  let startInterval = interval - (start % interval);
  let nextTime = start + startInterval;

  const update = () => {
    nextTime += interval;
    const nextInterval = nextTime - Date.now();
    timeoutHandle = setTimeout(update, nextInterval);
    cb();
  };

  timeoutHandle = setTimeout(update, startInterval);

  return () => {
    clearTimeout(timeoutHandle);
  };
};
