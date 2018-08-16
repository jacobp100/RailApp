export const departureStatus = {
  UNKNOWN: 0,
  NOT_DEPARTED: 1,
  DEPARTED: 2
};

export const isDeparted = (timestamp, result) => {
  switch (result.departureStatus) {
    case departureStatus.UNKNOWN:
      return result.departure <= timestamp;
    case departureStatus.NOT_DEPARTED:
      return false;
    case departureStatus.DEPARTED:
      return true;
  }
};
