import { NativeModules } from "react-native";
import { sortBy } from "lodash/fp";
import { departureStatus } from "./resultUtil";

// (Hopefully) handles BST (assumg BST locale)
export const dateMinutesToTimestamp = (daysPast1Jan2018, minutes) =>
  new Date(2018, 0, daysPast1Jan2018 + 1, 0, minutes).getTime();

const origin = Date.UTC(2018, 0, 1);
export const timestampToDate = timestamp =>
  Math.floor((timestamp - origin) / dayInMs);

export const timestampToMinutes = timestamp => {
  const dateObj = new Date(timestamp);
  return dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes();
};

const mod = (n, m) => ((n % m) + m) % m;

const resultFor = async (
  startStation,
  endStation,
  { date, startTime, endTime }
) => {
  const dateObj = new Date(2018, 0, date + 1);
  const day = (getDate(dateObj).getDay() + 1) % 7;
  const unsortedResults = await NativeModules.RouteReader.getData({
    day,
    date,
    startStation,
    endStation,
    startTime,
    endTime
  });

  const formatResult = ({
    departureTime,
    arrivalTime,
    departurePlatform,
    arrivalPlatform
  }) => ({
    departureTimestamp: dateMinutesToTimestamp(date, departureTime),
    arrivalTimestamp: dateMinutesToTimestamp(
      arrivalTime > departureTime ? date : date + 1,
      minutes
    ),
    departed: departureStatus.UNKNOWN,
    departurePlatform,
    arrivalPlatform
  });

  results = sortBy(
    ["departureTimestamp", "arrivalTimestamp"],
    unsortedResults.map(formatResult)
  );

  return { timestamp: dateObj.getTime(), data: results };
};

export const resultsFor = async (from, to, timestamp) => {
  if (from == null || to == null || timestamp == null) return [];

  const MINUTES_BEFORE = 30;
  const MINUTES_AFTER = 90;
  const DAY = 24 * 60;
  const date = timestampToDate(timestamp);
  const minutes = timestampToMinutes(timestamp);

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
