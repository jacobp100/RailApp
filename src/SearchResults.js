import React, { Component } from "react";
import { FlatList } from "react-native";
import fuzzball from "fuzzball";
import stations from "../stations.json";
import Keyboard from "./Keyboard";
import SearchItem from "./SearchItem";

const keyExtractor = item => String(item.id);

const scorer = (query, choice, options) =>
  choice.tla.toUpperCase() === query.toUpperCase()
    ? 100
    : fuzzball.WRatio(query, choice.name, options);

export default class SearchResults extends Component {
  state = { results: [] };

  timeout = null;
  componentDidUpdate() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.computeResults, 50);
  }

  cachedResult = null;
  performSearch(query) {
    if (this.cachedResult != null && this.cachedResult.query === query) {
      return this.cachedResult.results;
    } else if (query.length === 0) {
      return [];
    }

    const results = fuzzball
      .extract(query, stations, {
        limit: 12,
        cutoff: 50,
        scorer
      })
      .map(r => r[0]);

    this.cachedResult = { query, results };
    return results;
  }

  computeResults = () => {
    this.setState((state, props) => ({
      results: this.performSearch(props.query)
    }));
  };

  renderItem = ({ item }) => (
    <SearchItem id={item.id} title={item.name} onPress={this.props.onSelect} />
  );

  renderWithHeight = height => (
    <FlatList
      data={this.state.results}
      keyExtractor={keyExtractor}
      renderItem={this.renderItem}
      automaticallyAdjustContentInsets={false}
      contentInset={{ bottom: height }}
      keyboardShouldPersistTaps="always"
    />
  );

  render() {
    return <Keyboard>{this.renderWithHeight}</Keyboard>;
  }
}
