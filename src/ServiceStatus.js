import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { serviceStatus } from "./resultUtil";

const emblemBase = {
  top: 1,
  width: 10,
  height: 10,
  borderRadius: 5
};

const delayTitleBase = {
  marginRight: 6,
  fontSize: 9
};

const service = StyleSheet.create({
  offlineIcon: {
    marginLeft: "auto"
  },
  onTimeEmblem: {
    ...emblemBase,
    backgroundColor: "#A3CB38"
  },
  slightlyDelayedEmblem: {
    ...emblemBase,
    backgroundColor: "#FFC312"
  },
  slightlyDelayedTitle: {
    ...delayTitleBase,
    color: "#F79F1F"
  },
  delayedEmblem: {
    ...emblemBase,
    backgroundColor: "#EA2027"
  },
  delayedTitle: {
    ...delayTitleBase,
    color: "#EA2027"
  }
});

const slightDelay = 5;

export const delayedByProps = props => {
  const by = Math.floor(
    (props.serviceStatus.until - props.departureTimestamp) / (60 * 1000)
  );
  const isSlight = by < slightDelay;
  return { by, isSlight };
};

export const ServiceStatusEmblem = props => {
  switch (props.serviceStatus.type) {
    case serviceStatus.OFFLINE:
      return (
        <Image
          style={service.offlineIcon}
          source={require("../assets/Offline.png")}
        />
      );
    case serviceStatus.ON_TIME:
      return <View style={service.onTimeEmblem} />;
    case serviceStatus.DELAYED_BY: {
      const emblem = delayedByProps(props).isSlight
        ? service.slightlyDelayedEmblem
        : service.delayedEmblem;
      return <View style={emblem} />;
    }
    case serviceStatus.DELAYED:
      return <View style={service.delayedEmblem} />;
    case serviceStatus.CANCELLED:
      return <View style={service.delayedEmblem} />;
    default:
      return null;
  }
};

export const ServiceStatusTitle = props => {
  switch (props.serviceStatus.type) {
    case serviceStatus.OFFLINE:
      return null;
    case serviceStatus.ON_TIME:
      return null;
    case serviceStatus.DELAYED_BY: {
      const { by, isSlight } = delayedByProps(props);
      const title = isSlight
        ? service.slightlyDelayedTitle
        : service.delayedTitle;
      return <Text style={title}>{by} mins late</Text>;
    }
    case serviceStatus.DELAYED:
      return <Text style={service.delayedTitle}>Delayed</Text>;
    case serviceStatus.CANCELLED:
      return <Text style={service.delayedTitle}>Cancelled</Text>;
    default:
      return null;
  }
};
