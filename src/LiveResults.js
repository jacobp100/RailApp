import React, { Component, Children } from "react";
import fetchLiveResults from "./fetchLiveResults";

const LiveResultsContext = React.createContext(null);

export class LiveResultsProvider extends Component {
  state = { liveResults: null };

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
          const liveResults = await fetchLiveResults(to, from, now);
          if (!this.unmounted) this.setState({ liveResults });
        } catch (e) {}
      } else {
        this.setState(
          s => (s.liveResults != null ? { liveResults: null } : null)
        );
      }
    });
    return this.queue;
  }

  render() {
    return (
      <LiveResultsContext.Provider
        value={{
          liveResults: this.state.liveResults,
          fetchLiveResults: this.fetchLiveResults
        }}
      >
        {this.props.children}
      </LiveResultsContext.Provider>
    );
  }
}

export const LiveResultsConsumer = LiveResultsContext.Consumer;
