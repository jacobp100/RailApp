import React, { Component } from "react";
import { Platform, StyleSheet, Text, View, NativeModules } from "react-native";
import Input from "./src/Input";
import Result from "./src/Result";

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: "white"
  }
});

export default class App extends Component {
  state = {
    from: "London Waterloo",
    to: "Surbiton",
    results: []
  };

  switch = () =>
    this.setState(s => ({
      to: s.from,
      from: s.to
    }));

  componentDidMount() {
    NativeModules.RouteReader.getData({
      day: 1 << 6,
      date: 159,
      startStation: 2359,
      endStation: 2201,
      startTime: 17 * 60,
      endTime: 18 * 60
    }).then(results => {
      this.setState(results);
    });
  }

  render() {
    const { from, to, results } = this.state;
    return (
      <View style={styles.container}>
        <Input from={from} to={to} onSwitch={this.switch} />
        <Result from={from} to={to} departureTime="17:23" arrivalTime="17:35" />
      </View>
    );
  }
}
