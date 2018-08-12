import React from "react";
import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  StyleSheet
} from "react-native";
import stations from "../../stations.json";
import PlatformComponent from "./PlatformComponent";

const baseInput = {
  justifyContent: "center",
  paddingHorizontal: 24,
  height: 38,
  marginBottom: 1,
  backgroundColor: "black",
  borderRadius: 3
};

const baseStyles = StyleSheet.create({
  container: {
    margin: 24,
    marginTop: 36
  }
});

const inputStyles = StyleSheet.create({
  topInput: {
    ...baseInput,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  bottomInput: {
    ...baseInput,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -1 / 18
  },
  switchPlaceholder: {
    alignSelf: "stretch",
    width: Image.resolveAssetSource(require("../../assets/SwitchButton.png"))
      .width
  }
});

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

  onPressIn = () => this.pressed.start();
  onPressOut = () => this.unpressed.start();
  onPress = () => {
    this.spin.start(({ finished }) => {
      if (finished) this.rotate.setValue(0);
    });
    this.props.onSwitch();
  };

  render() {
    const { from, to } = this.props;
    const hash = from + to + (from > to ? 1 : 0);

    return (
      <PlatformComponent
        to={stations[to].name}
        from={stations[from].name}
        hash={hash}
        onPress={this.onPress}
        onPressIn={this.onPressIn}
        onPressOut={this.onPressOut}
        imageStyle={this.imageStyle}
      />
    );
  }
}
