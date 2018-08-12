import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

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
  }
});

export default () => (
  <View style={styles.container}>
    <Text style={styles.timePlaceholder}>00:00</Text>
    <View style={styles.line} />
  </View>
);
