import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  formatTimeString,
  formatDurationString,
  timestampToMinutes
} from "./util";

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

export default ({
  to,
  from,
  departureTime,
  arrivalTime,
  departurePlatform,
  arrivalPlatform,
  departed
}) => (
  <View
    style={StyleSheet.compose(
      styles.container,
      departed && styles.departed
    )}
  >
    <View style={styles.rowContainer}>
      <Text style={styles.time}>{formatTimeString(departureTime)}</Text>
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
          {formatDurationString(departureTime, arrivalTime)}
        </Text>
        <Text style={styles.journeyTimeUnit}>MIN</Text>
      </View>
    </View>
    <View style={styles.rowContainer}>
      <Text style={styles.time}>{formatTimeString(arrivalTime)}</Text>
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
