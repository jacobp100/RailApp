import React from "react";
import {
  View,
  Text,
  Image,
  MaskedViewIOS,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  StyleSheet
} from "react-native";
import Layout from "./Layout";

const inputLayout = {
  height: 38,
  marginBottom: 1
};

const inputMask = {
  backgroundColor: "black",
  borderRadius: 3
};

const baseStyles = StyleSheet.create({
  container: {
    margin: 24,
    marginTop: 36
  }
});

const maskStyles = StyleSheet.create({
  shadow: {
    shadowRadius: 12,
    shadowOpacity: 0.3,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 }
  },
  topInput: {
    ...inputLayout,
    ...inputMask,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  bottomInput: {
    ...inputLayout,
    ...inputMask,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    margin: -24
  }
});

const inputStyles = StyleSheet.create({
  input: {
    ...inputLayout,
    justifyContent: "center",
    paddingHorizontal: 24
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

const gradients = [
  require("../../assets/Gradient1.png"),
  require("../../assets/Gradient2.png"),
  require("../../assets/Gradient3.png"),
  require("../../assets/Gradient4.png")
];

export default class Input extends React.Component {
  rotate = new Animated.Value(0);
  imageStyle = {
    tintColor: "black",
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
    const { from = "London Waterloo", to = "Surbiton" } = this.props;

    let hash = [from, to]
      .sort()
      .reduce((accum, str) => accum + str.charCodeAt(0), 0);
    if (from > to) hash += 1;
    hash %= gradients.length;

    return (
      <View style={baseStyles.container}>
        <MaskedViewIOS
          style={StyleSheet.absoluteFill}
          maskElement={
            <Layout
              style={maskStyles.shadow}
              topInput={<View style={maskStyles.topInput} />}
              bottomInput={<View style={maskStyles.bottomInput} />}
              attachment={
                <Animated.Image
                  source={require("../../assets/SwitchButton.png")}
                  style={this.imageStyle}
                />
              }
            />
          }
        >
          <Image style={maskStyles.image} source={gradients[hash]} />
        </MaskedViewIOS>
        <Layout
          topInput={
            <View style={inputStyles.input}>
              <Text style={inputStyles.text}>{from}</Text>
            </View>
          }
          bottomInput={
            <View style={inputStyles.input}>
              <Text style={inputStyles.text}>{to}</Text>
            </View>
          }
          attachment={
            <TouchableWithoutFeedback
              onPressIn={this.onPressIn}
              onPressOut={this.onPressOut}
              onPress={this.onPress}
            >
              <View style={inputStyles.switchPlaceholder} />
            </TouchableWithoutFeedback>
          }
        />
      </View>
    );
  }
}
