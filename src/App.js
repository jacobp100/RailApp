import React, { Component } from "react";
import {
  Text,
  View,
  Image,
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

import stations from "../stations.json";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  toolbar: {
    flexDirection: "row",
    top: -12,
    paddingHorizontal: 48
  },
  pickDate: {
    color: "#BABABA",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8
  },
  clear: {
    marginLeft: 6
  },
  hidden: {
    display: "none"
  }
});

const MIN = 60 * 1000;

export default class App extends Component {
  state = {
    from: stations.find(r => r.tla === "WAT").id,
    to: stations.find(r => r.tla === "SUR").id,
    now: Math.floor(Date.now() / MIN) * MIN,
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
      this.setState({ now: Math.floor(Date.now() / MIN) * MIN });
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
    // Note: Not Math.floor here
    this.setState({ now: Math.round(Date.now() / MIN) * MIN });
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
            <Text style={styles.pickDate}>
              {customTimestamp == null ? "SET TIME" : "CUSTOM TIME SET"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={customTimestamp == null && styles.hidden}
            onPress={this.clearCustomDate}
          >
            <Image
              source={require("../assets/Cancel.png")}
              style={styles.clear}
            />
          </TouchableOpacity>
        </View>
        {activeInput !== inputs.NONE ? (
          <SearchResults search={search} onSelect={this.setSearchResult} />
        ) : from != null && to != null ? (
          <ResultsList
            from={from}
            to={to}
            timestamp={customTimestamp != null ? customTimestamp : now}
            now={now}
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
