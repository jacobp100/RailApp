import React from "react";
import { Animated, Easing } from "react-native";
import stations from "../../stations.json";
import * as inputs from "./inputs";
import PlatformComponent from "./PlatformComponent";

export default class Input extends React.Component {
  rotate = new Animated.Value(0);
  imageStyle = {
    transform: [
      {
        rotate: this.rotate.interpolate({
          inputRange: [0, 360],
          outputRange: ["0deg", "360deg"]
        })
      }
    ]
  };

  pressed = Animated.spring(this.rotate, {
    toValue: 30,
    useNativeDriver: true
  });
  unpressed = Animated.spring(this.rotate, {
    toValue: 0,
    useNativeDriver: true
  });
  spin = Animated.timing(this.rotate, {
    toValue: 180,
    easing: Easing.quad,
    duration: 250,
    useNativeDriver: true
  });

  onSwitchPressIn = () => this.pressed.start();
  onSwitchPressOut = () => this.unpressed.start();
  onSwitchPress = () => {
    this.spin.start(({ finished }) => {
      if (finished) this.rotate.setValue(0);
    });
    this.props.onSwitch();
  };

  onFromFocus = () => this.props.onSetActiveInput(inputs.FROM);
  onToFocus = () => this.props.onSetActiveInput(inputs.TO);
  onClearActiveInput = () => this.props.onSetActiveInput(inputs.NONE);

  render() {
    const { from, to, activeInput, onSetSearch } = this.props;
    const hash =
      from != null && to != null ? from + to + (from > to ? 1 : 0) : 0;

    return (
      <PlatformComponent
        activeInput={activeInput}
        to={to != null ? stations[to].name : ""}
        from={from != null ? stations[from].name : ""}
        hash={hash}
        onFromFocus={this.onFromFocus}
        onToFocus={this.onToFocus}
        onSetSearch={onSetSearch}
        onClearActiveInput={this.onClearActiveInput}
        onSwitchPress={this.onSwitchPress}
        onSwitchPressIn={this.onSwitchPressIn}
        onSwitchPressOut={this.onSwitchPressOut}
        imageStyle={this.imageStyle}
      />
    );
  }
}

export { inputs };
