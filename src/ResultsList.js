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
import { getDate, formatDate, formatTime } from "./util";

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

const dates = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC"
];

const resultFor = async (from, to, { date, startTime, endTime }) => {
  const day = (getDate(date).getDay() + 1) % 7;
  const unsortedResults = await NativeModules.RouteReader.getData({
    day,
    date,
    startStation: from,
    endStation: to,
    startTime,
    endTime
  });

  const results = sortBy(["departureTime", "arrivalTime"], unsortedResults);

  return { date, data: results };
};

const resultsFor = async (from, to, date) => {
  const MINUTES_BEFORE = 30;
  const MINUTES_AFTER = 90;
  const baseDate = formatDate(date);
  const baseTime = formatTime(date);

  const promiseData = [];

  const DAY = 24 * 60;

  let dateBefore = baseDate;
  let remainingTimeBefore = baseTime - MINUTES_BEFORE;
  let dateAfter = baseDate;
  let remainingTimeAfter = baseTime + MINUTES_AFTER;

  while (remainingTimeBefore < 0) {
    dateBefore -= 1;
    remainingTimeBefore += DAY;
    promiseData.push({
      date: dateBefore,
      startTime: Math.max(0, remainingTimeBefore),
      endTime: DAY
    });
  }

  promiseData.push({
    date: baseDate,
    startTime: Math.max(0, remainingTimeBefore),
    endTime: Math.min(DAY, remainingTimeAfter)
  });

  while (remainingTimeAfter > DAY) {
    dateAfter += 1;
    remainingTimeAfter -= DAY;
    promiseData.push({
      date: dateAfter,
      startTime: 0,
      endTime: Math.min(DAY, remainingTimeAfter)
    });
  }

  const promises = promiseData.map(p => resultFor(from, to, p));
  const results = await Promise.all(promises);
  return results;
};

export default class ResultsList extends Component {
  static getDerivedStateFromProps({ to, from, date }, state) {
    if (to !== state.to || from !== state.from || date !== state.date) {
      return {
        to,
        from,
        date,
        results: null,
        placeholderResults: state.results
      };
    }
    return null;
  }

  constructor({ to, from, date }) {
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
    this.state = { to, from, date, results: null, placeholderResults: null };
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
    const { to, from, date } = this.state;

    this.fetchPromise = this.fetchPromise.then(async () => {
      const results = await resultsFor(from, to, date);

      this.setState(s => {
        if (s.to !== to || s.from !== from || s.date !== date) {
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
    const date = getDate(section.date);
    return (
      <View style={header.container}>
        <Text style={header.title}>
          {date.getDate()} {dates[date.getMonth()]} {date.getFullYear()}
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
