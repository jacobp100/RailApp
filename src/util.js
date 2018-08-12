export const getDate = daysPast1Jan2018 =>
  new Date(2018, 0, daysPast1Jan2018 + 1);

const dayInMs = 24 * 60 * 60 * 1000;
export const formatDate = date =>
  Math.floor((date.getTime() - new Date(2018, 0, 1).getTime()) / dayInMs);

export const formatTime = date => date.getHours() * 60 + date.getMinutes();

export const formatTimeString = minuesPastMidnight => {
  const hours = String(Math.floor(minuesPastMidnight / 60)).padStart(2, "0");
  const minutes = String(minuesPastMidnight % 60).padStart(2, "0");
  return hours + ":" + minutes;
};

export const formatDurationString = (departureTime, arrivalTime) => {
  let journeyTime = arrivalTime - departureTime;
  while (journeyTime < 0) {
    journeyTime += 60 * 24;
  }
  return journeyTime;
};
