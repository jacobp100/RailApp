import React, { Component, Children } from "react";
import fetchLiveResults from "./fetchLiveResults";

const LiveResultsContext = React.createContext(null);

export const fetchStatus = {
  NOT_FETCHING: 0,
  IN_PROGRESS: 1,
  FAILED: 2,
  UNAVAILABLE: 3
};

export class LiveResultsProvider extends Component {
  state = {
    liveResults: null,
    fetchStatus: fetchStatus.NOT_FETCHING,
    lastFetch: null
  };

  componentDidMount() {
    this.fetchLiveResults();
  }

  unmounted = false;
  componentWillUnmount() {
    this.unmounted = true;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.to !== this.props.to || prevProps.from !== this.props.from) {
      this.fetchLiveResults();
    }
  }

  queue = Promise.resolve();
  fetchLiveResults = () => {
    this.queue = this.queue.then(async () => {
      const { to, from, timestamp, now } = this.props;
      const within15MinsOfNow =
        Math.abs(Date.now() - timestamp) <= 15 * 60 * 1000;

      if (to != null && from != null && within15MinsOfNow) {
        try {
          this.setState({
            liveResults: null,
            fetchStatus: fetchStatus.IN_PROGRESS
          });
          let liveResults = null;
          try {
            liveResults = await fetchLiveResults(to, from, now);
          } catch (e) {}

          this.setState({
            liveResults,
            fetchStatus:
              liveResults != null
                ? fetchStatus.NOT_FETCHING
                : fetchStatus.FAILED,
            lastFetch: Date.now()
          });
        } catch (e) {}
      } else {
        this.setState({
          liveResults: null,
          fetchStatus: fetchStatus.UNAVAILABLE,
          lastFetch: Date.now()
        });
      }
    });
    return this.queue;
  };

  render() {
    return (
      <LiveResultsContext.Provider
        value={{
          liveResults: this.state.liveResults,
          fetchStatus: this.state.fetchStatus,
          lastFetch: this.state.lastFetch,
          fetchLiveResults: this.fetchLiveResults
        }}
      >
        {this.props.children}
      </LiveResultsContext.Provider>
    );
  }
}

export const LiveResultsConsumer = LiveResultsContext.Consumer;
