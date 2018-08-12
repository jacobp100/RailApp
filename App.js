import React, { Component } from "react";
import {
  Text,
  View,
  Button,
  FlatList,
  StyleSheet,
  NativeModules
} from "react-native";
import { sortBy } from "lodash/fp";
import Input from "./src/Input";
import ResultsList from "./src/ResultsList";
import DatePickerModal from "./src/DatePickerModal";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  }
});

export default class App extends Component {
  state = {
    from: 2359,
    to: 2201
  };

  datePicker = React.createRef();
  showDatePicker = () => {
    this.datePicker.current
      .open({ date: new Date() })
      .then(date => console.warn(date.toString()), () => {});
  };

  switch = () =>
    this.setState(s => ({
      to: s.from,
      from: s.to
    }));

  render() {
    const { from, to } = this.state;
    return (
      <View style={styles.container}>
        <Input from={from} to={to} onSwitch={this.switch} />
        <Button title="Today" onPress={this.showDatePicker} />
        <ResultsList from={from} to={to} />
        <DatePickerModal
          ref={this.datePicker}
          mode="datetime"
          minuteInterval={5}
        />
      </View>
    );
  }
}
