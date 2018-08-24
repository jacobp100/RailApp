import React, { Component, Children } from "react";
import fetchLiveResults from "./fetchLiveResults";

const LiveResultsContext = React.createContext(null);

export const fetchStatus = {
  NOT_FETCHING: 0,
  IN_PROGRESS: 1,
  FAILED: 2
};

export class LiveResultsProvider extends Component {
  state = { liveResults: null, status: fetchStatus.NOT_FETCHING };

  queue = Promise.resolve();

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

  fetchLiveResults() {
    this.queue = this.queue.then(async () => {
      const { to, from, now } = this.props;
      if (to != null && from != null) {
        try {
          this.setState({ fetchStatus: fetchStatus.IN_PROGRESS });
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
          fetchStatus: fetchStatus.NOT_FETCHING,
          lastFetch: Date.now()
        });
      }
    });
    return this.queue;
  }

  render() {
    return (
      <LiveResultsContext.Provider
        value={{
          liveResults: this.state.liveResults,
          fetchStatus: this.state.fetchStatus,
          fetchLiveResults: this.fetchLiveResults
        }}
      >
        {this.props.children}
      </LiveResultsContext.Provider>
    );
  }
}

export const LiveResultsConsumer = LiveResultsContext.Consumer;
