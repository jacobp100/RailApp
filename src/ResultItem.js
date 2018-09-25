import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet
} from "react-native";
import { formatTimestampTime, formatDurationString } from "./util";
import { serviceStatus } from "./resultUtil";

const screenSize = Dimensions.get("screen");
const aspectRatio =
  Math.max(screenSize.width, screenSize.height) /
  Math.min(screenSize.width, screenSize.height);
// Any devices with notches
const isTallDevice = aspectRatio > 16 / 9 + 0.1;

const styles = StyleSheet.create({
  container: {
    paddingVertical: isTallDevice ? 12 : 9,
    paddingHorizontal: 12
  },
  containerInactive: {
    // Can't put opacity here, because of separator
    backgroundColor: "#F2F2F2"
  },
  firstRow: {
    marginBottom: isTallDevice ? 6 : 4
  }
});

const separator = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "stretch"
  },
  timePlaceholder: {
    paddingLeft: 12,
    paddingRight: 9,
    fontVariant: ["tabular-nums"],
    opacity: 0
  },
  line: {
    flex: 1,
    backgroundColor: "#F2F2F2"
  },
  currentTime: {
    backgroundColor: "#286FB3"
  }
});

const time = StyleSheet.create({
  base: {
    marginRight: 9,
    fontWeight: "500",
    fontVariant: ["tabular-nums"]
  },
  delayedCancelled: {
    color: "#EA2027"
  },
  timePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    marginRight: 9,
    textAlign: "center"
  },
  hidden: {
    opacity: 0
  }
});

const journeyTime = StyleSheet.create({
  value: {
    fontWeight: "700"
  },
  unit: {
    marginLeft: 3,
    fontWeight: "900",
    fontSize: 9,
    letterSpacing: 0.3
  },
  container: {
    flexDirection: "row",
    alignItems: "baseline"
  }
});

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
  container: {
    alignSelf: "flex-end",
    flexDirection: "row"
  },
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

const row = StyleSheet.create({
  container: {
    flexDirection: "row"
  },
  containerInactive: {
    opacity: 0.5
  },
  platform: {
    color: "#BABABA",
    fontSize: 9
  },
  locationPlatformContainer: {
    flex: 1
  },
  platformStatusContainer: {
    flexDirection: "row",
    alignItems: "baseline"
  }
});

export const separatorTypes = {
  NONE: 0,
  DEFAULT: 1,
  CURRENT_TIME: 2
};

const delayedCancelledTypes = new Set([
  serviceStatus.DELAYED_BY,
  serviceStatus.DELAYED,
  serviceStatus.CANCELLED
]);
const isDelayedCancelled = ({ type }) => delayedCancelledTypes.has(type);

const Time = ({ value, departed }) =>
  Number.isFinite(value) ? (
    <Text
      style={StyleSheet.compose(
        time.base,
        !departed && isDelayedCancelled(serviceStatus) && time.delayedCancelled
      )}
    >
      {formatTimestampTime(value)}
    </Text>
  ) : (
    <View>
      <Text style={[time.base, time.hidden]}>00:00</Text>
      <Text style={time.timePlaceholder}>—</Text>
    </View>
  );

const JourneyTime = ({ departureTimestamp, arrivalTimestamp }) => (
  <View style={journeyTime.container}>
    <Text style={journeyTime.value}>
      {Number.isFinite(arrivalTimestamp - departureTimestamp)
        ? formatDurationString(departureTimestamp, arrivalTimestamp)
        : "?"}
    </Text>
    <Text style={journeyTime.unit}>MIN</Text>
  </View>
);

const ServiceStatus = props => {
  switch (props.serviceStatus.type) {
    case serviceStatus.OFFLINE:
      return (
        <View style={service.container}>
          <Image
            style={service.offlineIcon}
            source={require("../assets/Offline.png")}
          />
        </View>
      );
    case serviceStatus.ON_TIME:
      return (
        <View style={service.container}>
          <View style={service.onTimeEmblem} />
        </View>
      );
    case serviceStatus.DELAYED_BY: {
      const by = Math.floor(
        (props.serviceStatus.until - props.departureTimestamp) / (60 * 1000)
      );
      const isSlight = by < 5;
      const title = isSlight
        ? service.slightlyDelayedTitle
        : service.delayedTitle;
      const emblem = isSlight
        ? service.slightlyDelayedEmblem
        : service.delayedEmblem;
      return (
        <View style={service.container}>
          <Text style={title}>{by} mins late</Text>
          <View style={emblem} />
        </View>
      );
    }
    case serviceStatus.DELAYED:
      return (
        <View style={service.container}>
          <Text style={service.delayedTitle}>Delayed</Text>
          <View style={service.delayedEmblem} />
        </View>
      );
    case serviceStatus.CANCELLED:
      return (
        <View style={service.container}>
          <Text style={service.delayedTitle}>Cancelled</Text>
          <View style={service.delayedEmblem} />
        </View>
      );
    default:
      return null;
  }
};

const Row = ({ style, station, timestamp, platform, departed, attachment }) => (
  <View
    style={
      style != null || departed
        ? [row.container, departed && row.containerInactive, style]
        : row.container
    }
  >
    <Time value={timestamp} departed={departed} />
    <View style={row.locationPlatformContainer}>
      <Text>{station || "—"}</Text>
      <Text style={row.platform}>
        {platform == null
          ? "No platform information"
          : platform.confirmed
            ? `Platform ${platform.name}`
            : `Platform ${platform.name} (to be confirmed)`}
      </Text>
    </View>
    {attachment}
  </View>
);

const Separator = ({ type }) =>
  type === separatorTypes.CURRENT_TIME ? (
    <View style={[separator.container, separator.currentTime]} />
  ) : type === separatorTypes.DEFAULT ? (
    <View style={separator.container}>
      <Text style={separator.timePlaceholder}>00:00</Text>
      <View style={separator.line} />
    </View>
  ) : null;

export default class ResultItem extends React.Component {
  container = React.createRef();

  onPress = () => {
    this.container.current.measureInWindow((x, y, width, height) => {
      const { item } = this.props;
      const midY = y + height / 2;
      this.props.onPress({ item, midY });
    });
  };

  render() {
    const {
      to,
      from,
      departureTimestamp,
      arrivalTimestamp,
      departurePlatform,
      arrivalPlatform,
      serviceStatus,
      departed,
      separatorType
    } = this.props;

    return (
      <View ref={this.container}>
        <Separator type={separatorType} />
        <TouchableOpacity
          style={StyleSheet.compose(
            styles.container,
            departed && styles.containerInactive
          )}
          onPress={this.onPress}
        >
          <Row
            style={styles.firstRow}
            station={from}
            timestamp={departureTimestamp}
            platform={departurePlatform}
            departed={departed}
            serviceStatus={serviceStatus}
            attachment={
              <JourneyTime
                departureTimestamp={departureTimestamp}
                arrivalTimestamp={arrivalTimestamp}
              />
            }
          />
          <Row
            station={to}
            timestamp={arrivalTimestamp}
            platform={arrivalPlatform}
            departed={departed}
            serviceStatus={serviceStatus}
            attachment={
              <ServiceStatus
                serviceStatus={serviceStatus}
                departureTimestamp={departureTimestamp}
              />
            }
          />
        </TouchableOpacity>
      </View>
    );
  }
}
