const DAY = 24 * 60 * 60 * 1000;

const sequentialTime = (startTimestamp, reversed = false) => {
  let currentTimestamp = startTimestamp;
  let delta = 0;

  const processNextTime = ({timestamp}) => {
    let outputTimestamp = timestamp + delta;
    if (!reversed && outputTimestamp < currentTimestamp) {
      delta += DAY;
      outputTimestamp += DAY;
    } else if (reversed && outputTimestamp > currentTimestamp) {
      delta -= DAY;
      outputTimestamp -= DAY;
    }
    currentTimestamp = outputTimestamp;
    return outputTimestamp;
  };

  return processNextTime;
};

const fixTimestamps = (input, stops) => {
  const {timestamp, stationId} = input;
  const startIndex = stops.findIndex(s => s.stationId === stationId);

  if (startIndex === -1) return null;

  const preTimestamps = stops.slice(0, startIndex);
  const postTimestamps = stops.slice(startIndex + 1);

  return [].concat(
    preTimestamps
      .reverse()
      .map(sequentialTime(timestamp, true))
      .reverse(),
    timestamp,
    postTimestamps.map(sequentialTime(timestamp, false)),
  );
};

export default fixTimestamps;
