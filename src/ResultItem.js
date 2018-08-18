import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatTimestampTime, formatDurationString } from "./util";

export const itemHeight = 80;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    height: itemHeight,
    justifyContent: "space-between"
  },
  containerInactive: {
    backgroundColor: "#E5E5E5", // Adjusted for opacity
    opacity: 0.5
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

const separator = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "stretch"
  },
  timePlaceholder: {
    paddingLeft: 12,
    paddingRight: 9,
    fontVariant: ["tabular-nums"],
    opacity: 0
  },
  line: {
    flex: 1,
    backgroundColor: "#F2F2F2"
  },
  currentTime: {
    backgroundColor: "#286FB3"
  }
});

export const separatorTypes = {
  NONE: 0,
  DEFAULT: 1,
  CURRENT_TIME: 2
};

export default ({
  to,
  from,
  departureTimestamp,
  arrivalTimestamp,
  departurePlatform,
  arrivalPlatform,
  departed,
  separatorType
}) => (
  <View
    style={StyleSheet.compose(
      styles.container,
      departed && styles.containerInactive
    )}
  >
    {separatorType === separatorTypes.CURRENT_TIME ? (
      <View style={[separator.container, separator.currentTime]} />
    ) : separatorType === separatorTypes.DEFAULT ? (
      <View style={separator.container}>
        <Text style={separator.timePlaceholder}>00:00</Text>
        <View style={separator.line} />
      </View>
    ) : null}
    <View style={styles.rowContainer}>
      <Text style={styles.time}>{formatTimestampTime(departureTimestamp)}</Text>
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
          {formatDurationString(departureTimestamp, arrivalTimestamp)}
        </Text>
        <Text style={styles.journeyTimeUnit}>MIN</Text>
      </View>
    </View>
    <View style={styles.rowContainer}>
      <Text style={styles.time}>{formatTimestampTime(arrivalTimestamp)}</Text>
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
