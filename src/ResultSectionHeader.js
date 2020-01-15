import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {monthNames} from './util';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: '600',
    color: '#BABABA',
  },
});

export default ({section}) => {
  const dateObj = new Date(section.timestamp);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {dateObj.getDate()} {monthNames[dateObj.getMonth()]}{' '}
        {dateObj.getFullYear()}
      </Text>
    </View>
  );
};
