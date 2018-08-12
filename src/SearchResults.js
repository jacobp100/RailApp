import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  Animated,
  TouchableWithoutFeedback
} from "react-native";
import fuzzball from "fuzzball";
import stations from "../stations.json";
import Keyboard from "./Keyboard";

const keyExtractor = p => String(p.id);

const scorer = (query, choice, options) =>
  choice.tla.toUpperCase() === query.toUpperCase()
    ? 100
    : fuzzball.WRatio(query, choice.name, options);

class SearchItem extends Component {
  tween = new Animated.Value(0);

  pressIn = Animated.timing(this.tween, { toValue: 1, duration: 100 });
  pressOut = Animated.timing(this.tween, { toValue: 0, duration: 100 });

  viewStyle = {
    paddingHorizontal: 12,
    justifyContent: "center",
    height: 28,
    backgroundColor: this.tween.interpolate({
      inputRange: [0, 1],
      outputRange: ["white", "#F2F2F2"]
    })
  };

  onPressIn = () => this.pressIn.start();
  onPressOut = () => this.pressOut.start();
  onPress = () => this.props.onPress(this.props.id);

  render() {
    return (
      <TouchableWithoutFeedback
        onPressIn={this.onPressIn}
        onPressOut={this.onPressOut}
        onPress={this.onPress}
      >
        <Animated.View style={this.viewStyle}>
          <Text>{this.props.title}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}

export default class SearchResults extends Component {
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

  renderItem = ({ item }) => (
    <SearchItem id={item.id} title={item.name} onPress={this.props.onSelect} />
  );

  renderWithHeight = height => {
    const { search } = this.props;
    return (
      <FlatList
        data={this.performSearch(search)}
        keyExtractor={keyExtractor}
        renderItem={this.renderItem}
        automaticallyAdjustContentInsets={false}
        contentInset={{ bottom: height }}
        keyboardShouldPersistTaps="always"
      />
    );
  };

  render() {
    return <Keyboard>{this.renderWithHeight}</Keyboard>;
  }
}
