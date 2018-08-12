import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  MaskedViewIOS,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet
} from "react-native";
import Layout from "./Layout";
import Input from "./Input";
import * as inputs from "./inputs";

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
    paddingHorizontal: 24,
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

export default ({
  activeInput,
  to,
  from,
  hash,
  imageStyle,
  onFromFocus,
  onToFocus,
  onSetSearch,
  onClearActiveInput,
  onSwitchPress,
  onSwitchPressIn,
  onSwitchPressOut
}) => {
  const gradient = gradients[hash % gradients.length];

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
                style={imageStyle}
              />
            }
          />
        }
      >
        <Image style={maskStyles.image} source={gradient} />
      </MaskedViewIOS>
      <Layout
        topInput={
          <Input
            active={activeInput === inputs.FROM}
            style={inputStyles.input}
            value={from}
            placeholder="From"
            onChangeText={onSetSearch}
            onFocus={onFromFocus}
            onBlur={onClearActiveInput}
          />
        }
        bottomInput={
          <Input
            active={activeInput === inputs.TO}
            style={inputStyles.input}
            value={to}
            placeholder="To"
            onChangeText={onSetSearch}
            onFocus={onToFocus}
            onBlur={onClearActiveInput}
          />
        }
        attachment={
          <TouchableWithoutFeedback
            onPressIn={onSwitchPressIn}
            onPressOut={onSwitchPressOut}
            onPress={onSwitchPress}
          >
            <View style={inputStyles.switchPlaceholder} />
          </TouchableWithoutFeedback>
        }
      />
    </View>
  );
};
