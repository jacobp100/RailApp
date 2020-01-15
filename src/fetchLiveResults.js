import parser from 'fast-xml-parser';
import {get, getOr, castArray} from 'lodash/fp';
import stations from '../stations.json';
import {departureStatus, serviceStatus} from './resultUtil';
import fixTimestamps from './fixTimestamps';

const idToCrc = {};
const crcToId = {};
stations.forEach(({id, crc}) => {
  idToCrc[id] = crc;
  crcToId[crc] = id;
});

const token = 'd8e6b11e-b942-4941-b42e-f4b16d2c9239';

const soapRequest = async query => {
  const res = await fetch(
    'https://lite.realtime.nationalrail.co.uk/OpenLDBWS/ldb9.asmx',
    {
      method: 'POST',
      headers: {'Content-Type': 'text/xml'},
      body: query.trim(),
    },
  );
  const text = await res.text();
  const tree = parser.parse(text);
  return tree;
};

const getTime = str => {
  if (str != null && str.includes(':')) {
    const [h, m] = str.split(':');
    const now = new Date();
    const dateObj = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      Number(h),
      Number(m),
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
    'lt4:serviceID': serviceId,
    'lt4:std': std,
    'lt4:etd': etd,
    'lt4:platform': platformString,
    'lt5:origin': {
      'lt4:location': {'lt4:crs': originCrs},
    },
    'lt5:destination': {
      'lt4:location': {'lt4:crs': destinationCrs},
    },
  },
) => {
  const routeOrigin = crcToId[originCrs];
  const routeDestination = crcToId[destinationCrs];
  const departureTimestamp = adjustTimeIfBefore(now - DAY / 2, getTime(std));
  const departurePlatformName = safeString(platformString);
  const departurePlatform =
    departurePlatformName != null
      ? {name: departurePlatformName, confirmed: true}
      : null;
  if (etd === 'On time') {
    return {
      serviceId,
      routeOrigin,
      routeDestination,
      departureTimestamp,
      arrivalTimestamp: NaN,
      departurePlatform,
      arrivalPlatform: null,
      stops: null,
      departureStatus:
        departureTimestamp <= now
          ? departureStatus.DEPARTED
          : departureStatus.NOT_DEPARTED,
      serviceStatus: {type: serviceStatus.ON_TIME},
    };
  } else if (etd === 'Delayed') {
    return {
      serviceId,
      routeOrigin,
      routeDestination,
      departureTimestamp,
      arrivalTimestamp: NaN,
      departurePlatform,
      arrivalPlatform: null,
      stops: null,
      departureStatus: departureStatus.NOT_DEPARTED,
      serviceStatus: {type: serviceStatus.DELAYED},
    };
  } else if (etd === 'Cancelled') {
    return {
      serviceId,
      routeOrigin,
      routeDestination,
      departureTimestamp,
      arrivalTimestamp: NaN,
      departurePlatform: null,
      arrivalPlatform: null,
      stops: null,
      departureStatus: departureStatus.DEPARTED,
      serviceStatus: {type: serviceStatus.CANCELLED},
    };
  } else if (getTime(etd) != null) {
    const actualDepartureTimestamp = adjustTimeIfBefore(
      departureTimestamp,
      getTime(etd),
    );
    return {
      serviceId,
      routeOrigin,
      routeDestination,
      departureTimestamp,
      arrivalTimestamp: NaN,
      departurePlatform,
      arrivalPlatform: null,
      stops: null,
      departureStatus:
        actualDepartureTimestamp <= now
          ? departureStatus.DEPARTED
          : departureStatus.NOT_DEPARTED,
      serviceStatus: {
        type: serviceStatus.DELAYED_BY,
        until: actualDepartureTimestamp,
      },
    };
  }
  return null;
};

export const fetchLiveResults = async ({from, to, now}) => {
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
    tree['soap:Envelope']['soap:Body'].GetDepartureBoardResponse
      .GetStationBoardResult['lt5:trainServices']['lt5:service'];

  return services.map(service => parseDepartureBoardService(now, service));
};

const basicParseStop = ({
  'lt4:crs': crs,
  'lt4:st': standardTime,
  'lt4:et': estimatedTime,
}) => {
  let timestamp;

  if (estimatedTime === 'On time') {
    timestamp = getTime(standardTime);
  } else if (getTime(estimatedTime) != null) {
    timestamp = getTime(estimatedTime);
  } else {
    timestamp = getTime(standardTime);
  }

  return {
    stationId: crcToId[crs],
    timestamp,
  };
};

const formatBasicStops = (now, basicDepartureStop, stops) => {
  const fixedTimestamps = fixTimestamps(basicDepartureStop, stops);
  return stops.map((stop, index) => {
    const timestamp = fixedTimestamps[index];
    return {
      stationId: stop.stationId,
      arrivalTimestamp: timestamp,
      departureTimestamp: timestamp,
      platform: null,
      departureStatus:
        timestamp <= now
          ? departureStatus.DEPARTED
          : departureStatus.NOT_DEPARTED,
    };
  });
};

const getStops = (path, res) => castArray(getOr([], path, res));

export const fetchLiveResult = async ({from, to, now, service}) => {
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

  const res = get(
    [
      'soap:Envelope',
      'soap:Body',
      'GetServiceDetailsResponse',
      'GetServiceDetailsResult',
    ],
    tree,
  );
  const previousStops = getStops(
    ['lt4:previousCallingPoints', 'lt4:callingPointList', 'lt4:callingPoint'],
    res,
  );
  const nextStops = getStops(
    ['lt4:subsequentCallingPoints', 'lt4:callingPointList', 'lt4:callingPoint'],
    res,
  );

  const basicDepartureStop = {
    stationId: from,
    timestamp: service.departureTimestamp,
  };
  const basicStops = [].concat(
    previousStops.map(basicParseStop),
    basicDepartureStop,
    nextStops.map(basicParseStop),
  );
  const stops = formatBasicStops(now, basicDepartureStop, basicStops);

  const arrivalService = stops.find(stop => stop.stationId === to);
  if (arrivalService == null) return service;

  return {
    ...service,
    arrivalTimestamp: arrivalService.arrivalTimestamp,
    stops,
  };
};
