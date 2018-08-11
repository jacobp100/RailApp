import React from "react";
import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet
} from "react-native";
import colors from "../colors";
import Layout from "./Layout";

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
  }
});

export default ({
  to,
  from,
  hash,
  imageStyle,
  onPress,
  onPressIn,
  onPressOut
}) => {
  const color = colors[hash % colors.length];

  return (
    <View style={baseStyles.container}>
      <Layout
        topInput={
          <View style={[inputStyles.topInput, { backgroundColor: color }]}>
            <Text style={inputStyles.text}>{from}</Text>
          </View>
        }
        bottomInput={
          <View style={[inputStyles.bottomInput, { backgroundColor: color }]}>
            <Text style={inputStyles.text}>{to}</Text>
          </View>
        }
        attachment={
          <TouchableWithoutFeedback
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
          >
            <View style={{ alignSelf: "stretch", justifyContent: "center" }}>
              <Animated.Image
                source={require("../../assets/SwitchButton.png")}
                style={[imageStyle, { tintColor: color }]}
              />
            </View>
          </TouchableWithoutFeedback>
        }
      />
    </View>
  );
};
