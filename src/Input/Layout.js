import React from 'react';
import {View, StyleSheet} from 'react-native';

const layoutStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    marginRight: 12,
  },
});

export default ({style, topInput, bottomInput, attachment}) => (
  <View style={StyleSheet.compose(layoutStyles.container, style)}>
    <View style={layoutStyles.inputContainer}>
      {topInput}
      {bottomInput}
    </View>
    {attachment}
  </View>
);
