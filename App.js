import React, { Component } from "react";
import { Text, View, Button, StyleSheet } from "react-native";
import Input, { inputs } from "./src/Input";
import ResultsList from "./src/ResultsList";
import SearchResults from "./src/SearchResults";
import DatePickerModal from "./src/DatePickerModal";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  }
});

export default class App extends Component {
  state = {
    from: null,
    to: null,
    search: "",
    activeInput: inputs.NONE
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

  setActiveInput = activeInput => this.setState({ activeInput, search: "" });
  setSearch = search => this.setState({ search });
  setSearchResult = id =>
    this.setState(s => {
      if (s.activeInput === inputs.TO) {
        return { to: id, activeInput: inputs.NONE, search: "" };
      } else if (s.activeInput === inputs.FROM) {
        return { from: id, activeInput: inputs.NONE, search: "" };
      }
    });

  render() {
    const { from, to, activeInput, search } = this.state;
    return (
      <View style={styles.container}>
        <Input
          from={from}
          to={to}
          activeInput={activeInput}
          onSetSearch={this.setSearch}
          onSetActiveInput={this.setActiveInput}
          onSwitch={this.switch}
        />
        <Button title="Today" onPress={this.showDatePicker} />
        {activeInput !== inputs.NONE ? (
          <SearchResults search={search} onSelect={this.setSearchResult} />
        ) : from != null && to != null ? (
          <ResultsList from={from} to={to} />
        ) : null}
        <DatePickerModal
          ref={this.datePicker}
          mode="datetime"
          minuteInterval={5}
        />
      </View>
    );
  }
}
