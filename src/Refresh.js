import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { LiveResultsConsumer, fetchStatus } from "./LiveResults";

const refreshDimensions = Image.resolveAssetSource(
  require("../assets/Refresh.png")
);

const styles = StyleSheet.create({
  image: {
    position: "absolute",
    top: "50%",
    right: 0,
    marginTop: Math.floor(-refreshDimensions.height / 2)
  },
  text: {
    marginRight: refreshDimensions.width + 6,
    color: "#BABABA",
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.7
  }
});

export default ({ style, now }) => (
  <LiveResultsConsumer>
    {props => {
      if (props.fetchStatus === fetchStatus.UNAVAILABLE) return null;

      let text;
      switch (props.fetchStatus) {
        case fetchStatus.NOT_FETCHING:
          if (props.lastFetch != null) {
            const MIN = 60 * 1000;
            const minutesAgo = Math.max(
              Math.round((now - props.lastFetch) / MIN),
              0
            );
            if (minutesAgo === 0) {
              text = "JUST NOW";
            } else if (minutesAgo === 1) {
              text = "1 MIN AGO";
            } else {
              text = `${minutesAgo} MINS AGO`;
            }
          } else {
            text = "REFRESH";
          }
          break;
        case fetchStatus.IN_PROGRESS:
          text = "REFRESHING…";
          break;
        case fetchStatus.FAILED:
          text = "FAILED";
          break;
        default:
          return null;
      }

      return (
        <TouchableOpacity style={style} onPress={props.fetchLiveResults}>
          <Image
            style={styles.image}
            source={require("../assets/Refresh.png")}
          />
          <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
      );
    }}
  </LiveResultsConsumer>
);
