// export const formatTimeString = minutes => {
//   const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
//   const minutes = String(minutes % 60).padStart(2, "0");
//   return hours + ":" + minutes;
// };

export const formatTimestampTime = timestamp => {
  const dateObj = new Date(timestamp);
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const formatDurationString = (departureTime, arrivalTime) =>
  String(Math.ceil((arrivalTime - departureTime) / (60 * 1000)));

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
