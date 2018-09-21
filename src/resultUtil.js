import { sortBy } from "lodash/fp";

export const departureStatus = {
  UNKNOWN: 0,
  NOT_DEPARTED: 1,
  DEPARTED: 2
};

export const serviceStatus = {
  OFFLINE: 0,
  ON_TIME: 1,
  DELAYED_BY: 2,
  DELAYED: 3,
  CANCELLED: 4
};

export const isScheduledDeparted = (timestamp, result) =>
  result.departureTimestamp <= timestamp;

export const isDeparted = (timestamp, result) => {
  switch (result.departureStatus) {
    case departureStatus.UNKNOWN:
      return isScheduledDeparted(timestamp, result);
    case departureStatus.NOT_DEPARTED:
      return false;
    case departureStatus.DEPARTED:
      return true;
    default:
      throw new Error("Unknown departure status");
  }
};

const isOffline = result => result.serviceStatus.type === serviceStatus.OFFLINE;

const mergeOfflineLiveStops = (offlineStops, liveStops) => {
  if (liveStops == null) return offlineStops;
  if (offlineStops == null) return liveStops;

  return offlineStops.map(offlineStop => {
    const liveStop = liveStops.find(s => s.stationId === offlineStop.stationId);
    return liveStop != null ? liveStop : offlineStop;
  });
};

const mergeOfflineLiveResult = (offline, live) => {
  const out = {};
  for (const key in live) {
    if (key === "stops") {
      out.stops = mergeOfflineLiveStops(offline.stops, live.stops);
    } else {
      const liveValue = live[key];
      out[key] = liveValue == null ? offline[key] : liveValue;
    }
  }
  return out;
};

const mergeData = (atocData, liveData) =>
  sortBy(
    ["departureTimestamp", "arrivalTimestamp"],
    [].concat(atocData, liveData)
  ).reduce((results, result) => {
    const lastResult =
      results.length !== -1 ? results[results.length - 1] : null;
    const canMerge =
      lastResult != null && isOffline(lastResult) !== isOffline(result);

    if (canMerge) {
      const offlineResult = isOffline(result) ? result : lastResult;
      const liveResult = isOffline(result) ? lastResult : result;
      const timeDelta =
        offlineResult.departureTimestamp - liveResult.departureTimestamp;
      const shouldMerge =
        offlineResult.routeOrigin === liveResult.routeOrigin &&
        offlineResult.routeDestination === liveResult.routeDestination &&
        timeDelta >= 0 &&
        timeDelta <= 60000;

      if (shouldMerge) {
        return results
          .slice(0, -1)
          .concat(mergeOfflineLiveResult(offlineResult, liveResult));
      }
    }

    return results.concat(result);
  }, []);

const DAY = 24 * 60 * 60 * 1000;
export const mergeResults = (atocSections, liveData) =>
  atocSections.map(section => {
    const sectionStartTimestamp = section.timestamp;
    const sectionEndTimestamp = sectionStartTimestamp + DAY;
    const resultWithinSection = result =>
      result.departureTimestamp >= sectionStartTimestamp &&
      result.departureTimestamp < sectionEndTimestamp;
    const liveDataForDay =
      liveData != null ? liveData.filter(resultWithinSection) : [];
    return { ...section, data: mergeData(section.data, liveDataForDay) };
  });
