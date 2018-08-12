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

const resultsList = StyleSheet.create({
  spinner: {
    flex: 1
  }
});

const noResults = StyleSheet.create({
  container: {
    paddingHorizontal: 36,
    paddingVertical: 48
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
    color: "#8C8C8C",
    fontSize: 18
  },
  body: {
    textAlign: "center",
    color: "#8C8C8C",
    fontSize: 12
  }
});

const NoResults = () => (
  <View style={noResults.container}>
    <Text style={noResults.title}>No Results</Text>
    <Text style={noResults.body}>
      We only show direct journeys between stations
    </Text>
  </View>
);

export default class ResultsList extends Component {
  static getDerivedStateFromProps({ to, from }, state) {
    if (to !== state.to || from !== state.from) {
      return { to, from, results: null, placeholderResults: state.results };
    }
    return null;
  }

  constructor({ to, from }) {
    super();
    /*
    Placeholder results is used to freeze when updating results.
    If we're able to get the new results within 300ms, we'll show the previous
    results until the new ones arrive, then replace the results without showing
    a spinner.
    If, however, it takes longer than 300ms to deliver the results, we'll show
    a spinner.
    This makes it appear quicker to the user.
    */
    this.state = { to, from, results: null, placeholderResults: null };
  }

  componentDidMount() {
    this.fetchResultsIfNeeded();
  }

  unmounted = false;
  componentWillUnmount() {
    this.unmounted = true;
  }

  clearPlaceholderResultsTimeout = null;
  componentDidUpdate(prevProps, prevState) {
    this.fetchResultsIfNeeded();

    if (
      prevState.results != null &&
      this.state.results == null &&
      this.state.placeholderResults != null
    ) {
      const placeholderResults = this.state.placeholderResults;
      clearTimeout(this.clearPlaceholderResultsTimeout);
      this.clearPlaceholderResultsTimeout = setTimeout(() => {
        if (this.unmounted) return;
        this.setState(
          s =>
            s.placeholderResults === placeholderResults
              ? { placeholderResults: null }
              : null
        );
      }, 300);
    }
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
          if (this.unmounted) return;
          this.setState(s => {
            if (s.to !== to || s.from !== from) return null;
            const results = sortBy(
              ["departureTime", "arrivalTime"],
              unsortedResults
            );
            return { results, placeholderResults: null };
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
    const results = this.state.results || this.state.placeholderResults;
    return results != null ? (
      <FlatList
        data={results}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
        ItemSeparatorComponent={ResultSeparator}
        ListEmptyComponent={NoResults}
      />
    ) : (
      <ActivityIndicator style={resultsList.spinner} />
    );
  }
}
