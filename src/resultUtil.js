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

export const mergeResults = (atocSections, live) => {
  if (live == null) {
    return atocSections;
  } else if (atocSections == null) {
    return live;
  }

  return atocSections.map(section => ({
    ...section,
    data: section.data.map(input => ({
      ...input,
      ...live.find(other => {
        const timeDelta = input.departureTimestamp - other.departureTimestamp;
        return timeDelta >= 0 && timeDelta <= 60000;
        return (
          input.routeOrigin === other.routeOrigin &&
          input.routeDestination === other.routeDestination &&
          timeDelta >= 0 &&
          timeDelta <= 60000
        );
      })
    }))
  }));
};
