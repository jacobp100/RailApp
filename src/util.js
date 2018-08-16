export const dateToTimestamp = daysPast1Jan2018 =>
  Date.UTC(2018, 0, daysPast1Jan2018 + 1);

const dayInMs = 24 * 60 * 60 * 1000;
const origin = Date.UTC(2018, 0, 1);
export const timestampToDate = timestamp =>
  Math.floor((timestamp - origin) / dayInMs);

export const timestampToMinutes = timestamp => {
  const dateObj = new Date(timestamp);
  return dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes();
};

export const formatTimeString = minutes => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minutes = String(minutes % 60).padStart(2, "0");
  return hours + ":" + minutes;
};

export const formatDurationString = (departureTime, arrivalTime) => {
  let journeyTime = arrivalTime - departureTime;
  while (journeyTime < 0) {
    journeyTime += 60 * 24;
  }
  return journeyTime;
};

export const monthNames = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC"
];
