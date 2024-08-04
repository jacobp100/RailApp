import React, {Component} from 'react';
import {Text, Animated, TouchableWithoutFeedback} from 'react-native';

export default class SearchItem extends Component {
  tween = new Animated.Value(0);

  pressIn = Animated.timing(this.tween, {
    toValue: 1,
    duration: 100,
    useNativeDriver: true,
  });
  pressOut = Animated.timing(this.tween, {
    toValue: 0,
    duration: 100,
    useNativeDriver: true,
  });

  viewStyle = {
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: 32,
    backgroundColor: this.tween.interpolate({
      inputRange: [0, 1],
      outputRange: ['white', '#F2F2F2'],
    }),
  };

  onPressIn = () => this.pressIn.start();
  onPressOut = () => this.pressOut.start();
  onPress = () => this.props.onPress(this.props.id);

  render() {
    return (
      <TouchableWithoutFeedback
        onPressIn={this.onPressIn}
        onPressOut={this.onPressOut}
        onPress={this.onPress}>
        <Animated.View style={this.viewStyle}>
          <Text>{this.props.title}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}
