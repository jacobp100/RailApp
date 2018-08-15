import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getDate, monthNames } from "./util";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  title: {
    fontSize: 10,
    fontWeight: "600",
    color: "#BABABA"
  }
});

export default ({ section }) => {
  const dateTime = getDate(section.date);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {dateTime.getDate()} {monthNames[dateTime.getMonth()]}{" "}
        {dateTime.getFullYear()}
      </Text>
    </View>
  );
};
