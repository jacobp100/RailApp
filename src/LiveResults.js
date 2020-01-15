import React, {Component} from 'react';
import {fetchLiveResults, fetchLiveResult} from './fetchLiveResults';

const LiveResultsContext = React.createContext(null);

export const fetchStatus = {
  NOT_FETCHING: 0,
  IN_PROGRESS: 1,
  FAILED: 2,
  UNAVAILABLE: 3,
};

const canFetchLiveResults = timestamp =>
  Math.abs(Date.now() - timestamp) <= 15 * 60 * 1000;

export class LiveResultsProvider extends Component {
  state = {
    liveResults: null,
    fetchStatus: fetchStatus.NOT_FETCHING,
    lastFetch: null,
  };

  componentDidMount() {
    this.fetchLiveResults();
  }

  unmounted = false;
  componentWillUnmount() {
    this.unmounted = true;
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.to !== this.props.to ||
      prevProps.from !== this.props.from ||
      canFetchLiveResults(prevProps.timestamp) !==
        canFetchLiveResults(this.props.timestamp)
    ) {
      this.fetchLiveResults();
    }
  }

  queue = Promise.resolve();
  fetchLiveResults = () => {
    this.queue = this.queue.then(async () => {
      const {to, from, now} = this.props;

      if (
        to != null &&
        from != null &&
        canFetchLiveResults(this.props.timestamp)
      ) {
        try {
          this.setState({
            liveResults: null,
            fetchStatus: fetchStatus.IN_PROGRESS,
          });
          let liveResults = null;
          try {
            liveResults = await fetchLiveResults({from, to, now});
          } catch (e) {}

          this.setState({
            liveResults,
            fetchStatus:
              liveResults != null
                ? fetchStatus.NOT_FETCHING
                : fetchStatus.FAILED,
            lastFetch: Date.now(),
          });

          this.enhanceLiveResults(to, from, now, liveResults);
        } catch (e) {}
      } else {
        this.setState({
          liveResults: null,
          fetchStatus: fetchStatus.UNAVAILABLE,
          lastFetch: Date.now(),
        });
      }
    });
    return this.queue;
  };

  async enhanceLiveResults(to, from, now, liveResults) {
    try {
      const enhancedLiveResults = await Promise.all(
        liveResults.map(service => fetchLiveResult({from, to, now, service})),
      );
      this.setState(s =>
        s.liveResults === liveResults
          ? {liveResults: enhancedLiveResults}
          : null,
      );
    } catch (e) {}
  }

  render() {
    return (
      <LiveResultsContext.Provider
        value={{
          liveResults: this.state.liveResults,
          fetchStatus: this.state.fetchStatus,
          lastFetch: this.state.lastFetch,
          fetchLiveResults: this.fetchLiveResults,
        }}>
        {this.props.children}
      </LiveResultsContext.Provider>
    );
  }
}

export const LiveResultsConsumer = LiveResultsContext.Consumer;
