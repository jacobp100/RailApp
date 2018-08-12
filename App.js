import React, { Component } from "react";
import { Text, View, Button, StyleSheet, NativeModules } from "react-native";
import Input from "./src/Input";
import Result from "./src/Result";
import DatePickerModal from "./src/DatePickerModal";

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

  datePicker = React.createRef();
  showDatePicker = () => {
    this.datePicker.current
      .open({
        date: new Date()
      })
      .then(date => console.warn(date.toString()), () => {});
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
      this.setState({ results });
    });
  }

  render() {
    const { from, to, results } = this.state;
    return (
      <View style={styles.container}>
        <Input from={from} to={to} onSwitch={this.switch} />
        <Button title="Today" onPress={this.showDatePicker} />
        {results.map(route => (
          <Result
            from={from}
            to={to}
            departureTime={result.departureTime}
            arrivalTime={result.arrivalTime}
          />
        ))}
        <DatePickerModal
          ref={this.datePicker}
          mode="datetime"
          minuteInterval={5}
        />
      </View>
    );
  }
}
