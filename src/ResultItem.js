import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { formatTimestampTime, formatDurationString } from "./util";
import { serviceStatus } from "./resultUtil";

export const itemHeight = 80;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    height: itemHeight,
    justifyContent: "space-between"
  },
  containerInactive: {
    // Can't put opacity here, because of separator
    backgroundColor: "#F2F2F2"
  },
  rowContainer: {
    flexDirection: "row"
  },
  rowContainerInactive: {
    opacity: 0.5
  },
  time: {
    marginRight: 9,
    fontWeight: "500",
    fontVariant: ["tabular-nums"]
  },
  timeFucked: {
    color: "#EA2027"
  },
  platform: {
    color: "#BABABA",
    fontSize: 9
  },
  journeyTimeValue: {
    fontWeight: "700"
  },
  journeyTimeUnit: {
    marginLeft: 3,
    fontWeight: "900",
    fontSize: 9,
    letterSpacing: 0.3
  },
  locationPlatformContainer: {
    flex: 1
  },
  journeyTimeContainer: {
    flexDirection: "row",
    alignItems: "baseline"
  },
  arrivalPlatformStatusContainer: {
    flexDirection: "row",
    alignItems: "baseline"
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

const emblemBase = {
  width: 10,
  height: 10,
  borderRadius: 5
};

const service = StyleSheet.create({
  offlineIcon: {
    top: 2,
    marginLeft: "auto"
  },
  onTimeEmblem: {
    ...emblemBase,
    marginLeft: "auto",
    backgroundColor: "#A3CB38"
  },
  delayedTitleContainer: {
    flexDirection: "row"
  },
  delayedEmblem: {
    ...emblemBase,
    backgroundColor: "#EA2027"
  },
  delayedTitle: {
    marginLeft: "auto",
    marginRight: 6,
    fontSize: 9,
    color: "#EA2027"
  }
});

export const separatorTypes = {
  NONE: 0,
  DEFAULT: 1,
  CURRENT_TIME: 2
};

const fuckedTypes = new Set([
  serviceStatus.DELAYED_BY,
  serviceStatus.DELAYED,
  serviceStatus.CANCELLED
]);
const isFucked = ({ type }) => fuckedTypes.has(type);

const ServiceStatus = props => {
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
      const by = Math.floor(
        (props.serviceStatus.until - props.departureTimestamp) / 6000
      );
      return (
        <React.Fragment>
          <Text style={service.delayedTitle}>{by} mins late</Text>
          <View style={service.delayedEmblem} />
        </React.Fragment>
      );
    }
    case serviceStatus.DELAYED:
      return (
        <React.Fragment>
          <Text style={service.delayedTitle}>Delayed</Text>
          <View style={service.delayedEmblem} />
        </React.Fragment>
      );
    case serviceStatus.CANCELLED:
      return (
        <React.Fragment>
          <Text style={service.delayedTitle}>Cancelled</Text>
          <View style={service.delayedEmblem} />
        </React.Fragment>
      );
    default:
      return null;
  }
};

// const Row = ({
//   timestamp,
//   station,
//   platform,
//   serviceStatus,
//   lowerAttachment
// }) => (
//   <View
//     style={StyleSheet.compose(
//       styles.rowContainer,
//       departed && styles.rowContainerInactive
//     )}
//   >
//     <Text
//       style={StyleSheet.compose(
//         styles.time,
//         !departed && isFucked(serviceStatus) && styles.timeFucked
//       )}
//     >
//       {formatTimestampTime(timestamp)}
//     </Text>
//     <View style={styles.locationPlatformContainer}>
//       <Text>{station}</Text>
//       <View style={styles.arrivalPlatformStatusContainer}>
//         <Text style={styles.platform}>
//           {platform
//             ? `Platform ${platform} (to be confirmed)`
//             : "No platform information"}
//         </Text>
//         {lowerAttachment}
//       </View>
//       {upperAttachment}
//     </View>
//   </View>
// );

export default ({
  to,
  from,
  departureTimestamp,
  arrivalTimestamp,
  departurePlatform,
  arrivalPlatform,
  serviceStatus,
  departed,
  separatorType
}) => (
  <View
    style={StyleSheet.compose(
      styles.container,
      departed && styles.containerInactive
    )}
  >
    {separatorType === separatorTypes.CURRENT_TIME ? (
      <View style={[separator.container, separator.currentTime]} />
    ) : separatorType === separatorTypes.DEFAULT ? (
      <View style={separator.container}>
        <Text style={separator.timePlaceholder}>00:00</Text>
        <View style={separator.line} />
      </View>
    ) : null}
    <View
      style={StyleSheet.compose(
        styles.rowContainer,
        departed && styles.rowContainerInactive
      )}
    >
      <Text
        style={StyleSheet.compose(
          styles.time,
          !departed && isFucked(serviceStatus) && styles.timeFucked
        )}
      >
        {formatTimestampTime(departureTimestamp)}
      </Text>
      <View style={styles.locationPlatformContainer}>
        <Text>{from}</Text>
        <Text style={styles.platform}>
          {departurePlatform
            ? `Platform ${departurePlatform} (to be confirmed)`
            : "No platform information"}
        </Text>
      </View>
      <View style={styles.journeyTimeContainer}>
        <Text style={styles.journeyTimeValue}>
          {formatDurationString(departureTimestamp, arrivalTimestamp)}
        </Text>
        <Text style={styles.journeyTimeUnit}>MIN</Text>
      </View>
    </View>
    <View
      style={StyleSheet.compose(
        styles.rowContainer,
        departed && styles.rowContainerInactive
      )}
    >
      <Text
        style={StyleSheet.compose(
          styles.time,
          !departed && isFucked(serviceStatus) && styles.timeFucked
        )}
      >
        {formatTimestampTime(arrivalTimestamp)}
      </Text>
      <View style={styles.locationPlatformContainer}>
        <Text>{to}</Text>
        <View style={styles.arrivalPlatformStatusContainer}>
          <Text style={styles.platform}>
            {arrivalPlatform
              ? `Platform ${arrivalPlatform} (to be confirmed)`
              : "No platform information"}
          </Text>
          <ServiceStatus
            serviceStatus={serviceStatus}
            departureTimestamp={departureTimestamp}
          />
        </View>
      </View>
    </View>
  </View>
);
