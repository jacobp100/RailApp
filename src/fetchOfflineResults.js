import { NativeModules } from "react-native";
import { serviceStatus, departureStatus } from "./resultUtil";

// (Hopefully) handles BST (assumg BST locale)
const dateMinutesToTimestamp = (daysPast1Jan2018, minutes) =>
  new Date(2018, 0, daysPast1Jan2018 + 1, 0, minutes).getTime();

const origin = Date.UTC(2018, 0, 1);
const dayInMs = 24 * 60 * 60 * 1000;

const mod = (n, m) => ((n % m) + m) % m;

const sequentialTime = input => {
  let currentDate = input.date;
  let currentTime = dateMinutesToTimestamp(currentDate, input.startTime);

  const processNextTime = time => {
    let outputTime = dateMinutesToTimestamp(currentDate, time);
    if (outputTime < currentTime) {
      currentDate += 1;
      outputTime = dateMinutesToTimestamp(currentDate, time);
    }
    currentTime = outputTime;
    return outputTime;
  };

  return processNextTime;
};

const formatStops = ({ date, startTime }, stops) => {
  const processNextTime = sequentialTime({ date, startTime });

  return stops.map(({ stationId, arrivalTime, departureTime, platform }) => {
    let arrivalTimestamp;
    let departureTimestamp;
    if (arrivalTime === 0 && departureTime !== 0) {
      // Dunno why this happens for unadvertised CLJ stops
      departureTimestamp = processNextTime(departureTime);
      arrivalTimestamp = departureTimestamp;
    } else {
      arrivalTimestamp = processNextTime(arrivalTime);
      departureTimestamp = processNextTime(departureTime);
    }

    return {
      stationId,
      arrivalTimestamp,
      departureTimestamp,
      platform,
      departureStatus: departureStatus.UNKNOWN
    };
  });
};

const resultFor = async (
  startStation,
  endStation,
  { date, startTime, endTime }
) => {
  const dateObj = new Date(2018, 0, date + 1);
  const day = (dateObj.getDay() + 6) % 7;
  const unformattedResults = await NativeModules.RouteReader.getData({
    day,
    date,
    startStation,
    endStation,
    startTime,
    endTime
  });

  const formatResult = ({
    routeOrigin,
    routeDestination,
    departureTime,
    arrivalTime,
    departurePlatform,
    arrivalPlatform,
    stops
  }) => ({
    serviceId: null,
    routeOrigin,
    routeDestination,
    departureTimestamp: dateMinutesToTimestamp(date, departureTime),
    arrivalTimestamp: dateMinutesToTimestamp(
      arrivalTime >= departureTime ? date : date + 1,
      arrivalTime
    ),
    departurePlatform: { name: departurePlatform, confirmed: false },
    arrivalPlatform: { name: arrivalPlatform, confirmed: false },
    stops: formatStops({ date, startTime }, stops),
    departureStatus: departureStatus.UNKNOWN,
    serviceStatus: { type: serviceStatus.OFFLINE }
  });

  const results = unformattedResults.map(formatResult);

  return { timestamp: dateObj.getTime(), data: results };
};

export default async ({ from, to, timestamp }) => {
  if (from == null || to == null || timestamp == null) return [];

  const MINUTES_BEFORE = 30;
  const MINUTES_AFTER = 90;
  const DAY = 24 * 60;
  const dateObj = new Date(timestamp);
  const localizedTimestamp = Date.UTC(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate()
  );
  const date = Math.floor((localizedTimestamp - origin) / dayInMs);
  const minutes = dateObj.getHours() * 60 + dateObj.getMinutes();

  const dateFrom = date + Math.floor((minutes - MINUTES_BEFORE) / DAY);
  const dateTo = date + Math.ceil((minutes + MINUTES_AFTER) / DAY) - 1;

  const timeFrom = mod(minutes - MINUTES_BEFORE, DAY);
  const timeTo = mod(minutes + MINUTES_AFTER, DAY);

  const promiseData = Array.from({ length: dateTo - dateFrom + 1 })
    .map((_, i) => dateFrom + i)
    .map(date => ({
      date,
      startTime: date === dateFrom ? timeFrom : 0,
      endTime: date === dateTo ? timeTo : DAY
    }));

  const promises = promiseData.map(p => resultFor(from, to, p));
  const results = await Promise.all(promises);
  return results;
};
