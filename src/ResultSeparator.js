import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: StyleSheet.hairlineWidth,
    alignItems: 'stretch',
  },
  timePlaceholder: {
    paddingLeft: 12,
    paddingRight: 9,
    fontVariant: ['tabular-nums'],
    opacity: 0,
  },
  line: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  containerCurrentTimeIndicator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#286FB3',
  },
});

export default ({indicatesCurrentTime, inactive}) =>
  indicatesCurrentTime ? (
    <View style={styles.containerCurrentTimeIndicator} />
  ) : inactive ? (
    <View style={styles.container} />
  ) : (
    <View style={styles.container}>
      <Text style={styles.timePlaceholder}>00:00</Text>
      <View style={styles.line} />
    </View>
  );
