import React, { Component } from "react";
import { Platform, StyleSheet, Text, View, NativeModules } from "react-native";
import Input from "./src/Input";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  }
});

export default class App extends Component {
  state = {
    from: "London Waterloo",
    to: "Surbiton"
  };

  switch = () =>
    this.setState(s => ({
      to: s.from,
      from: s.to
    }));

  componentDidMount() {
    // NativeModules.RouteReader.getData({
    //   day: 1 << 6,
    //   date: 159,
    //   startStation: 2359,
    //   endStation: 2201,
    //   startTime: 17 * 60,
    //   endTime: 18 * 60
    // }).then(v => {
    //   console.warn(v);
    // });
  }

  render() {
    const { from, to } = this.state;
    return (
      <View style={styles.container}>
        <Input from={from} to={to} onSwitch={this.switch} />
      </View>
    );
  }
}
