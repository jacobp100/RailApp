import React, { Component } from "react";
import { SectionList, ActivityIndicator, StyleSheet } from "react-native";
import stations from "../stations.json";
import EmptyList from "./EmptyList";
import ResultItem, { separatorTypes } from "./ResultItem";
import ResultSectionHeader from "./ResultSectionHeader";
import { isDeparted } from "./resultUtil";
import { resultsFor } from "./atocUtil";

const resultsList = StyleSheet.create({
  spinner: {
    flex: 1
  }
});

const NoResults = () => (
  <EmptyList
    title="No Results"
    body="We can only show direct journeys without changes"
  />
);

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

  renderItem = ({ item, index, section }) => {
    const { now } = this.props;
    const departed = isDeparted(now, item);
    const previousItem = index > 0 ? section.data[index - 1] : null;
    const previousItemDeparted =
      previousItem != null ? isDeparted(previousItem) : true;

    let separatorType =
      index === 0 || departed || previousItemDeparted
        ? separatorTypes.none
        : separatorTypes.default;

    const DAY = 24 * 60 * 60 * 1000;
    if (section.timestamp >= now && nextSectionTimestamp + DAY < now) {
      const currentDepartedAccordingToSchedule = item.departureTimestamp >= now;
      const previousDepartedAccordingToSchedule =
        previousItem != null ? previousItem.departureTimestamp > now : true;

      if (
        previousDepartedAccordingToSchedule &&
        !currentDepartedAccordingToSchedule
      ) {
        separatorType = separatorTypes.CURRENT_TIME;
      }
    }

    return (
      <ResultItem
        from={stations[this.props.from].name}
        to={stations[this.props.to].name}
        departureTime={item.departureTime}
        arrivalTime={item.arrivalTime}
        departurePlatform={item.departurePlatform}
        arrivalPlatform={item.arrivalPlatform}
        departed={departed}
        separatorType={separatorType}
      />
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
        renderSectionHeader={ResultSectionHeader}
        renderItem={this.renderItem}
        ListEmptyComponent={NoResults}
        extraData={this.props.now}
      />
    ) : (
      <ActivityIndicator style={resultsList.spinner} />
    );
  }
}
