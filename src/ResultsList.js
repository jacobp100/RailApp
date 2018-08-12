import React, { Component } from "react";
import {
  Text,
  View,
  Button,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  NativeModules
} from "react-native";
import { sortBy } from "lodash/fp";
import Result from "./Result";
import ResultSeparator from "./ResultSeparator";
import stations from "../stations.json";

export default class ResultsList extends Component {
  static getDerivedStateFromProps({ to, from }, state) {
    if (to !== state.to || from !== state.from) {
      return { to, from, results: null };
    }
    return null;
  }

  constructor({ to, from }) {
    super();
    this.state = { to, from, results: null };
  }

  componentDidMount() {
    this.fetchResultsIfNeeded();
  }

  componentDidUpdate() {
    this.fetchResultsIfNeeded();
  }

  fetchPromise = Promise.resolve();
  fetchResultsIfNeeded() {
    if (this.state.results == null) {
      const { to, from } = this.state;
      this.fetchPromise = this.fetchPromise
        .then(() => {
          return NativeModules.RouteReader.getData({
            day: 1 << 6,
            date: 159,
            startStation: from,
            endStation: to,
            startTime: 17 * 60,
            endTime: 18 * 60
          });
        })
        .then(unsortedResults => {
          this.setState(s => {
            if (s.to !== to || s.from !== from) return null;
            const results = sortBy(
              ["departureTime", "arrivalTime"],
              unsortedResults
            );
            return { results };
          });
        });
    }
  }

  keyExtractor = (key, index) => String(index);

  renderItem = ({ item: result }) => (
    <Result
      from={stations[this.props.from].name}
      to={stations[this.props.to].name}
      departureTime={result.departureTime}
      arrivalTime={result.arrivalTime}
      departurePlatform={result.departurePlatform}
      arrivalPlatform={result.arrivalPlatform}
    />
  );

  getItemLayout = (data, index) => ({
    length: 80,
    offset: (80 + StyleSheet.hairlineWidth) * index,
    index
  });

  render() {
    const { results } = this.state;
    return results != null ? (
      <FlatList
        data={results}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
        ItemSeparatorComponent={ResultSeparator}
      />
    ) : (
      <ActivityIndicator style={{ flex: 1 }} />
    );
  }
}
