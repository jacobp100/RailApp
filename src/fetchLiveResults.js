import parser from "fast-xml-parser";
import stations from "../stations.json";
import { serviceStatus } from "./resultUtil";

const idToCrc = {};
const crcToId = {};
stations.forEach(({ id, crc }) => {
  idToCrc[id] = crc;
  crcToId[crc] = id;
});

const token = "d8e6b11e-b942-4941-b42e-f4b16d2c9239";

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

const safeString = s => (s != null ? String(s) : null);

const parseService = ({
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
}) => {
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
      departurePlatform,
      serviceStatus: { type: serviceStatus.ON_TIME }
    };
  } else if (etd === "Delayed") {
    return {
      serviceId,
      routeOrigin,
      routeDestination,
      departureTimestamp,
      departurePlatform,
      serviceStatus: { type: serviceStatus.DELAYED }
    };
  } else if (etd === "Cancelled") {
    return {
      serviceId,
      routeOrigin,
      routeDestination,
      departureTimestamp,
      departurePlatform: null,
      serviceStatus: { type: serviceStatus.CANCELLED }
    };
  } else if (getTime(etd) != null) {
    return {
      serviceId,
      routeOrigin,
      routeDestination,
      departureTimestamp,
      departurePlatform,
      serviceStatus: {
        type: serviceStatus.DELAYED_BY,
        by: getTime(etd) - getTime(std)
      }
    };
  } else {
    return null;
  }
};

export default async (from, to) => {
  const query = `
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
  `.trim();

  const res = await fetch(
    "https://lite.realtime.nationalrail.co.uk/OpenLDBWS/ldb9.asmx",
    {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body: query
    }
  );
  const text = await res.text();
  const tree = parser.parse(text);

  const services =
    tree["soap:Envelope"]["soap:Body"].GetDepartureBoardResponse
      .GetStationBoardResult["lt5:trainServices"]["lt5:service"];

  return services.map(parseService);
};
