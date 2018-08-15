import React, { Component } from "react";
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  StyleSheet,
  NativeModules
} from "react-native";
import { sortBy } from "lodash/fp";
import stations from "../stations.json";
import Result from "./Result";
import EmptyList from "./EmptyList";
import ResultSeparator from "./ResultSeparator";
import { getDate, formatDate, formatTime, monthNames } from "./util";

const resultsList = StyleSheet.create({
  spinner: {
    flex: 1
  }
});

const header = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  title: {
    fontSize: 10,
    fontWeight: "600",
    color: "#BABABA"
  }
});

const NoResults = () => (
  <EmptyList
    title="No Results"
    body="We can only show direct journeys without changes"
  />
);

const resultFor = async (
  startStation,
  endStation,
  { date, startTime, endTime }
) => {
  const day = (getDate(date).getDay() + 1) % 7;
  const unsortedResults = await NativeModules.RouteReader.getData({
    day,
    date,
    startStation,
    endStation,
    startTime,
    endTime
  });

  const results = sortBy(["departureTime", "arrivalTime"], unsortedResults);

  return { date, data: results };
};

const mod = (n, m) => ((n % m) + m) % m;

const resultsFor = async (from, to, timestamp) => {
  if (from == null || to == null || timestamp == null) return [];

  const MINUTES_BEFORE = 30;
  const MINUTES_AFTER = 90;
  const DAY = 24 * 60;
  const baseDate = formatDate(new Date(timestamp));
  const baseTime = formatTime(new Date(timestamp));

  const dateFrom = baseDate + Math.floor((baseTime - MINUTES_BEFORE) / DAY);
  const dateTo = baseDate + Math.ceil((baseTime + MINUTES_AFTER) / DAY) - 1;

  const timeFrom = mod(baseTime - MINUTES_BEFORE, DAY);
  const timeTo = mod(baseTime + MINUTES_AFTER, DAY);

  const promiseData = Array.from({ length: dateTo - dateFrom + 1 })
    .map((_, i) => dateFrom + i)
    .map(date => ({
      date,
      startTime: date === dateFrom ? timeFrom : 0,
      endTime: date === dateTo ? timeTo : DAY
    }));

  const promises = promiseData.map(p => resultFor(from, to, p));
  const results = await Promise.all(promises);
  return results;
};

export default class ResultsList extends Component {
  static defaultProps = {
    cacheResultsMs: 0
  };

  static getDerivedStateFromProps(
    { to, from, timestamp, cacheResultsMs },
    state
  ) {
    if (
      to !== state.to ||
      from !== state.from ||
      Math.abs(timestamp - state.timestamp) > cacheResultsMs
    ) {
      return {
        to,
        from,
        timestamp,
        results: null,
        placeholderResults: state.results
      };
    }
    return null;
  }

  constructor({ to, from, timestamp }) {
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
    this.state = {
      to,
      from,
      timestamp,
      results: null,
      placeholderResults: null
    };
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
    if (this.state.results != null) return;
    const { to, from, timestamp } = this.state;

    this.fetchPromise = this.fetchPromise.then(async () => {
      const results = await resultsFor(from, to, timestamp);

      this.setState(s => {
        if (s.to !== to || s.from !== from || s.timestamp !== timestamp) {
          return null;
        }

        return { results, placeholderResults: null };
      });
    });
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

  renderSectionHeader = ({ section }) => {
    const dateTime = getDate(section.date);
    return (
      <View style={header.container}>
        <Text style={header.title}>
          {dateTime.getDate()} {monthNames[dateTime.getMonth()]}{" "}
          {dateTime.getFullYear()}
        </Text>
      </View>
    );
  };

  getItemLayout = (data, index) => ({
    length: 80,
    offset: (80 + StyleSheet.hairlineWidth) * index,
    index
  });

  render() {
    const results = this.state.results || this.state.placeholderResults;
    return results != null ? (
      <SectionList
        sections={results}
        keyExtractor={this.keyExtractor}
        renderSectionHeader={this.renderSectionHeader}
        renderItem={this.renderItem}
        ItemSeparatorComponent={ResultSeparator}
        ListEmptyComponent={NoResults}
      />
    ) : (
      <ActivityIndicator style={resultsList.spinner} />
    );
  }
}
