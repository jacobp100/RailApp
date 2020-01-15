import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 36,
    paddingVertical: 48,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
    color: '#8C8C8C',
    fontSize: 18,
  },
  body: {
    textAlign: 'center',
    color: '#8C8C8C',
    fontSize: 12,
  },
});

export default ({title, body}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.body}>{body}</Text>
  </View>
);
