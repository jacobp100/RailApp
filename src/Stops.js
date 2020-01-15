import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import stations from '../stations.json';
import {formatTimestampTime} from './util';
import {departureStatus} from './resultUtil';

const lozengeBase = {
  bar: {
    flex: 1,
    width: 4,
  },
  roundel: {
    marginVertical: -2,
    width: 14,
    height: 14,
    borderWidth: 4,
    borderRadius: 14,
    zIndex: 1,
  },
};

const inactiveColor = '#BABABA';
const activeColor = '#286FB3';
const lozenge = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  barInactive: {
    ...lozengeBase.bar,
    backgroundColor: inactiveColor,
  },
  roundelInactive: {
    ...lozengeBase.roundel,
    borderColor: inactiveColor,
  },
  barActive: {
    ...lozengeBase.bar,
    backgroundColor: activeColor,
  },
  roundelActive: {
    ...lozengeBase.roundel,
    borderColor: activeColor,
  },
});

const Lozenge = ({arrived}) => (
  <View style={lozenge.container}>
    <View style={arrived ? lozenge.barActive : lozenge.barInactive} />
    <View style={arrived ? lozenge.roundelActive : lozenge.roundelInactive} />
    <View style={arrived ? lozenge.barActive : lozenge.barInactive} />
  </View>
);

const stopItem = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 12,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    marginVertical: 4,
  },
  titleContainer: {
    flexDirection: 'row',
  },
  offlineIcon: {
    top: 5,
    marginLeft: 'auto',
  },
  time: {
    fontSize: 10,
    color: inactiveColor,
  },
});

const StopItem = ({stop, arrived}) => (
  <View style={stopItem.container}>
    <Lozenge arrived={arrived} />
    <View style={stopItem.detailsContainer}>
      <View style={stopItem.titleContainer}>
        <Text>{stations[stop.stationId].name}</Text>
        {stop.departureStatus === departureStatus.UNKNOWN && (
          <Image
            style={stopItem.offlineIcon}
            source={require('../assets/Offline.png')}
          />
        )}
      </View>
      <Text style={stopItem.time}>
        {formatTimestampTime(stop.arrivalTimestamp)}
      </Text>
    </View>
  </View>
);

const findLastIndex = (fn, array) => {
  for (let i = array.length - 1; i >= 0; i -= 1) {
    if (fn(array[i])) return i;
  }
  return -1;
};

export default ({now, stops}) => {
  if (stops == null) return null;

  let departedIndex = findLastIndex(
    s => s.departureStatus === departureStatus.DEPARTED,
    stops,
  );
  if (departedIndex === -1) {
    departedIndex = findLastIndex(
      s =>
        s.departureStatus === departureStatus.UNKNOWN &&
        s.departureTimestamp <= now,
      stops,
    );
  }

  /* eslint-disable react/no-array-index-key */
  return (
    <React.Fragment>
      {stops.map((stop, index) => (
        <StopItem key={index} stop={stop} arrived={index <= departedIndex} />
      ))}
    </React.Fragment>
  );
};
