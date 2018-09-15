import React, { Component } from "react";
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet
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
  backdrop: {
    backgroundColor: "#0008",
    flex: 1
  },
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

  show(item) {
    this.setState({ visible: true, item });
  }

  hide = () => this.setState({ visible: false });

  render() {
    const { item } = this.state;
    return (
      <Modal visible={this.state.visible} transparent animationType="fade">
        <View style={stopsModal.backdrop}>
          <View style={stopsModal.container}>
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
          </View>
        </View>
      </Modal>
    );
  }
}
