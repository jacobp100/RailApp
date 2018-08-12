import React, { Component } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import Input, { inputs } from "./src/Input";
import EmptyList from "./src/EmptyList";
import ResultsList from "./src/ResultsList";
import SearchResults from "./src/SearchResults";
import DatePickerModal from "./src/DatePickerModal";
import { formatDate } from "./src/util";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  toolbar: {
    top: -12,
    paddingHorizontal: 48
  },
  datePicker: {
    color: "#BABABA",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8
  }
});

export default class App extends Component {
  state = {
    from: null,
    to: null,
    date: new Date(2018, 7, 12, 23),
    search: "",
    activeInput: inputs.NONE
  };

  datePicker = React.createRef();
  showDatePicker = () => {
    this.datePicker.current
      .open({ date: this.state.date })
      .then(date => this.setState({ date }), () => {});
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
    const { from, to, date, activeInput, search } = this.state;
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
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={this.showDatePicker}>
            <View>
              <Text style={styles.datePicker}>SET TIME</Text>
            </View>
          </TouchableOpacity>
        </View>
        {activeInput !== inputs.NONE ? (
          <SearchResults search={search} onSelect={this.setSearchResult} />
        ) : from != null && to != null ? (
          <ResultsList from={from} to={to} date={date} />
        ) : (
          <EmptyList
            title="To Get Started"
            body="Fill in the ‘from’ and ‘to’ fields above to search for trains"
          />
        )}
        <DatePickerModal
          ref={this.datePicker}
          mode="datetime"
          minuteInterval={5}
        />
      </View>
    );
  }
}
