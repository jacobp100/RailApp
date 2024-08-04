import React, {Component} from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import {LiveResultsConsumer, fetchStatus} from './LiveResults';

const refreshDimensions = Image.resolveAssetSource(
  require('../assets/Refresh.png'),
);

const styles = StyleSheet.create({
  image: {
    position: 'absolute',
    top: '50%',
    right: 0,
    marginTop: Math.floor(-refreshDimensions.height / 2),
  },
  text: {
    marginRight: refreshDimensions.width + 6,
    color: '#BABABA',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.7,
  },
});

class RefreshIcon extends Component {
  rotate = new Animated.Value(0);

  imageStyle = [
    styles.image,
    {
      transform: [
        {
          rotate: this.rotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    },
  ];

  beginRotation = Animated.loop(
    Animated.timing(this.rotate, {
      toValue: 3,
      duration: 3000,
      easing: Easing.inOut(Easing.poly(3)),
      useNativeDriver: true,
    }),
  );

  resetRotation = Animated.spring(this.rotate, {
    toValue: 0,
    useNativeDriver: true,
  });

  componentDidMount() {
    if (this.props.active) {
      this.beginRotation.start();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.active && this.props.active) {
      this.beginRotation.start();
    } else if (prevProps.active && !this.props.active) {
      this.resetRotation.start();
    }
  }

  render() {
    return (
      <Animated.Image
        style={this.imageStyle}
        source={require('../assets/Refresh.png')}
      />
    );
  }
}

export default ({style, now}) => (
  <LiveResultsConsumer>
    {props => {
      if (props.fetchStatus === fetchStatus.UNAVAILABLE) {
        return null;
      }

      let text;
      switch (props.fetchStatus) {
        case fetchStatus.NOT_FETCHING:
          if (props.lastFetch != null) {
            const MIN = 60 * 1000;
            const minutesAgo = Math.max(
              Math.round((now - props.lastFetch) / MIN),
              0,
            );
            if (minutesAgo === 0) {
              text = 'JUST NOW';
            } else if (minutesAgo === 1) {
              text = '1 MIN AGO';
            } else {
              text = `${minutesAgo} MINS AGO`;
            }
          } else {
            text = 'REFRESH';
          }
          break;
        case fetchStatus.IN_PROGRESS:
          text = 'REFRESHING…';
          break;
        case fetchStatus.FAILED:
          text = 'FAILED';
          break;
        default:
          return null;
      }

      return (
        <TouchableOpacity style={style} onPress={props.fetchLiveResults}>
          <RefreshIcon active={props.fetchStatus === fetchStatus.IN_PROGRESS} />
          <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
      );
    }}
  </LiveResultsConsumer>
);
