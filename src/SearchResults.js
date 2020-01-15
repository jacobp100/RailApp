import React, {Component} from 'react';
import {FlatList} from 'react-native';
import fuzzball from 'fuzzball';
import stations from '../stations.json';
import Keyboard from './Keyboard';
import SearchItem from './SearchItem';

const keyExtractor = item => String(item.id);

const scorer = (search, choice, options) =>
  choice.crc === search.toUpperCase()
    ? 100
    : fuzzball.WRatio(search, choice.name, options);

export default class SearchResults extends Component {
  state = {results: []};

  timeout = null;
  componentDidUpdate() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.computeResults, 150);
  }

  unmounted = false;
  componentWillUnmount() {
    this.unmounted = true;
  }

  cachedResult = null;
  performSearch(search) {
    if (this.cachedResult != null && this.cachedResult.search === search) {
      return this.cachedResult.results;
    } else if (search.length === 0) {
      return [];
    }

    const results = fuzzball
      .extract(search, stations, {
        limit: 12,
        cutoff: 50,
        scorer,
      })
      .map(r => r[0]);

    this.cachedResult = {search, results};
    return results;
  }

  computeResults = () => {
    if (this.unmounted) return;
    this.setState((state, props) => ({
      results: this.performSearch(props.search),
    }));
  };

  renderItem = ({item}) => (
    <SearchItem id={item.id} title={item.name} onPress={this.props.onSelect} />
  );

  renderWithHeight = height => (
    <FlatList
      data={this.state.results}
      keyExtractor={keyExtractor}
      renderItem={this.renderItem}
      automaticallyAdjustContentInsets={false}
      contentInset={{bottom: height}}
      keyboardShouldPersistTaps="always"
    />
  );

  render() {
    return <Keyboard>{this.renderWithHeight}</Keyboard>;
  }
}
