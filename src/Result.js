import React, {Component} from "react";
import {Platform, StyleSheet, Text, View} from "react-native";

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 9,
    paddingHorizontal: 12
  },
  rowContainer: {
    flexDirection: "row"
  },
  time: {
    textAlign: "left",
    color: "#333333",
    marginBottom: 5,
    paddingRight: 9,
    fontWeight: "500"
  },
  location: {
    textAlign: "left",
    color: "#333333"
  },
  platform: {
    textAlign: "left",
    color: "#BABABA",
    marginBottom: 5,
    fontSize: 9
  },
  journeyTimeVal: {
    fontWeight: "900"
  },
  journeyTimeText: {
    fontWeight: "900",
    fontSize: 10
  },
  locationPlatformContainer: {
    flex: 1
  },
  journetTimeContainer: {
    flexDirection: "row",
    alignItems: "baseline"
  }
});


const timeFormatter = (minuesPastMidnight) => {
  const hours = String(Math.floor(minuesPastMidnight / 60)).padStart(2, "0")
  const minutes = String(minuesPastMidnight % 60).padStart(2, "0")
  return hours + ":" + minutes
};

const calcJourneyTime = (departureTime, arrivalTime) => {
  let journeyTime = arrivalTime - departureTime
  if (journeyTime < 0) {
    journeyTime = calcJourneyTime(departureTime, arrivalTime + (60 * 24))
  }
  return journeyTime
};

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <Text style={styles.time}>{timeFormatter(this.props.departureTime)}</Text>
          <View style={styles.locationPlatformContainer}>
            <Text style={styles.location}>{this.props.from}</Text>
            <Text style={styles.platform}>Platform 9 (to be confirmed)</Text>
          </View>
          <View style={styles.journetTimeContainer}>
            <Text
              style={styles.journeyTimeVal}>{calcJourneyTime(this.props.departureTime,   this.props.arrivalTime)}</Text>
            <Text style={styles.journeyTimeText}>MIN</Text>
          </View>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.time}>{timeFormatter(this.props.arrivalTime)}</Text>
          <View style={styles.locationPlatformContainer}>
            <Text style={styles.location}>{this.props.to}</Text>
            <Text style={styles.platform}>Platform 1 (to be confirmed)</Text>
          </View>
        </View>
      </View>
    );
  }
}
