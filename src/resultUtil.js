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

export const isDeparted = (timestamp, result) => {
  switch (result.departureStatus) {
    case departureStatus.UNKNOWN:
      return result.departureTimestamp <= timestamp;
    case departureStatus.NOT_DEPARTED:
      return false;
    case departureStatus.DEPARTED:
      return true;
  }
};

const isOffline = result => result.serviceStatus.type === serviceStatus.OFFLINE;

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
        return results.slice(0, -1).concat({ ...offlineResult, ...liveResult });
      }
    }

    return results.concat(result);
  }, []);

export const mergeResults = (atocSections, liveData) => {
  if (atocSections == null) {
    return [];
  } else if (liveData == null) {
    return atocSections;
  }

  return atocSections.map(section => {
    const sectionStartTimestamp = section.timestamp;
    const sectionEndTimestamp = sectionStartTimestamp + 24 * 60 * 60 * 1000;
    const liveDataForDay = liveData.filter(
      result =>
        result.departureTimestamp >= sectionStartTimestamp &&
        result.departureTimestamp <= sectionEndTimestamp
    );
    return { ...section, data: mergeData(section.data, liveDataForDay) };
  });
};
