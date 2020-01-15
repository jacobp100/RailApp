import React, {Component} from 'react';
import {SectionList, ActivityIndicator, StyleSheet} from 'react-native';
import stations from '../stations.json';
import EmptyList from './EmptyList';
import ResultItem, {separatorTypes} from './ResultItem';
import ResultSectionHeader from './ResultSectionHeader';
import offlineResultsCache from './offlineResultsCache';
import {LiveResultsConsumer} from './LiveResults';
import {isScheduledDeparted, isDeparted, mergeResults} from './resultUtil';

const noop = () => {};

const resultsList = StyleSheet.create({
  spinner: {
    flex: 1,
  },
});

const NoResults = () => (
  <EmptyList
    title="No Results"
    body="We can only show direct journeys without changes"
  />
);

const getOfflineResults = offlineResultsCache({
  refreshThreshold: 15 * 60 * 1000,
});

export default class ResultsList extends Component {
  /*
    Placeholder results is used to freeze when updating results.
    If we're able to get the new results within 300ms, we'll show the previous
    results until the new ones arrive, then replace the results without showing
    a spinner.
    If, however, it takes longer than 300ms to deliver the results, we'll show
    a spinner.
    This makes it appear quicker to the user.
    */
  state = {offlineResults: null, placeholderOfflineResults: null};

  componentDidMount() {
    this.fetchOfflineResultsIfNeeded();
  }

  unmounted = false;
  componentWillUnmount() {
    this.unmounted = true;
  }

  clearPlaceholderResultsTimeout = null;
  componentDidUpdate(prevProps, prevState) {
    this.fetchOfflineResultsIfNeeded();

    if (
      prevState.offlineResults != null &&
      this.state.offlineResults == null &&
      this.state.placeholderOfflineResults != null
    ) {
      const {placeholderOfflineResults} = this.state;
      clearTimeout(this.clearPlaceholderResultsTimeout);
      this.clearPlaceholderResultsTimeout = setTimeout(() => {
        if (this.unmounted) return;
        this.setState(s =>
          s.placeholderOfflineResults === placeholderOfflineResults
            ? {placeholderOfflineResults: null}
            : null,
        );
      }, 300);
    }
  }

  fetchOfflineResultsIfNeeded() {
    const {from, to, timestamp} = this.props;
    try {
      const offlineResults = getOfflineResults({from, to, timestamp});
      this.setState(state =>
        state.offlineResults !== offlineResults
          ? {offlineResults, placeholderOfflineResults: null}
          : null,
      );
    } catch (e) {
      if (e != null && typeof e.then === 'function') {
        e.then(offlineResults => {
          if (!this.unmounted) {
            this.setState((state, props) =>
              props.from === from && props.to === to
                ? {offlineResults, placeholderOfflineResults: null}
                : null,
            );
          }
        });
      } else {
        throw e;
      }
    }
  }

  keyExtractor = (key, index) => String(index);

  renderItem = ({item, index, section}) => {
    const {now} = this.props;
    const scheduledDeparted = isScheduledDeparted(now, item);
    const previousItem = index > 0 ? section.data[index - 1] : null;
    const previousItemDeparted =
      previousItem != null ? isScheduledDeparted(now, previousItem) : true;

    let separatorType =
      index === 0 || scheduledDeparted || previousItemDeparted
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
        departed={isDeparted(now, item)}
        separatorType={separatorType}
        item={item}
        onPress={this.props.onPressItem}
      />
    );
  };

  renderWithLiveResults = ({liveResults}) => {
    const offlineResults =
      this.state.offlineResults || this.state.placeholderOfflineResults;

    if (offlineResults == null) {
      return <ActivityIndicator style={resultsList.spinner} />;
    }

    const {now} = this.props;
    const sections = mergeResults(offlineResults, liveResults);
    const initialScrollIndex =
      sections.length !== 0
        ? Math.max(
            sections[0].data.findIndex(d => d.departureTimestamp > now) - 1,
            0,
          )
        : 0;

    return (
      <SectionList
        sections={sections}
        keyExtractor={this.keyExtractor}
        renderSectionHeader={ResultSectionHeader}
        renderItem={this.renderItem}
        initialScrollIndex={initialScrollIndex}
        onScrollToIndexFailed={noop}
        ListEmptyComponent={NoResults}
        extraData={now}
      />
    );
  };

  render() {
    return (
      <LiveResultsConsumer>{this.renderWithLiveResults}</LiveResultsConsumer>
    );
  }
}
