import parser from "fast-xml-parser";
import stations from "../stations.json";
import { departureStatus, serviceStatus } from "./resultUtil";

const idToCrc = {};
const crcToId = {};
stations.forEach(({ id, crc }) => {
  idToCrc[id] = crc;
  crcToId[crc] = id;
});

const token = "d8e6b11e-b942-4941-b42e-f4b16d2c9239";

const soapRequest = async query => {
  const res = await fetch(
    "https://lite.realtime.nationalrail.co.uk/OpenLDBWS/ldb9.asmx",
    {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body: query.trim()
    }
  );
  const text = await res.text();
  const tree = parser.parse(text);
  return tree;
};

const getTime = str => {
  if (str != null && str.includes(":")) {
    const [h, m] = str.split(":");
    const now = new Date();
    const dateObj = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      Number(h),
      Number(m)
    );
    // if (dateObj.getTime() < Date.now() + 12 * 60 * 60 * 1000) {
    //   dateObj.setDate(dateObj.getDate() + 1);
    // }
    return dateObj.getTime();
  } else {
    return null;
  }
};

const DAY = 24 * 60 * 60 * 1000;
const adjustTimeIfBefore = (relativeTo, date) =>
  date < relativeTo ? date + DAY : date;

const safeString = s => (s != null ? String(s) : null);

const parseDepartureBoardService = (
  now,
  {
    "lt4:serviceID": serviceId,
    "lt4:std": std,
    "lt4:etd": etd,
    "lt4:platform": platformString,
    "lt5:origin": {
      "lt4:location": { "lt4:crs": originCrs }
    },
    "lt5:destination": {
      "lt4:location": { "lt4:crs": destinationCrs }
    }
  }
) => {
  const routeOrigin = crcToId[originCrs];
  const routeDestination = crcToId[destinationCrs];
  const departureTimestamp = getTime(std);
  const departurePlatform = safeString(platformString);
  if (etd === "On time") {
    return {
      serviceId,
      routeOrigin,
      routeDestination,
      departureTimestamp,
      arrivalTimestamp: NaN,
      departureStatus:
        departureTimestamp <= now
          ? departureStatus.DEPARTED
          : departureStatus.NOT_DEPARTED,
      departurePlatform,
      arrivalPlatform: null,
      serviceStatus: { type: serviceStatus.ON_TIME }
    };
  } else if (etd === "Delayed") {
    return {
      serviceId,
      routeOrigin,
      routeDestination,
      departureTimestamp,
      arrivalTimestamp: NaN,
      departureStatus: departureStatus.NOT_DEPARTED,
      departurePlatform,
      arrivalPlatform: null,
      serviceStatus: { type: serviceStatus.DELAYED }
    };
  } else if (etd === "Cancelled") {
    return {
      serviceId,
      routeOrigin,
      routeDestination,
      departureTimestamp,
      arrivalTimestamp: NaN,
      departureStatus: departureStatus.DEPARTED,
      departurePlatform: null,
      arrivalPlatform: null,
      serviceStatus: { type: serviceStatus.CANCELLED }
    };
  } else if (getTime(etd) != null) {
    const actualDepartureTimestamp = adjustTimeIfBefore(
      departureTimestamp,
      getTime(etd)
    );
    return {
      serviceId,
      routeOrigin,
      routeDestination,
      departureTimestamp,
      arrivalTimestamp: NaN,
      departureStatus:
        actualDepartureTimestamp <= now
          ? departureStatus.DEPARTED
          : departureStatus.NOT_DEPARTED,
      departurePlatform,
      arrivalPlatform: null,
      serviceStatus: {
        type: serviceStatus.DELAYED_BY,
        until: actualDepartureTimestamp
      }
    };
  }
  return null;
};

export const fetchLiveResults = async ({ from, to, now }) => {
  const tree = await soapRequest(`
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:typ="http://thalesgroup.com/RTTI/2013-11-28/Token/types" xmlns:ldb="http://thalesgroup.com/RTTI/2016-02-16/ldb/">
      <soap:Header>
        <typ:AccessToken>
          <typ:TokenValue>${token}</typ:TokenValue>
        </typ:AccessToken>
      </soap:Header>
      <soap:Body>
        <ldb:GetDepartureBoardRequest>
          <ldb:numRows>12</ldb:numRows>
          <ldb:crs>${idToCrc[from]}</ldb:crs>
          <ldb:filterCrs>${idToCrc[to]}</ldb:filterCrs>
          <ldb:filterType>to</ldb:filterType>
          <ldb:timeOffset>-15</ldb:timeOffset>
          <ldb:timeWindow>120</ldb:timeWindow>
        </ldb:GetDepartureBoardRequest>
      </soap:Body>
    </soap:Envelope>
  `);

  const services =
    tree["soap:Envelope"]["soap:Body"].GetDepartureBoardResponse
      .GetStationBoardResult["lt5:trainServices"]["lt5:service"];

  return services.map(service => parseDepartureBoardService(now, service));
};

const parseStatusService = (
  now,
  service,
  { "lt4:st": standardTime, "lt4:et": estimatedTime }
) => {
  if (estimatedTime === "On time") {
    const arrivalTimestamp = adjustTimeIfBefore(
      service.departureTimestamp,
      getTime(standardTime)
    );
    return { ...service, arrivalTimestamp };
  } else if (getTime(estimatedTime) != null) {
    const arrivalTimestamp = adjustTimeIfBefore(
      service.departureTimestamp,
      getTime(estimatedTime)
    );
    return { ...service, arrivalTimestamp };
  }
  return service;
};

export const fetchLiveResult = async ({ from, to, now, service }) => {
  const tree = await soapRequest(`
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:typ="http://thalesgroup.com/RTTI/2013-11-28/Token/types" xmlns:ldb="http://thalesgroup.com/RTTI/2016-02-16/ldb/">
      <soap:Header>
        <typ:AccessToken>
          <typ:TokenValue>${token}</typ:TokenValue>
        </typ:AccessToken>
      </soap:Header>
      <soap:Body>
        <ldb:GetServiceDetailsRequest>
          <ldb:serviceID>${service.serviceId}</ldb:serviceID>
        </ldb:GetServiceDetailsRequest>
      </soap:Body>
    </soap:Envelope>
  `);

  let services =
    tree["soap:Envelope"]["soap:Body"].GetServiceDetailsResponse
      .GetServiceDetailsResult["lt4:subsequentCallingPoints"][
      "lt4:callingPointList"
    ]["lt4:callingPoint"];
  services = Array.isArray(services) ? services : [services];
  const crc = idToCrc[to];
  const arrivalService = services.find(r => r["lt4:crs"] === crc);
  return arrivalService != null
    ? parseStatusService(now, service, arrivalService)
    : service;
};
