import React, { Component } from "react";
import { SectionList, ActivityIndicator, StyleSheet } from "react-native";
import stations from "../stations.json";
import EmptyList from "./EmptyList";
import ResultItem, { itemHeight, separatorTypes } from "./ResultItem";
import ResultSectionHeader from "./ResultSectionHeader";
import fetchLiveResults from "./fetchLiveResults";
import fetchOfflineResults from "./fetchOfflineResults";
import { isDeparted, mergeResults } from "./resultUtil";

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
        offlineResults: null,
        placeholderOfflineResults: state.offlineResults,
        liveResults: null
      };
    }
    return null;
  }

  /*
    Placeholder results is used to freeze when updating results.
    If we're able to get the new results within 300ms, we'll show the previous
    results until the new ones arrive, then replace the results without showing
    a spinner.
    If, however, it takes longer than 300ms to deliver the results, we'll show
    a spinner.
    This makes it appear quicker to the user.
    */
  state = {
    to: this.props,
    from: this.props,
    timestamp: this.props,
    offlineResults: null,
    placeholderOfflineResults: null,
    liveResults: null
  };

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
      prevState.offlineResults != null &&
      this.state.offlineResults == null &&
      this.state.placeholderOfflineResults != null
    ) {
      const placeholderOfflineResults = this.state.placeholderOfflineResults;
      clearTimeout(this.clearPlaceholderResultsTimeout);
      this.clearPlaceholderResultsTimeout = setTimeout(() => {
        if (this.unmounted) return;
        this.setState(
          s =>
            s.placeholderOfflineResults === placeholderOfflineResults
              ? { placeholderOfflineResults: null }
              : null
        );
      }, 300);
    }
  }

  fetchPromise = Promise.resolve();
  fetchResultsIfNeeded() {
    if (this.state.offlineResults != null) return;

    const { to, from, timestamp } = this.state;
    if (to == null || from == null || timestamp == null) return;

    const setStateIfUnchanged = state =>
      this.setState(s => {
        return s.to === to && s.from === from && s.timestamp === timestamp
          ? state
          : null;
      });

    this.fetchPromise = this.fetchPromise.then(() =>
      Promise.all([
        fetchOfflineResults(from, to, timestamp).then(offlineResults =>
          setStateIfUnchanged({ offlineResults })
        ),
        fetchLiveResults(from, to).then(liveResults =>
          setStateIfUnchanged({ liveResults })
        )
      ])
    );
  }

  keyExtractor = (key, index) => String(index);

  renderItem = ({ item, index, section }) => {
    const { now } = this.props;
    const departed = isDeparted(now, item);
    const previousItem = index > 0 ? section.data[index - 1] : null;
    const previousItemDeparted =
      previousItem != null ? isDeparted(now, previousItem) : true;

    let separatorType =
      index === 0 || departed || previousItemDeparted
        ? separatorTypes.NONE
        : separatorTypes.DEFAULT;

    const DAY = 24 * 60 * 60 * 1000;
    const sectionIsToday =
      section.timestamp <= now && section.timestamp + DAY >= now;
    if (sectionIsToday) {
      const currentDepartedAccordingToSchedule = item.departureTimestamp <= now;
      const previousDepartedAccordingToSchedule =
        previousItem != null ? previousItem.departureTimestamp <= now : true;

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
        departureTimestamp={item.departureTimestamp}
        arrivalTimestamp={item.arrivalTimestamp}
        departurePlatform={item.departurePlatform}
        arrivalPlatform={item.arrivalPlatform}
        serviceStatus={item.serviceStatus}
        departed={departed}
        separatorType={separatorType}
      />
    );
  };

  getItemLayout = (data, index) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index
  });

  render() {
    const offlineResults =
      this.state.offlineResults || this.state.placeholderOfflineResults;
    const { liveResults } = this.state;

    if (offlineResults == null) {
      return <ActivityIndicator style={resultsList.spinner} />;
    }

    const { now } = this.props;
    const sections = mergeResults(offlineResults, liveResults);
    const initialScrollIndex = Math.max(
      sections[0].data.findIndex(d => d.departureTimestamp > now) - 1,
      0
    );

    return (
      <SectionList
        sections={sections}
        keyExtractor={this.keyExtractor}
        renderSectionHeader={ResultSectionHeader}
        renderItem={this.renderItem}
        getItemLayout={this.getItemLayout}
        initialScrollIndex={initialScrollIndex}
        ListEmptyComponent={NoResults}
        extraData={now}
      />
    );
  }
}
