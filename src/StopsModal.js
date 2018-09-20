import React, { Component } from "react";
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  StyleSheet,
  Dimensions
} from "react-native";
import stations from "../stations.json";
import Stops from "./Stops";

const header = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#BABABA"
  },
  text: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900"
  },
  closeContainer: {
    borderRadius: 20,
    padding: 4,
    backgroundColor: "#888"
  },
  closeImage: {
    tintColor: "white"
  }
});

const Header = ({ stops, onClose }) => (
  <View style={header.container}>
    {stops != null && stops.length > 0 ? (
      <Text style={header.text}>
        {stations[stops[0].stationId].name} to{" "}
        {stations[stops[stops.length - 1].stationId].name}
      </Text>
    ) : (
      <Text style={header.text}>Stop Information Unavailable</Text>
    )}
    <TouchableOpacity onPress={onClose}>
      <View style={header.closeContainer}>
        <Image
          source={require("../assets/Cancel.png")}
          style={header.closeImage}
        />
      </View>
    </TouchableOpacity>
  </View>
);

const stopsModal = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginVertical: 64,
    backgroundColor: "white",
    borderRadius: 12,
    flex: 1
  }
});

const scrollIndicatorInsets = { bottom: 6 };

export default class StopsModal extends Component {
  state = { visible: false, item: null };

  containerInitialTranslateY = new Animated.Value(0);
  containerTransition = new Animated.Value(0);
  backdropTransition = new Animated.Value(0);

  fadeIn = Animated.parallel([
    Animated.spring(this.containerTransition, {
      toValue: 1,
      useNativeDriver: true
    }),
    Animated.timing(this.backdropTransition, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    })
  ]);
  fadeOut = Animated.parallel([
    Animated.timing(this.containerTransition, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }),
    Animated.timing(this.backdropTransition, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    })
  ]);

  backdropStyle = [
    StyleSheet.absoluteFill,
    {
      backgroundColor: "black",
      opacity: this.backdropTransition.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5]
      })
    }
  ];

  containerStyle = [
    stopsModal.container,
    {
      opacity: this.containerTransition,
      transform: [
        {
          translateY: Animated.multiply(
            Animated.subtract(1, this.containerTransition),
            this.containerInitialTranslateY
          )
        },
        { scaleY: this.containerTransition }
      ]
    }
  ];

  show({ item, midY }) {
    const win = Dimensions.get("window");
    const dy = midY - win.height / 2;
    this.containerInitialTranslateY.setValue(dy);
    this.setState({ visible: true, item }, () => {
      this.fadeIn.start();
    });
  }

  hide = () => {
    this.fadeOut.start(() => {
      this.setState({ visible: false });
    });
  };

  render() {
    const { item } = this.state;
    return (
      <Modal visible={this.state.visible} transparent>
        <Animated.View style={this.backdropStyle} />
        <Animated.View style={this.containerStyle}>
          {item != null && (
            <React.Fragment>
              <Header stops={item.stops} onClose={this.hide} />
              <ScrollView
                automaticallyAdjustContentInsets={false}
                scrollIndicatorInsets={scrollIndicatorInsets}
              >
                <Stops now={this.props.now} stops={item.stops} />
              </ScrollView>
            </React.Fragment>
          )}
        </Animated.View>
      </Modal>
    );
  }
}
