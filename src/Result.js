import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    height: 80,
    justifyContent: "space-between"
  },
  rowContainer: {
    flexDirection: "row"
  },
  time: {
    marginRight: 9,
    fontWeight: "500",
    fontVariant: ["tabular-nums"]
  },
  platform: {
    color: "#BABABA",
    fontSize: 9
  },
  journeyTimeValue: {
    fontWeight: "700"
  },
  journeyTimeUnit: {
    marginLeft: 3,
    fontWeight: "900",
    fontSize: 9,
    letterSpacing: 0.3
  },
  locationPlatformContainer: {
    flex: 1
  },
  journetTimeContainer: {
    flexDirection: "row",
    alignItems: "baseline"
  }
});

const formatTime = minuesPastMidnight => {
  const hours = String(Math.floor(minuesPastMidnight / 60)).padStart(2, "0");
  const minutes = String(minuesPastMidnight % 60).padStart(2, "0");
  return hours + ":" + minutes;
};

const formatDuration = (departureTime, arrivalTime) => {
  let journeyTime = arrivalTime - departureTime;
  if (journeyTime < 0) {
    journeyTime = formatDuration(departureTime, arrivalTime + 60 * 24);
  }
  return journeyTime;
};

export default ({
  to,
  from,
  departureTime,
  arrivalTime,
  departurePlatform,
  arrivalPlatform
}) => (
  <View style={styles.container}>
    <View style={styles.rowContainer}>
      <Text style={styles.time}>{formatTime(departureTime)}</Text>
      <View style={styles.locationPlatformContainer}>
        <Text>{from}</Text>
        <Text style={styles.platform}>
          {departurePlatform
            ? `Platform ${departurePlatform} (to be confirmed)`
            : "No platform information"}
        </Text>
      </View>
      <View style={styles.journetTimeContainer}>
        <Text style={styles.journeyTimeValue}>
          {formatDuration(departureTime, arrivalTime)}
        </Text>
        <Text style={styles.journeyTimeUnit}>MIN</Text>
      </View>
    </View>
    <View style={styles.rowContainer}>
      <Text style={styles.time}>{formatTime(arrivalTime)}</Text>
      <View style={styles.locationPlatformContainer}>
        <Text>{to}</Text>
        <Text style={styles.platform}>
          {arrivalPlatform
            ? `Platform ${arrivalPlatform} (to be confirmed)`
            : "No platform information"}
        </Text>
      </View>
    </View>
  </View>
);
