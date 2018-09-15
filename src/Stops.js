import React from "react";
import { View, Text, StyleSheet } from "react-native";
import stations from "../stations.json";
import { formatTimestampTime } from "./util";

const stationStatus = {
  NOT_ARRIVED: 0,
  ARRIVED: 1,
  DEPARTED: 2
};

const lozengeBase = {
  bar: {
    flex: 1,
    width: 4
  },
  roundel: {
    marginVertical: -2,
    width: 14,
    height: 14,
    borderWidth: 4,
    borderRadius: 14,
    zIndex: 1
  }
};

const inactiveColor = "#BABABA";
const activeColor = "#286FB3";
const lozenge = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  barInactive: {
    ...lozengeBase.bar,
    backgroundColor: inactiveColor
  },
  roundelInactive: {
    ...lozengeBase.roundel,
    borderColor: inactiveColor
  },
  barActive: {
    ...lozengeBase.bar,
    backgroundColor: activeColor
  },
  roundelActive: {
    ...lozengeBase.roundel,
    borderColor: activeColor
  }
});

const Lozenge = ({ status }) => (
  <View style={lozenge.container}>
    <View
      style={
        status !== stationStatus.NOT_ARRIVED
          ? lozenge.barActive
          : lozenge.barInactive
      }
    />
    <View
      style={
        status !== stationStatus.NOT_ARRIVED
          ? lozenge.roundelActive
          : lozenge.roundelInactive
      }
    />
    <View
      style={
        status === stationStatus.DEPARTED
          ? lozenge.barActive
          : lozenge.barInactive
      }
    />
  </View>
);

const stopItem = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 12
  },
  titleContainer: {
    marginLeft: 12,
    marginVertical: 4
  },
  time: {
    fontSize: 10,
    color: inactiveColor
  }
});

const StopItem = ({ now, stop }) => {
  let status;
  if (stop.departureTimestamp <= now) {
    status = stationStatus.DEPARTED;
  } else if (stop.arrivalTimestamp <= now) {
    status = stationStatus.ARRIVED;
  } else {
    status = stationStatus.NOT_ARRIVED;
  }

  return (
    <View style={stopItem.container}>
      <Lozenge status={status} />
      <View style={stopItem.titleContainer}>
        <Text>{stations[stop.stationId].name}</Text>
        <Text style={stopItem.time}>
          {formatTimestampTime(stop.arrivalTimestamp)}
        </Text>
      </View>
    </View>
  );
};

export default ({ now, stops }) =>
  stops != null ? (
    <React.Fragment>
      {stops.map((stop, index) => (
        <StopItem key={index} stop={stop} now={now} />
      ))}
    </React.Fragment>
  ) : null;
