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
import TimeMonitor from "./TimeMonitor";
import DatePicker from "./DatePicker";
import Refresh from "./Refresh";
import EmptyList from "./EmptyList";
import { LiveResultsProvider } from "./LiveResults";
import ResultsList from "./ResultsList";
import SearchResults from "./SearchResults";
import everyInterval from "./everyInterval";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  toolbar: {
    flexDirection: "row",
    top: -12,
    paddingLeft: 48,
    paddingRight: 29
  },
  pullRight: {
    marginLeft: "auto"
  }
});

export default class App extends Component {
  state = {
    from: null,
    to: null,
    // from: require("../stations.json").find(s => s.crc === "WAT").id,
    // to: require("../stations.json").find(s => s.crc === "SUR").id,
    now: TimeMonitor.now(),
    customTimestamp: null,
    search: "",
    activeInput: inputs.NONE
  };

  setNow = now => this.setState({ now });
  setDate = customTimestamp => this.setState({ customTimestamp });

  switchLocations = () => this.setState(s => ({ to: s.from, from: s.to }));

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
    const timestamp = customTimestamp != null ? customTimestamp : now;
    return (
      <LiveResultsProvider from={from} to={to} timestamp={timestamp} now={now}>
        <TimeMonitor onTimeChanged={this.setNow} />
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
            <DatePicker value={customTimestamp} onDateChanged={this.setDate} />
            <Refresh now={now} style={styles.pullRight} />
          </View>
          {activeInput !== inputs.NONE ? (
            <SearchResults search={search} onSelect={this.setSearchResult} />
          ) : from != null && to != null ? (
            <ResultsList from={from} to={to} timestamp={timestamp} now={now} />
          ) : (
            <EmptyList
              title="To Get Started"
              body="Fill in the ‘from’ and ‘to’ fields above to search for trains"
            />
          )}
        </View>
      </LiveResultsProvider>
    );
  }
}
