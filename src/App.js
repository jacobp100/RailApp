import React, {Component} from 'react';
import {View, SafeAreaView, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Input, {inputs} from './Input';
import TimeMonitor from './TimeMonitor';
import DatePicker from './DatePicker';
import Refresh from './Refresh';
import EmptyList from './EmptyList';
import {LiveResultsProvider} from './LiveResults';
import ResultsList from './ResultsList';
import SearchResults from './SearchResults';
import StopsModal from './StopsModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  toolbar: {
    flexDirection: 'row',
    top: -12,
    paddingLeft: 48,
    paddingRight: 29,
  },
  pullRight: {
    marginLeft: 'auto',
  },
});

const LAST_SEARCH_KEY = 'lastSearch';
let lastSearchQueue = Promise.resolve();

export default class App extends Component {
  state = {
    from: null,
    to: null,
    now: TimeMonitor.now(),
    customTimestamp: null,
    search: '',
    activeInput: inputs.NONE,
  };

  stopsModal = React.createRef();

  componentDidMount() {
    lastSearchQueue = lastSearchQueue
      .then(() => AsyncStorage.getItem(LAST_SEARCH_KEY))
      .then(lastSearch => {
        if (lastSearch != null) {
          const {from, to} = JSON.parse(lastSearch);
          this.setState({from, to});
        }
      })
      .catch(() => {});
  }

  componentDidUpdate(prevState) {
    if (this.state.from !== prevState.from || this.state.to !== prevState.to) {
      const {from, to} = this.state;
      lastSearchQueue = lastSearchQueue.then(() =>
        AsyncStorage.setItem(LAST_SEARCH_KEY, JSON.stringify({from, to})),
      );
    }
  }

  setNow = now => this.setState({now});
  setDate = customTimestamp => this.setState({customTimestamp});

  switchLocations = () => this.setState(s => ({to: s.from, from: s.to}));

  setActiveInput = activeInput => this.setState({activeInput, search: ''});
  setSearch = search => this.setState({search});
  setSearchResult = id =>
    this.setState(s => {
      if (s.activeInput === inputs.TO) {
        return {to: id, activeInput: inputs.NONE, search: ''};
      } else if (s.activeInput === inputs.FROM) {
        return {from: id, activeInput: inputs.NONE, search: ''};
      }
      return null;
    });

  showStopsForItem = event => {
    if (this.stopsModal.current != null) {
      this.stopsModal.current.show(event);
    }
  };

  render() {
    const {from, to, customTimestamp, now, activeInput, search} = this.state;
    const timestamp = customTimestamp != null ? customTimestamp : now;
    return (
      <LiveResultsProvider from={from} to={to} timestamp={timestamp} now={now}>
        <TimeMonitor onTimeChanged={this.setNow} />
        <SafeAreaView style={styles.container}>
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
            <ResultsList
              from={from}
              to={to}
              timestamp={timestamp}
              now={now}
              onPressItem={this.showStopsForItem}
            />
          ) : (
            <EmptyList
              title="To Get Started"
              body="Fill in the ‘from’ and ‘to’ fields above to search for trains"
            />
          )}
          <StopsModal ref={this.stopsModal} now={now} />
        </SafeAreaView>
      </LiveResultsProvider>
    );
  }
}
