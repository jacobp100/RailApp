import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  AppState
} from "react-native";
import Input, { inputs } from "./Input";
import EmptyList from "./EmptyList";
import ResultsList from "./ResultsList";
import SearchResults from "./SearchResults";
import DatePickerModal from "./DatePickerModal";
import everyInterval from "./everyInterval";

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
  },
  hidden: {
    display: "none"
  }
});

const MIN = 60 * 1000;

export default class App extends Component {
  state = {
    from: null,
    to: null,
    now: Date.now(),
    customTimestamp: null,
    search: "",
    activeInput: inputs.NONE
  };

  componentDidUpdate() {
    this.stopMonitoringTime();
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  componentDidUpdate() {
    this.stopMonitoringTime();
    AppState.removeEventListener("change", this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    if (nextAppState === "active") {
      this.startMonitoringTime();
    } else {
      this.stopMonitoringTime();
    }
  };

  intervalHandle = null;
  startMonitoringTime() {
    if (this.intervalHandle == null) {
      this.intervalHandle = everyInterval(this.updateNow, MIN);
    }
  }
  stopMonitoringTime() {
    if (this.intervalHandle != null) {
      this.intervalHandle();
      this.intervalHandle = null;
    }
  }
  updateNow = () => {
    this.setState({ now: Date.now() });
  };

  datePicker = React.createRef();
  showDatePicker = () => {
    const { customTimestamp } = this.state;
    this.datePicker.current
      .open({
        date: customTimestamp != null ? new Date(customTimestamp) : new Date()
      })
      .then(
        date => this.setState({ customTimestamp: date.getTime() }),
        () => {}
      );
  };

  clearCustomDate = () => this.setState({ customTimestamp: null });

  switchLocations = () =>
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
      return null;
    });

  render() {
    const { from, to, customTimestamp, now, activeInput, search } = this.state;
    return (
      <View style={styles.container}>
        <Input
          from={from}
          to={to}
          activeInput={activeInput}
          onSetSearch={this.setSearch}
          onSetActiveInput={this.setActiveInput}
          onSwitch={this.switchLocations}
        />
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={this.showDatePicker}>
            <View>
              <Text style={styles.datePicker}>
                {customTimestamp == null ? "SET TIME" : "CUSTOM TIME SET"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.clearCustomDate}>
            <View style={customTimestamp != null ? styles.hidden : null}>
              <Text style={styles.datePicker}>x</Text>
            </View>
          </TouchableOpacity>
        </View>
        {activeInput !== inputs.NONE ? (
          <SearchResults search={search} onSelect={this.setSearchResult} />
        ) : from != null && to != null ? (
          <ResultsList
            from={from}
            to={to}
            timestamp={customTimestamp != null ? customTimestamp : now}
            cacheResultsMs={15 * 60 * 1000}
          />
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
