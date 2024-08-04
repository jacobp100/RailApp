import React, {Component} from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import stations from '../stations.json';
import Stops from './Stops';
import {ServiceStatusEmblem, delayedByProps} from './ServiceStatus';
import {serviceStatus} from './resultUtil';

const header = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#BABABA',
  },
  text: {
    flex: 1,
    marginLeft: 18,
    marginVertical: 9,
    fontSize: 18,
    fontWeight: '900',
  },
  closeTouchable: {
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  closeBackground: {
    borderRadius: 20,
    padding: 4,
    backgroundColor: '#888',
  },
  closeImage: {
    tintColor: 'white',
  },
});

const Header = ({stops, onClose}) => (
  <View style={header.container}>
    {stops != null && stops.length > 0 ? (
      <Text style={header.text}>
        {stations[stops[0].stationId].name} to{' '}
        {stations[stops[stops.length - 1].stationId].name}
      </Text>
    ) : (
      <Text style={header.text}>Stop Information Unavailable</Text>
    )}
    <TouchableOpacity style={header.closeTouchable} onPress={onClose}>
      <View style={header.closeBackground}>
        <Image
          source={require('../assets/Cancel.png')}
          style={header.closeImage}
        />
      </View>
    </TouchableOpacity>
  </View>
);

const footer = {
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#F2F2F2',
    borderColor: '#BABABA',
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  copy: {
    flex: 1,
    fontSize: 10,
    color: '#8C8C8C',
    marginLeft: 9,
  },
};

const FooterCopy = props => {
  switch (props.serviceStatus.type) {
    case serviceStatus.OFFLINE:
      return (
        <Text style={footer.copy}>
          This is an offline result. This could mean you’re offline or the
          service is too far away from the current time to check for live
          results. Note that if there is strike action, the service is unlikely
          to be running.
        </Text>
      );
    case serviceStatus.ON_TIME:
      return <Text style={footer.copy}>This service is on time</Text>;
    case serviceStatus.DELAYED_BY:
      return (
        <Text style={footer.copy}>
          This service is delayed by {delayedByProps(props).by} minutes
        </Text>
      );
    case serviceStatus.DELAYED:
      return <Text style={footer.copy}>This service is delayed</Text>;
    case serviceStatus.CANCELLED:
      return <Text style={footer.copy}>This service is cancelled</Text>;
    default:
      return null;
  }
};

const Footer = props => (
  <View style={footer.container}>
    <ServiceStatusEmblem {...props} />
    <FooterCopy {...props} />
  </View>
);

const stopsModal = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginVertical: 64,
    backgroundColor: 'white',
    borderRadius: 12,
    flex: 1,
    overflow: 'hidden',
  },
});

export default class StopsModal extends Component {
  state = {visible: false, item: null};

  containerInitialTranslateY = new Animated.Value(0);
  containerTransition = new Animated.Value(0);
  backdropTransition = new Animated.Value(0);

  fadeIn = Animated.parallel(
    [
      Animated.spring(this.containerTransition, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(this.backdropTransition, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ],
    {stopTogether: false},
  );
  fadeOut = Animated.parallel(
    [
      Animated.timing(this.containerTransition, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(this.backdropTransition, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ],
    {stopTogether: false},
  );

  backdropStyle = [
    StyleSheet.absoluteFill,
    {
      backgroundColor: 'black',
      opacity: this.backdropTransition.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  ];

  containerStyle = [
    stopsModal.container,
    {
      opacity: this.containerTransition,
      transform: [
        {
          translateY: Animated.multiply(
            Animated.subtract(1, this.containerTransition),
            this.containerInitialTranslateY,
          ),
        },
        {scaleY: this.containerTransition},
      ],
    },
  ];

  show({item, midY}) {
    const win = Dimensions.get('window');
    const dy = midY - win.height / 2;
    this.containerInitialTranslateY.setValue(dy);
    this.setState({visible: true, item}, () => {
      this.fadeIn.start();
    });
  }

  hide = () => {
    this.fadeOut.start(() => {
      this.setState({visible: false}, () => {
        this.containerTransition.setValue(0);
        this.backdropTransition.setValue(0);
      });
    });
  };

  render() {
    const {item} = this.state;
    return (
      <Modal visible={this.state.visible} transparent>
        <Animated.View style={this.backdropStyle} />
        <Animated.View style={this.containerStyle}>
          {item != null && (
            <React.Fragment>
              <Header stops={item.stops} onClose={this.hide} />
              <ScrollView>
                <Stops now={this.props.now} stops={item.stops} />
              </ScrollView>
              <Footer
                serviceStatus={item.serviceStatus}
                departureTimestamp={item.departureTimestamp}
              />
            </React.Fragment>
          )}
        </Animated.View>
      </Modal>
    );
  }
}
