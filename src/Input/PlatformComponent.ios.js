import React from "react";
import {
  View,
  Text,
  Image,
  MaskedViewIOS,
  TouchableWithoutFeedback,
  Animated,
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

export default ({
  to,
  from,
  hash,
  imageStyle,
  onPress,
  onPressIn,
  onPressOut
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
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
          >
            <View style={inputStyles.switchPlaceholder} />
          </TouchableWithoutFeedback>
        }
      />
    </View>
  );
};
