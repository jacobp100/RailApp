import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Result from "./src/Result";

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    paddingTop: 50
  }
});

export default class App extends Component {
  render() {
    return (
      <View style={styles.flexContainer}>
        <Result
          from="London Waterloo"
          to="Surbiton"
          departureTime="17:23"
          arrivalTime="17:39"
        />
        <Result
          from="Maida Vale"
          to="Bakerloo"
          departureTime="18:49"
          arrivalTime="19:11"
        />
      </View>
    );
  }
}
