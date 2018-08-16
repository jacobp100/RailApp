import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { timestampToDate, timestampToMinutes } from "./util";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: StyleSheet.hairlineWidth,
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
  activeLine: {
    backgroundColor: "#286FB3"
  }
});

export default ({ now, section, leadingItem, trailingItem }) => {
  let active = false;
  if (section.date === timestampToDate(now)) {
    const minutes = timestampToMinutes(now);
    active =
      leadingItem.departureTime < minutes &&
      trailingItem.departureTime >= minutes;
  }

  return active ? (
    <View style={styles.activeLine} />
  ) : (
    <View style={styles.container}>
      <Text style={styles.timePlaceholder}>00:00</Text>
      <View style={styles.line} />
    </View>
  );
};
